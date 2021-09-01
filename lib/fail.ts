import type { TestResult } from '@jest/test-result';
import toTestResult from './toTestResult';
import type { Path } from './types';

interface Options {
  start: number;
  end: number;
  test: { title: string; path: Path; errorMessage?: string };
  errorMessage?: string;
}

export default function fail(options: {
  start: number;
  end: number;
  test: { title: string; path: Path; errorMessage: string };
}): TestResult;

export default function fail(options: {
  start: number;
  end: number;
  test: { title: string; path: Path };
  errorMessage: string;
}): TestResult;

export default function fail({
  start,
  end,
  test,
  errorMessage,
}: Options): TestResult {
  // TODO: Currently the `fail` function allows 2 ways to pass an error message.
  // Both methods are currently in used by downstream packages.
  // The current behaviour is to favour `errorMessage` over `test.errorMessage`.
  const actualErrorMessage = errorMessage || test.errorMessage;

  return toTestResult({
    errorMessage: actualErrorMessage,
    stats: {
      failures: 1,
      pending: 0,
      passes: 0,
      todo: 0,
      start,
      end,
    },
    skipped: false,
    tests: [
      { duration: end - start, ...test, errorMessage: actualErrorMessage },
    ],
    jestTestPath: test.path,
  });
}
