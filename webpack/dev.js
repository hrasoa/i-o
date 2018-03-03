const config = require('./build.js');

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  devServer: {
    contentBase: './dist',
  },
  module: config.module,
  plugins: config.plugins,
  output: config.output,
};
