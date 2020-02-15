/**
 * Webpack configuration file for bundling package.
 */

// imports
const path = require('path');

// exports
module.exports = (env, argv) => {
  return {
    entry: [
      path.resolve(__dirname, 'src', 'index.js'),
      path.resolve(__dirname, 'src', 'scss', 'index.scss')
    ],
    mode: argv.mode || 'production',
    output: {
       path: path.resolve(__dirname, 'dist'),
       filename: argv.mode === 'development' ? '[name].js' : '[name].min.js'
    },
    resolve: {
       extensions: ['.js']
    },
    module: {
       rules: [
          {
            test: /\.js$/,
            loader: 'babel-loader',
            exclude: /node_modules/,
            query: {
              presets: ['@babel/preset-env'],
            }
          },
          {
            test: /\.scss$/,
            exclude: /node_modules/,
            use: ['style-loader', 'css-loader', 'sass-loader']
          }
       ]
    }
  }
};