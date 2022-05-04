import type { TestContext, TestResult } from '@jest/test-result';
import type { Config, TestRunnerOptions } from 'jest-runner';

export interface CreateRunnerOptions<
  ExtraOptions extends Record<string, unknown>,
> {
  getExtraOptions?: () => ExtraOptions;
}

export type RunTestOptions<
  ExtraOptions extends Record<string, unknown> = Record<string, unknown>,
> = {
  config: Config.ProjectConfig;
  extraOptions: ExtraOptions;
  globalConfig: Config.GlobalConfig;
  rawModuleMap: ReturnType<TestContext['moduleMap']['getRawModuleMap']> | null;
  options: TestRunnerOptions;
  testPath: string;
};

export type RunTest<
  ExtraOptions extends Record<string, unknown> = Record<string, unknown>,
> = (options: RunTestOptions<ExtraOptions>) => TestResult | Promise<TestResult>;

export interface TestDetail {
  title: string;
  path: string;
}
