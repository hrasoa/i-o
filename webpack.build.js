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
            [
              '@babel/preset-env', {
                targets: {
                  browsers: ['last 2 versions', 'safari >= 7'],
                },
              },
            ],
            '@babel/preset-stage-3',
          ],
        },
      },
    ],
  },
  output: {
    filename: 'io.js',
    library: 'Io',
    libraryTarget: 'umd',
    path: path.resolve(__dirname, 'dist'),
  },
};
