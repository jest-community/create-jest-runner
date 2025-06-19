const semver = require('semver');
const pkg = require('./package.json');

const supportedNodeVersion = semver.minVersion(pkg.engines.node).version;

module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: supportedNodeVersion } }],
    ['@babel/preset-typescript', { allowDeclareFields: true }],
  ],
};
