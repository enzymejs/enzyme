/* eslint-disable no-var,prefer-arrow-callback,vars-on-top */

require('babel-register');

module.exports = function karma(config) {
  config.set({
    basePath: '.',

    plugins: [
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-mocha',
      'karma-webpack',
      'karma-sourcemap-loader',
    ],

    customLaunchers: {
      Chrome_travis: {
        base: 'Chrome',
        flags: ['--no-sandbox'],
      },
    },

    frameworks: ['mocha'],

    reporters: ['dots'],

    files: [
      'test/*.{jsx,js}',
    ],

    exclude: [
      'test/_helpers/index.jsx',
    ],

    browsers: [
      process.env.TRAVIS ? 'Chrome_travis' : 'Chrome',
      'Firefox',
    ],

    preprocessors: {
      'test/*.{jsx,js}': ['webpack', 'sourcemap'],
    },

    webpack: {
      devtool: 'inline-source-map',
      resolve: {
        extensions: ['', '.js', '.jsx', '.json'],
        alias: {
          // dynamic require calls in sinon confuse webpack so we ignore it
          sinon: 'sinon/pkg/sinon',
        },
      },
      module: {
        noParse: [
          // dynamic require calls in sinon confuse webpack so we ignore it
          /node_modules\/sinon\//,
        ],
        loaders: [
          {
            test: /\.jsx?$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
          },
          {
            test: /\.json$/,
            loader: 'json-loader',
          },
        ],
      },
      plugins: require('./src/webpack').getPluginsForInstalledReact(),
    },

    webpackServer: {
      noInfo: true,
    },
  });
};
