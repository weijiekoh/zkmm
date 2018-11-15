const commonConfig = require('./build-utils/webpack.common.js');
const webpackMerge = require('webpack-merge');

module.exports = (env) => {
  if (!env || !env.env) {
    throw Error('Please provide an environment.');
  }

  const envConfig = require(`./build-utils/webpack.${env.env}.js`);
  return webpackMerge(commonConfig, envConfig);
};
