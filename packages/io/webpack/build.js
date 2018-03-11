const path = require('path');

module.exports = {
  mode: 'production',
  entry: {
    io: './src/index.js',
    'io.polyfill': [
      'intersection-observer',
      './src/index.js',
    ],
  },
  stats: {
    colors: true,
    modules: false,
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
    ],
  },
  output: {
    filename: '[name].js',
    library: 'Io',
    libraryTarget: 'umd',
    libraryExport: 'default',
    path: path.resolve(__dirname, '../dist'),
  },
};
