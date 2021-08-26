const runJest = require('./runJest');

it('Works when it has todo tests', () =>
  expect(runJest('todo')).resolves.toMatchSnapshot());
