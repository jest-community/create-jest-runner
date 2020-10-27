// Common type aliases for better code readability

import type {
  Config as JestConfig,
  TestResult as JestTestResult,
} from '@jest/types';
import type * as JestRunner from 'jest-runner';

export type Milliseconds = JestTestResult.Milliseconds;
export type Path = JestConfig.Path;

export interface TestDetail {
  title: string;
  path: Path;
}

export interface CreateRunnerOptions<
  ExtraOptionsType extends Record<string, unknown>,
> {
  getExtraOptions?: () => ExtraOptionsType;
}

// Copied and adapted from https://github.com/facebook/jest/blob/2dafb09d51584d3785f3280f569784ec4334b5d8/packages/jest-runner/src/index.ts#L48-L285
export declare abstract class TestRunner {
  readonly _globalConfig: JestConfig.GlobalConfig;

  readonly _context: JestRunner.TestRunnerContext;

  constructor(
    globalConfig: JestConfig.GlobalConfig,
    context?: JestRunner.TestRunnerContext,
  );

  runTests(
    tests: Array<JestRunner.Test>,
    watcher: JestRunner.TestWatcher,
    onStart: JestRunner.OnTestStart,
    onResult: JestRunner.OnTestSuccess,
    onFailure: JestRunner.OnTestFailure,
    options: JestRunner.TestRunnerOptions,
  ): Promise<void>;

  _createInBandTestRun(
    tests: Array<JestRunner.Test>,
    watcher: JestRunner.TestWatcher,
    onStart: JestRunner.OnTestStart,
    onResult: JestRunner.OnTestSuccess,
    onFailure: JestRunner.OnTestFailure,
    options: JestRunner.TestRunnerOptions,
  ): Promise<void>;

  _createParallelTestRun(
    tests: Array<JestRunner.Test>,
    watcher: JestRunner.TestWatcher,
    onStart: JestRunner.OnTestStart,
    onResult: JestRunner.OnTestSuccess,
    onFailure: JestRunner.OnTestFailure,
    options: JestRunner.TestRunnerOptions,
  ): Promise<void>;
}
