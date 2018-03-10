const path = require('path');

module.exports = {
  mode: 'production',
  entry: {
    io: './src/index.js',
    'io.polyfill': './src/polyfill.js',
  },
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
      {
        test: /\.(png|jpg|gif)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
        },
      },
    ],
  },
  output: {
    filename: '[name].js',
    library: 'Io',
    libraryTarget: 'var',
    path: path.resolve(__dirname, '../dist'),
  },
};
