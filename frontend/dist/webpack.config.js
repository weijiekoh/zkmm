"use strict";
var commonConfig = require('./build-utils/webpack.common.js');
var webpackMerge = require('webpack-merge');
module.exports = function (env) {
    if (!env || !env.env) {
        throw Error('Please provide an environment.');
    }
    var envConfig = require("./build-utils/webpack." + env.env + ".js");
    return webpackMerge(commonConfig, envConfig);
};
//# sourceMappingURL=webpack.config.js.map