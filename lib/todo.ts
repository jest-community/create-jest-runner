import type { TestResult } from '@jest/test-result';
import toTestResult from './toTestResult';
import type { TestDetail } from './types';

interface Options {
  start: number;
  end: number;
  test: TestDetail;
}

export default function todo({ start, end, test }: Options): TestResult {
  return toTestResult({
    stats: {
      failures: 0,
      pending: 0,
      passes: 0,
      todo: 1,
      start,
      end,
    },
    skipped: false,
    tests: [{ duration: end - start, ...test }],
    jestTestPath: test.path,
  });
}
