'use strict';

require('dotenv').config();

const { DefinePlugin, ProvidePlugin } = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const webpackConfig = module.exports = {};

webpackConfig.entry = `${__dirname}/src/main.js`;

webpackConfig.output = {
  filename: '[name].[hash].js',
  path: `${__dirname}/build`,
  publicPath: process.env.CDN_URL,
};

webpackConfig.plugins = [
  new HtmlWebpackPlugin({
    title: 'Rainier Athletes',
  }),
  new DefinePlugin({
    API_URL: JSON.stringify(process.env.API_URL),
    SF_OAUTH_ID: JSON.stringify(process.env.SF_OAUTH_ID),
    SF_OAUTH_AUTHORIZE_URL: JSON.stringify(process.env.SF_OAUTH_AUTHORIZE_URL),
    SF_SESSION_TIMEOUT_MINUTES: JSON.stringify(process.env.SF_SESSION_TIMEOUT_MINUTES),
    BC_OAUTH_ID: JSON.stringify(process.env.BC_OAUTH_ID),
    BC_OAUTH_AUTHORIZE_URL: JSON.stringify(process.env.BC_OAUTH_AUTHORIZE_URL),
    SUMMER_START: JSON.stringify(process.env.SUMMER_START),
    SUMMER_END: JSON.stringify(process.env.SUMMER_END),
  }),
  new ProvidePlugin({
    jQuery: 'jquery',
    $: 'jquery',
    jquery: 'jquery',
  }),
];

webpackConfig.module = {};

webpackConfig.module.rules = [
  {
    test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
    loader: 'url-loader?limit=10000&mimetype=application/font-woff',
  },
  {
    test: /\.(png|svg|jpg|gif|ico)$/i,
    use: ['file-loader'],
  },
  {
    test: /\.js$/,
    exclude: /node_modules/,
    use: {
      loader: 'babel-loader',
      options: {
        presets: ['env', 'stage-0', 'react'],
        plugins: ['transform-react-jsx-source'],
        cacheDirectory: true,
      },
    },
  },
];
