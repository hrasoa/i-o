const HtmlWebpackPlugin = require('html-webpack-plugin');
const config = require('./webpack.build.js');

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  devServer: {
    contentBase: './dist',
  },
  module: config.module,
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Development',
      template: 'public/index.html',
    }),
  ],
  output: {
    filename: config.output.filename,
    path: config.output.path,
  },
};
