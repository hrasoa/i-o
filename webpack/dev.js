const config = require('./build.js');

module.exports = {
  ...config,
  mode: 'development',
  devtool: 'source-map',
  devServer: {
    contentBase: './dist',
  },
};
