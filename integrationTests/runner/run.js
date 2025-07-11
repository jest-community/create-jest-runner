const fs = require('fs');
const { pass, fail, skip, todo } = require('../..');

/** @type {import('../..').RunTest} */
const runTest = ({ testPath }) => {
  const start = Date.now();
  // we don't want the timestamp in the reporter result for our snapshots
  const end = start;
  const contents = fs.readFileSync(testPath, 'utf8');

  if (contents.includes('⚔️🏃')) {
    return pass({ start, end, test: { path: testPath } });
  }
  if (contents.includes('🙈')) {
    return skip({ start, end, test: { path: testPath } });
  }
  if (contents.includes('📃')) {
    return todo({ start, end, test: { path: testPath } });
  }
  const errorMessage = 'Company policies require ⚔️ 🏃 in every file';
  return fail({
    start,
    end,
    test: { path: testPath, errorMessage, title: 'Check for ⚔️ 🏃' },
  });
};

module.exports = runTest;
