const config = require('./build.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const { module: { rules } } = config;

module.exports = {
  mode: process.env.NODE_ENV,
  entry: './public/index.js',
  devtool: 'source-map',
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
      template: './public/index.html',
    }),
  ],
  devServer: {
    contentBase: './dist',
  },
};
