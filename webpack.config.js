const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: {
    app: path.resolve(__dirname, './src/App.jsx'),
    vendor: ['react', 'react-dom', 'whatwg-fetch']
  },
  output: {
    path: path.resolve(__dirname, './public'),
    filename: 'app.bundle.js'
  },
  plugins:[
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      filename: 'vendor.bundle.js'
    })
  ],
  module: {
    loaders: [
      {
        test: /\.jsx$/,
        loader: 'babel-loader',
        query: {
          presets: ['react', 'es2015']
        }
      },
    ]
  },
  devServer: {
    port: 8001,
    contentBase: 'public',
    proxy: {
      '/api/*':{
        target: 'http://localhost:8000'
      }
    }
  }
};
