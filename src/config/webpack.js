var webpack = require('webpack');

var definePlugin = new webpack.DefinePlugin({
  __DEV__: JSON.stringify(JSON.parse(process.env.BUILD_DEV || 'true')),
  __PRERELEASE__: JSON.stringify(JSON.parse(process.env.BUILD_PRERELEASE || 'false'))
});

var commonsPlugin = new webpack.optimize.CommonsChunkPlugin('common.js');

var ExtractTextPlugin = require('extract-text-webpack-plugin');

const path = require('path');

const extractCSS = new ExtractTextPlugin('styles.css');

const plugins = [
  definePlugin,
  commonsPlugin,
  extractCSS,
  new webpack.HotModuleReplacementPlugin()
];

if (process.env.NODE_ENV == 'production') {
  plugins.push(new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: true
    }
  }))
}

module.exports.webpack = {
  options: {
    cache: true,
    devtool: 'eval',
    entry: {
      main: path.resolve(__dirname, '../assets/js/spaApp.js'),
    },
    output: {
      path: path.resolve(__dirname, '../.tmp/public/js/app'),
      filename: 'bundle.js'
    },
    module: {
      loaders: [
        {
          test: /\.jsx?$/,
          loaders: ['babel-loader'],
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          loader: extractCSS.extract(['css'])
        },
        {
          test: /\.woff$/,
          // Inline small woff files and output them below font/.
          // Set mimetype just in case.
          loader: 'url',
          query: {
            name: 'fonts/[hash].[ext]',
            limit: 5000,
            mimetype: 'application/font-woff'
          },
          include: path.resolve(__dirname, '../assets/fonts/')
        },
        {
          test: /\.ttf$|\.eot$/,
          loader: 'file',
          query: {
            name: 'fonts/[hash].[ext]'
          },
          include: path.resolve(__dirname, '../assets/fonts/')
        }
      ]
    },
    resolve: {
      root: path.resolve(__dirname, '../assets/js'),
      alias: {
        containers: 'containers',
        components: 'components',
        actions: 'actions',
        reducers: 'reducers',
      },
      extensions: ['', '.js', '.jsx']
    },
    plugins: plugins,
    node: {
      fs: 'empty'
    }
  },
  watchOptions: {
    aggregateTimeout: 300
  }
};
