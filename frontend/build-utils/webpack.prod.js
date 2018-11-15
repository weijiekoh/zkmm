const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextWebpackPlugin = require('extract-text-webpack-plugin');
const UglifyJsWebpackPlugin = require('uglifyjs-webpack-plugin');
const CompressionWebpackPlugin = require('compression-webpack-plugin');
const incstr = require('incstr');

const createUniqueIdGenerator = () => {
  const index = {};

  const generateNextId = incstr.idGenerator({
    // Removed "d" letter to avoid accidental "ad" construct.
    // @see https://medium.com/@mbrevda/just-make-sure-ad-isnt-being-used-as-a-class-name-prefix-or-you-might-suffer-the-wrath-of-the-558d65502793
    alphabet: 'abcefghijklmnopqrstuvwxyz0123456789'
  });

  return (name) => {
    if (index[name]) {
      return index[name];
    }

    let nextId;

    do {
      // Class name cannot start with a number.
      nextId = generateNextId();
    } while (/^[0-9]/.test(nextId));

    index[name] = generateNextId();

    return index[name];
  };
};

const uniqueIdGenerator = createUniqueIdGenerator();

const generateScopedName = (localName, resourcePath) => {
  const componentName = resourcePath.split('/').slice(-2, -1);
  return uniqueIdGenerator(componentName) + '_' + uniqueIdGenerator(localName);
}

const config = {
  output: {
    publicPath: '/static/'
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.s?css/,
        use: ExtractTextWebpackPlugin.extract({
          use: [
            {
              loader: 'css-loader',
              options: {
                camelCase: true,
                getLocalIdent: (context, localIdentName, localName) => {
                  return generateScopedName(localName, context.resourcePath);
                },
                minimize: true,
                importLoaders: 1
              }
            },
            {
              loader: 'postcss-loader'
            },
            {
              loader: 'sass-loader' // compiles SASS to CSS
            }
          ],
          fallback: 'style-loader'
        })
      },
      {
        test: [
          /\.png$/,
          /\.jpe?g$/
        ],
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 10000
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new webpack.ProgressPlugin(),
    new ExtractTextWebpackPlugin('style.[contenthash:8].css'),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }),
    new UglifyJsWebpackPlugin({
      sourceMap: true
    }),
    new CompressionWebpackPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: /\.(js|html|css)$/,
      threshold: 10240,
      minRatio: 0.8
    }),
    new webpack.ContextReplacementPlugin(),
    new HtmlWebpackPlugin({
      template: './src/assets/index.html',
      minify: {
        collapseWhitespace: true,
        minifyCss: true,
        minifyJs: true,
        quoteCharacter: '"',
        removeComments: true,
        removeEmptyAttributes: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        sortAttributes: true,
        sortClassNames: true
      }
    })
  ]
};

module.exports = config;
