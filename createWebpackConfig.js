var join = require('path').join;
var webpack = require('webpack');
var path = require('path');

function noop () {}

var entry = join(__dirname, 'src', 'main.jsx');

module.exports = function createWebpackConfig (params) {
  params = params || {};
  var hot = !!params.hot;
  var port = params.port || 3000;
  var prod = params.prod || process.env.NODE_ENV === 'production';

  return {
    entry: hot ? [
      'webpack-dev-server/client?http://0.0.0.0:' + port ,
      'webpack/hot/only-dev-server',
      entry
    ] : entry,
    output: {
      path: join(__dirname),
      filename: 'bundle.js',
      publicPath: '',
    },
    module: {
      loaders: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          loaders: hot ? ['react-hot', 'babel?stage=0'] : ['babel?stage=0'],
        },
        {
          test: /\.tsv$/,
          exclude: /node_modules/,
          loaders: ['dsv-loader?delimiter=\t'],
        }
      ],
      postLoaders: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          loaders: ['transform?envify'],
        },
      ],
    },
    plugins: [
      hot ? new webpack.HotModuleReplacementPlugin() : noop,
      prod ? new webpack.optimize.DedupePlugin() : noop,
      prod ? new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false
        }
      }) : noop,
      new webpack.NoErrorsPlugin()
    ],
    debug: !prod,
    devtool: prod ? 'source-map' : 'eval-source-map',
    resolve: {
      extensions: ['', '.js', '.jsx'],
      fallback: path.join(__dirname, "node_modules"),
    },
  };
}
