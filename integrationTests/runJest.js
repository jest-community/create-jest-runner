const path = require('path');
// eslint-disable-next-line import-x/no-extraneous-dependencies
const execa = require('execa');
// eslint-disable-next-line import-x/no-extraneous-dependencies
const stripAnsi = require('strip-ansi');

const rootDir = path.resolve(__dirname, '..');

const normalize = output =>
  stripAnsi(output)
    .replace(/\d*\.?\d+ m?s\b/g, '')
    .replace(/, estimated/g, '')
    .replace(new RegExp(rootDir, 'g'), '/mocked-path-to-jest-runner-mocha')
    .replace(/.*at .*\n/g, 'mocked-stack-trace')
    .replace(/.*at .*\\n/g, 'mocked-stack-trace')
    .replace(/(mocked-stack-trace)+/, '      at mocked-stack-trace')
    .replace(/\s+\n/g, '\n')
    // https://github.com/facebook/jest/blob/a8addf8e22ef74b2ff3a139ece098604ec46b6e7/packages/jest-util/src/specialChars.ts#L11-L16
    .replace(/\u00D7/g, '\u2715')
    .replace(/\u221A/g, '\u2713');

const runJest = (project, options = []) => {
  jest.setTimeout(15000);
  return execa(
    'jest',
    [
      '--useStderr',
      '--no-watchman',
      '--no-cache',
      '--projects',
      path.join(__dirname, '__fixtures__', project),
    ].concat(options),
    {
      env: process.env,
      reject: false,
    },
  ).then(({ stdout, stderr }) => `${normalize(stderr)}\n${normalize(stdout)}`);
};

module.exports = runJest;
