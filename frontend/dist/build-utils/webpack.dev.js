"use strict";
var config = {
    devtool: 'eval',
    module: {
        rules: [
            {
                test: /\.s?css$/,
                use: [
                    { loader: 'style-loader' },
                    {
                        loader: 'css-loader',
                        options: {
                            camelCase: true,
                            importLoaders: 1
                        }
                    },
                    {
                        loader: 'postcss-loader'
                    },
                    {
                        loader: 'sass-loader' // compiles SASS to CSS
                    }
                ]
            }
        ]
    }
};
module.exports = config;
//# sourceMappingURL=webpack.dev.js.map