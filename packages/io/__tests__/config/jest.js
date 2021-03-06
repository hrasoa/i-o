const path = require('path');

module.exports = {
  rootDir: path.resolve(__dirname, '../../'),
  transform: {
    '\\.js$': path.resolve(__dirname, 'babelTransformer.js'),
  },
  modulePathIgnorePatterns: [
    'config',
  ],
  collectCoverage: true,
};
