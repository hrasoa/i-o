const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        options: {
          presets: [
            [
              '@babel/preset-env', {
                targets: {
                  browsers: ['last 2 versions'],
                },
              },
            ],
            '@babel/preset-stage-3',
          ],
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: false,
      title: 'Io',
      template: 'public/index.html',
    }),
  ],
  output: {
    filename: 'io.js',
    library: 'Io',
    libraryTarget: 'var',
    path: path.resolve(__dirname, '../dist'),
  },
};
