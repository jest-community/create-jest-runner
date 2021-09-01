// eslint-disable-next-line import/extensions, import/no-unresolved -- ignore build artifact
const { createJestRunner } = require('../..');

module.exports = createJestRunner(require.resolve('./run'));
