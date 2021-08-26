const runJest = require('./runJest');

it('Works when it has failing tests', () =>
  expect(runJest('failing')).resolves.toMatchSnapshot());
