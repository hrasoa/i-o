const path = require('path');
const config = require('./build.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const { stats, module: { rules } } = config;

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  entry: './public/index.js',
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
      {
        test: /\.(png|jpg|gif)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
        },
      },
    ]),
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Io',
      template: './public/index.html',
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
