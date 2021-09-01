import type * as JestResult from '@jest/test-result';
import type { Config } from '@jest/types';
import type * as JestRunner from 'jest-runner';
import { Worker } from 'jest-worker';
import throat from 'throat';
import type { CreateRunnerOptions, Path, TestRunner } from './types';

class CancelRun extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'CancelRun';
  }
}

export default function createRunner<
  ExtraOptionsType extends Record<string, unknown>,
>(
  runPath: Path,
  { getExtraOptions }: CreateRunnerOptions<ExtraOptionsType> = {},
): typeof TestRunner {
  return class BaseTestRunner implements TestRunner {
    constructor(
      public readonly _globalConfig: Config.GlobalConfig,
      public readonly _context: JestRunner.TestRunnerContext = {},
    ) {}

    runTests(
      tests: Array<JestRunner.Test>,
      watcher: JestRunner.TestWatcher,
      onStart: JestRunner.OnTestStart,
      onResult: JestRunner.OnTestSuccess,
      onFailure: JestRunner.OnTestFailure,
      options: JestRunner.TestRunnerOptions,
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

    _createInBandTestRun(
      tests: Array<JestRunner.Test>,
      watcher: JestRunner.TestWatcher,
      onStart: JestRunner.OnTestStart,
      onResult: JestRunner.OnTestSuccess,
      onFailure: JestRunner.OnTestFailure,
      options: JestRunner.TestRunnerOptions,
    ): Promise<void> {
      const mutex = throat(1);
      return tests.reduce(
        (promise, test) =>
          mutex(() =>
            promise
              .then(() => {
                if (watcher.isInterrupted()) {
                  throw new CancelRun();
                }

                return onStart(test).then(() => {
                  // eslint-disable-next-line import/no-dynamic-require, global-require, @typescript-eslint/no-var-requires
                  const runner = require(runPath);
                  const baseOptions = {
                    config: test.context.config,
                    globalConfig: this._globalConfig,
                    testPath: test.path,
                    rawModuleMap: watcher.isWatchMode()
                      ? test.context.moduleMap.getRawModuleMap()
                      : null,
                    options,
                    extraOptions: getExtraOptions ? getExtraOptions() : {},
                  };

                  if (typeof runner.default === 'function') {
                    return runner.default(baseOptions);
                  }

                  return runner(baseOptions);
                });
              })
              .then(result => onResult(test, result))
              .catch(err => onFailure(test, err)),
          ),
        Promise.resolve(),
      );
    }

    _createParallelTestRun(
      tests: Array<JestRunner.Test>,
      watcher: JestRunner.TestWatcher,
      onStart: JestRunner.OnTestStart,
      onResult: JestRunner.OnTestSuccess,
      onFailure: JestRunner.OnTestFailure,
      options: JestRunner.TestRunnerOptions,
    ): Promise<void> {
      const worker = new Worker(runPath, {
        exposedMethods: ['default'],
        numWorkers: this._globalConfig.maxWorkers,
        forkOptions: { stdio: 'inherit' },
      });

      const mutex = throat(this._globalConfig.maxWorkers);

      const runTestInWorker = (test: JestRunner.Test) =>
        mutex(() => {
          if (watcher.isInterrupted()) {
            throw new CancelRun();
          }

          return onStart(test).then(() => {
            const baseOptions = {
              config: test.context.config,
              globalConfig: this._globalConfig,
              testPath: test.path,
              rawModuleMap: watcher.isWatchMode()
                ? test.context.moduleMap.getRawModuleMap()
                : null,
              options,
              extraOptions: getExtraOptions ? getExtraOptions() : {},
            };

            // @ts-expect-error -- the required module should have a default export
            return worker.default(baseOptions);
          });
        });

      const onError = (
        err: JestResult.SerializableError,
        test: JestRunner.Test,
      ) => {
        return onFailure(test, err).then(() => {
          if (err.type === 'ProcessTerminatedError') {
            // eslint-disable-next-line no-console
            console.error(
              'A worker process has quit unexpectedly! ' +
                'Most likely this is an initialization error.',
            );
            process.exit(1);
          }
        });
      };

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
            .then(testResult => onResult(test, testResult))
            .catch(error => onError(error, test)),
        ),
      );

      const cleanup = () => {
        worker.end();
      };

      return Promise.race([runAllTests, onInterrupt]).then(cleanup, cleanup);
    }
  };
}
