"use strict";
var commonPaths = require('./common-paths');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var config = {
    entry: './src/index.tsx',
    output: {
        filename: '[name].[hash:8].bundle.js',
        path: commonPaths.outputPath
    },
    resolve: {
        alias: {
            'react': 'preact-compat',
            'react-dom': 'preact-compat'
        },
        modules: ['node_modules'],
        extensions: [
            ".tsx",
            ".ts",
            ".jsx",
            ".js"
        ]
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    plugins: [
        new webpack.ProgressPlugin(),
        new HtmlWebpackPlugin({
            template: './src/assets/index.html'
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            minChunks: function (_a) {
                var resource = _a.resource;
                return /node_modules/.test(resource);
            }
        })
    ]
};
module.exports = config;
//# sourceMappingURL=webpack.common.js.map