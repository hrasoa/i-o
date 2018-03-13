const path = require('path');
const config = require('./build.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const { stats, module: { rules } } = config;

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  entry: './demo/index.js',
  devtool: 'source-map',
  stats,
  module: {
    rules: rules.concat([
      {
        test: /\.css$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
        ],
      },
    ]),
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Io',
      template: './demo/index.html',
    }),
  ],
  devServer: {
    contentBase: './dist',
    stats,
  },
  output: {
    path: path.resolve(__dirname, '../dist'),
  },
};
