const path = require('path');

module.exports = {
  rootDir: path.resolve(__dirname, '../'),
  transform: {
    '\\.js$': path.resolve(__dirname, 'babelTransformer.js'),
  },
  collectCoverage: true,
  // coverageReporters: ['html'],
  // coverageDirectory: path.resolve(__dirname, '../__tests__/coverage'),
};
