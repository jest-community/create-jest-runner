module.exports = {
  runner: require.resolve('../../runner'),
  testMatch: ['**/__src__/**/*.js'],
  slowTestThreshold: -1, // Set this to negative so all tests are slow
};
