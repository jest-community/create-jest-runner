import { isAbsolute } from 'path';
import { fileURLToPath } from 'url';
import type { TestResult } from '@jest/test-result';
import type {
  CallbackTestRunnerInterface,
  Config,
  OnTestFailure,
  OnTestStart,
  OnTestSuccess,
  Test,
  TestRunnerOptions,
  TestWatcher,
} from 'jest-runner';
import { Worker, JestWorkerFarm } from 'jest-worker';
import pLimit from 'p-limit';
import type { CreateRunnerOptions, RunTestOptions } from './types';

function determineSlowTestResult(test: Test, result: TestResult): TestResult {
  // See: https://github.com/facebook/jest/blob/acd7c83c8365140f4ecf44a456ff7366ffa31fa2/packages/jest-runner/src/runTest.ts#L287
  if (result.perfStats.runtime / 1000 > test.context.config.slowTestThreshold) {
    return { ...result, perfStats: { ...result.perfStats, slow: true } };
  }
  return result;
}

class CancelRun extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'CancelRun';
  }
}

type TestRunner = (runTestOptions: RunTestOptions) => TestResult;

function getRunnerPath(runPath: string | URL): string {
  let path = runPath;

  if (typeof path !== 'string') {
    path = path.href;
  }

  if (path.startsWith('file://')) {
    path = fileURLToPath(path);
  } else if (!isAbsolute(path)) {
    throw new Error(`Path must be absolute - got ${path}`);
  }

  return path;
}

export default function createRunner<
  ExtraOptions extends Record<string, unknown>,
>(
  runPathStringOrUrl: string | URL,
  { getExtraOptions }: CreateRunnerOptions<ExtraOptions> = {},
) {
  const runPath = getRunnerPath(runPathStringOrUrl);

  return class BaseTestRunner implements CallbackTestRunnerInterface {
    #globalConfig: Config.GlobalConfig;

    constructor(globalConfig: Config.GlobalConfig) {
      this.#globalConfig = globalConfig;
    }

    runTests(
      tests: Array<Test>,
      watcher: TestWatcher,
      onStart: OnTestStart,
      onResult: OnTestSuccess,
      onFailure: OnTestFailure,
      options: TestRunnerOptions,
    ): Promise<void> {
      return options.serial
        ? this._createInBandTestRun(
            tests,
            watcher,
            onStart,
            onResult,
            onFailure,
            options,
          )
        : this._createParallelTestRun(
            tests,
            watcher,
            onStart,
            onResult,
            onFailure,
            options,
          );
    }

    async _createInBandTestRun(
      tests: Array<Test>,
      watcher: TestWatcher,
      onStart: OnTestStart,
      onResult: OnTestSuccess,
      onFailure: OnTestFailure,
      options: TestRunnerOptions,
    ): Promise<void> {
      const runner: TestRunner = (await import(runPath)).default;

      const mutex = pLimit(1);
      return tests.reduce(
        (promise, test) =>
          mutex(() =>
            promise
              .then(() => {
                if (watcher.isInterrupted()) {
                  throw new CancelRun();
                }

                return onStart(test).then(() => {
                  const baseOptions = {
                    config: test.context.config,
                    globalConfig: this.#globalConfig,
                    testPath: test.path,
                    rawModuleMap: watcher.isWatchMode()
                      ? test.context.moduleMap.getRawModuleMap()
                      : null,
                    options,
                    extraOptions: getExtraOptions ? getExtraOptions() : {},
                  };

                  return runner(baseOptions);
                });
              })
              .then(result => determineSlowTestResult(test, result))
              .then(result => onResult(test, result))
              .catch(err => onFailure(test, err)),
          ),
        Promise.resolve(),
      );
    }

    _createParallelTestRun(
      tests: Array<Test>,
      watcher: TestWatcher,
      onStart: OnTestStart,
      onResult: OnTestSuccess,
      onFailure: OnTestFailure,
      options: TestRunnerOptions,
    ): Promise<void> {
      const worker = new Worker(runPath, {
        exposedMethods: ['default'],
        numWorkers: this.#globalConfig.maxWorkers,
        forkOptions: { stdio: 'inherit' },
      }) as JestWorkerFarm<{ default: TestRunner }>;

      const mutex = pLimit(this.#globalConfig.maxWorkers);

      const runTestInWorker = (test: Test) =>
        mutex(() => {
          if (watcher.isInterrupted()) {
            throw new CancelRun();
          }

          return onStart(test).then(() => {
            const runTestOptions: RunTestOptions = {
              config: test.context.config,
              globalConfig: this.#globalConfig,
              testPath: test.path,
              rawModuleMap: watcher.isWatchMode()
                ? test.context.moduleMap.getRawModuleMap()
                : null,
              options,
              extraOptions: getExtraOptions ? getExtraOptions() : {},
            };

            return worker.default(runTestOptions);
          });
        });

      const onInterrupt = new Promise((_, reject) => {
        watcher.on('change', state => {
          if (state.interrupted) {
            reject(new CancelRun());
          }
        });
      });

      const runAllTests = Promise.all(
        tests.map(test =>
          runTestInWorker(test)
            .then(result => determineSlowTestResult(test, result))
            .then(testResult => onResult(test, testResult))
            .catch(error => onFailure(test, error)),
        ),
      );

      const cleanup = () => {
        worker.end();
      };

      return Promise.race([runAllTests, onInterrupt]).then(cleanup, cleanup);
    }
  };
}
