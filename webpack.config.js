const webpack = require('webpack');
const path = require('path');

module.exports = env => {
  return {
    mode: 'development',
    entry: {
      MatterCore: './src/matter-core/MatterCore.js',
      MatterActionBattleSystem: './src/matter-abs/MatterActionBattleSystem.js',
      MatterABSGuard: './src/plugins/MatterABSGuard.js',
      MatterActionEvent: './src/plugins/MatterActionEvent.js',
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
    },
    plugins: [
      new webpack.DefinePlugin({
        "ENV": JSON.stringify(env.ENV),
      }),
    ],
  };
};