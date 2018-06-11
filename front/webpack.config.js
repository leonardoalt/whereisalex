const path = require('path');
const webpack = require('webpack');
const HTMLWebpackPlugin = require('html-webpack-plugin');

const HTMLWebpackPluginConfig = new HTMLWebpackPlugin({
  template: path.join(__dirname, './public/index.html'),
  filename: 'index.html',
  inject: 'body'
});
const BUILD_DIR = path.resolve(__dirname, 'dist');

const config = {
  entry: ['babel-polyfill', './src/index.js'],
  output: {
    path: BUILD_DIR,
    filename: 'bundle.js',
  },
  resolve: {
    modules: ['./src', 'node_modules'],
    extensions: ['.js', '.jsx']
  },
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './public',
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
    }
  },
  performance: {
    hints: process.env.NODE_ENV === 'production' ? "warning" : false
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        include : path.resolve(__dirname, 'src'),
        exclude: /node_modules/,
        use: {
          loader: "babel-loader?cacheDirectory"
        }
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      },
      {
        test: /\.(ttf|eot|woff|woff2)$/,
        loader: "url-loader"
      },
      {
        test: /\.(gif|png|jpe?g|svg)$/i,
        use: ['file-loader', {
            loader: 'image-webpack-loader',
            options: {
              mozjpeg: {
                progressive: true,
                quality: 65
              },
              optipng: {
                enabled: false,
              },
              pngquant: {
                quality: '65-90',
                speed: 4
              },
              gifsicle: {
                interlaced: false,
              },
            }
          },
        ],
        exclude: /node_modules/,
        include: __dirname,
      }  
    ]
  },
  plugins:[HTMLWebpackPluginConfig]
};
module.exports = config;
