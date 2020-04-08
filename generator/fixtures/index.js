// eslint-disable-next-line import/no-unresolved
const { createJestRunner } = require('create-jest-runner');

module.exports = createJestRunner(require.resolve('./run'));
