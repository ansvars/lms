// config-overrides.js
const webpack = require('webpack');

module.exports = function override(config, env) {
  // Correctly add polyfill for `process` for Webpack 5
  config.plugins.push(
    new webpack.ProvidePlugin({
      process: 'process/browser', // Polyfill process for Webpack 5
    })
  );

  return config;
};
