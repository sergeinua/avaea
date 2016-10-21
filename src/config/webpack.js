var webpack = require('webpack');

// compile js assets into a single bundle file
module.exports.webpack = {
  options: {
    // devtool: 'eval',
    entry: {
      // mod_test: './assets_wp/Test.first.jsx',
      // mod_suggest: ['./assets_wp/Test.jsx'],
      mod_test: './assets_wp/test.js',
    },
    output: {
      // path: path.resolve(__dirname, '.tmp/public/js'),
      path: __dirname + '/../.tmp/public/js',
      filename: "[name].js",
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoErrorsPlugin()
    ],
    module: {
      loaders: [
        // requires "npm install --save-dev babel-loader"
        { test: /\.jsx$/, loader: 'babel-loader', exclude: /node_modules/, query: {presets: ['es2015','react']}},
        { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/, query: {presets: ['es2015','react']}},
        // { test: /\.css$/, loader: 'style!css' }
      ],
    }
  },

  // docs: https://webpack.github.io/docs/node.js-api.html#compiler
  watchOptions: {
    aggregateTimeout: 300
  }
};
