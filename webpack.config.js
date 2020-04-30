const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    path: path.join(__dirname, 'rpgmakermv', 'js', 'plugins'),
    filename: 'Matter.js',
  },
  devtool: 'inline-source-map',
  target: 'web',
  module: {
    rules: [{
      loader: 'babel-loader',
      test: /\.js$/,
      exclude: /node_modules/,
    }]
  }
};