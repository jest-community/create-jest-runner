const runJest = require('./runJest');

it('Works when it has skipped tests', () =>
  expect(runJest('skipped')).resolves.toMatchSnapshot());
