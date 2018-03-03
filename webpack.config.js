const config = require('./webpack.build.js');

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  devServer: {
    contentBase: './dist',
  },
  module: config.module,
  plugins: config.plugins,
  output: {
    filename: config.output.filename,
    path: config.output.path,
  },
};
