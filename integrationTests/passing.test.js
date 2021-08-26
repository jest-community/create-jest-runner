const runJest = require('./runJest');

it('Works when it has only passing tests', () =>
  expect(runJest('passing')).resolves.toMatchSnapshot());
