const webpack = require('webpack');

module.exports = {
  entry: {
    app: ['./src/App.jsx'],
    vendor: ['react', 'react-dom', 'whatwg-fetch', 'react-router', 'material-ui'],
  },
  output: {
    path: `${__dirname}./public`,
    filename: 'app.bundle.js',
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      filename: 'vendor.bundle.js',
    }),
  ],
  devtool: 'source-map',
  module: {
    loaders: [
      {
        test: /\.jsx$/,
        loader: 'babel-loader',
        query: {
          presets: ['react', 'es2015'],
        },
      },
    ],
  },
};
