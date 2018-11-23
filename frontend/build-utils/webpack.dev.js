const config = {
  devtool: 'eval',
  devServer: {
    proxy: [
      {
        path: '/api/**',
        target: 'http://localhost:8000',
        changeOrigin: true,
        changeHost: true,
      },
      {
        path: '/static/**',
        target: 'http://localhost:8000',
        changeOrigin: true,
        changeHost: true,
      }
    ]
  },
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
