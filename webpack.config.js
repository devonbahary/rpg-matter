const path = require('path');

module.exports = {
  mode: 'development',
  entry: {
    MatterCore: './src/matter-core/MatterCore.js',
  },
  output: {
    path: path.join(__dirname, 'rpgmakermv', 'js', 'plugins'),
    filename: '[name].js',
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