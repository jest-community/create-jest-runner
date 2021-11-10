const runJest = require('./runJest');

it('Works when it has slow tests', () =>
  expect(runJest('slow')).resolves.toMatchSnapshot());
