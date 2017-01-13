var webpack = require('webpack');

var definePlugin = new webpack.DefinePlugin({
  __DEV__: JSON.stringify(JSON.parse(process.env.NODE_ENV != 'production' || 'false')),
  __STAGE__: JSON.stringify(JSON.parse(process.env.NODE_ENV == 'staging' || 'false'))
});

var commonsPlugin = new webpack.optimize.CommonsChunkPlugin('common.js');

var ExtractTextPlugin = require('extract-text-webpack-plugin');

const path = require('path');

const extractCSS = new ExtractTextPlugin('styles.css');
const CleanWebpackPlugin = require('clean-webpack-plugin');
// const PurifyCSSPlugin = require('purifycss-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const filesToForceCopy = [
  'android-chrome-192x192.png',
  'android-chrome-256x256.png',
  'apple-touch-icon-167.png',
  'apple-touch-icon-180.png',
  'favicon.ico',
  'favicon-16x16.png',
  'favicon-32x32.png',
  'favicon-safari-pinned.svg',
  'manifest-favicon.json',
  'mstile-150x150.png',
  'robots.txt',
  'rev.txt',

  'images/',
  'js/dependencies/',
  'static/'
];

const plugins = [
  definePlugin,
  commonsPlugin,
  extractCSS,
  new webpack.HotModuleReplacementPlugin(),
  new CleanWebpackPlugin(path.resolve(__dirname, '../.tmp/public/'), {
    // Without `root` CleanWebpackPlugin won't point to our
    // project and will fail to work.
    root: process.cwd()
  }),
  new CopyWebpackPlugin(
    filesToForceCopy.map(function(filePath) {
      let fs = require('fs');
      if (fs.existsSync(path.resolve(__dirname, '../assets/' + filePath))) {
        return {
          from: path.resolve(__dirname, '../assets/' + filePath),
          to: path.resolve(__dirname, '../.tmp/public/' + filePath)
        }
      } else {
        return false;
      }
    }).filter(function(item) {
      return !!item;
    })
  )
/*
  new PurifyCSSPlugin({
    basePath: process.cwd(),
    // `paths` is used to point PurifyCSS to files not
    // visible to Webpack. You can pass glob patterns
    // to it.
    // paths: path.resolve(__dirname, '../assets/')
  }),
*/
];

if (process.env.NODE_ENV == 'production') {
  // plugins.push(new webpack.optimize.UglifyJsPlugin({
  //   compress: {
  //     warnings: true
  //   }
  // }))
}

module.exports.webpack = {
  watch: true,
  options: {
    cache: true,
    devtool: 'eval',
    entry: {
      main: path.resolve(__dirname, '../assets/js/spaApp.js'),
    },
    output: {
      path: path.resolve(__dirname, '../.tmp/public/js/'),
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
          // whatwg-fetch use Promsie which IE11 doesn't support
          test: /\.js$/,
          include: [/whatwg-.*/],
          loader: 'babel'
        },
        {
          test: /\.css$/,
          loader: extractCSS.extract(['css'])
        },
        // {
        //   test: /\.woff(\?.+)?$/,
        //   // Inline small woff files and output them below font/.
        //   // Set mimetype just in case.
        //   loader: 'url-loader',
        //   query: {
        //     name: 'fonts/[name].[ext]',
        //     limit: 5000,
        //     mimetype: 'application/font-woff'
        //   },
        //   include: path.resolve(__dirname, '../assets/fonts/')
        // },
        {
          test: /\.(woff2?|otf|ttf|eot|svg)(\?.+)?$/,
          loader: 'file-loader',
          query: {
            name: 'fonts/[name].[ext]'
          },
          include: path.resolve(__dirname, '../assets/fonts/')
        },
        // {
        //   test: /\.(jpg|png|svg|mp4|gif)$/,
        //   loader: 'file',
        //   include: path.resolve(__dirname, '../assets/images/')
        // }
      ]
    },
    resolve: {
      root: path.resolve(__dirname, '../assets/js'),
      alias: {
        '~': path.resolve(__dirname, '../assets/js/components'),
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
