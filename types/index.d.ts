import { TestResult } from '@jest/test-result';
import * as TestRunner from 'jest-runner';

type Milliseconds = number;

interface TestObj extends Record<string, any> {
  path: string;
  title?: string;
  duration?: Milliseconds;
}

export function createJestRunner(
  pathToRunFile: string,
  config: { getExtraOptions: () => object },
): TestRunner;

export function fail(options: {
  start: number;
  end: number;
  test: TestObj;
  errorMessage?: string;
}): TestResult;

export function pass(options: {
  start: number;
  end: number;
  test: TestObj;
}): TestResult;

export function skip(options: {
  start: number;
  end: number;
  test: TestObj;
}): TestResult;

export function todo(options: {
  start: number;
  end: number;
  test: TestObj;
}): TestResult;

export function toTestResult(options: {
  stats: {
    failures: number;
    passes: number;
    pending: number;
    todo: number;
    end: number;
    start: number;
  };
  skipped: boolean;
  errorMessage?: string | null;
  tests: Array<{
    duration?: Milliseconds | null;
    errorMessage?: string;
    testPath?: string;
    title?: string;
  }>;
}): TestResult;
