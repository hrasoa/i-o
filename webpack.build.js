const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/io.js',
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        options: {
          presets: [
            '@babel/preset-env',
            '@babel/preset-stage-3',
          ],
        },
      },
    ],
  },
  output: {
    filename: 'io.js',
    library: 'io',
    libraryTarget: 'umd',
    path: path.resolve(__dirname, 'dist'),
  },
};
