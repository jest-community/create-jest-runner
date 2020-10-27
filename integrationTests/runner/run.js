const fs = require('fs');
// eslint-disable-next-line import/extensions, import/no-unresolved -- ignore build artifact
const { pass, fail, skip, todo } = require('../..');

module.exports = ({ testPath }) => {
  const start = Date.now();
  // we don't want the timestamp in teh reporter result for our snapshots
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
