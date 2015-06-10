var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var createWebpackConfig = require('./createWebpackConfig');

var PORT = process.env.PORT || 3000;

var config = createWebpackConfig({
  hot: true,
  port: PORT,
  prod: false,
});

new WebpackDevServer(webpack(config), {
  publicPath: config.output.publicPath,
  hot: true,
  historyApiFallback: true,
}).listen(PORT, '0.0.0.0', function (err, result) {

  if (err) {
    console.log(err);
    return;
  }

  console.log('Listening at localhost:' + PORT);
});
