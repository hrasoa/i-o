const config = require('./webpack.build.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  devServer: {
    contentBase: './dist',
  },
  module: config.module,
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Io',
      template: 'public/index.html',
    }),
  ],
  output: {
    filename: config.output.filename,
    path: config.output.path,
  },
};
