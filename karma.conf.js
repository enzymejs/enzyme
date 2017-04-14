/* eslint-disable no-var,prefer-arrow-callback,vars-on-top */

require('babel-register');

var IgnorePlugin = require('webpack').IgnorePlugin;
var REACT013 = require('./src/version').REACT013;
var REACT155 = require('./src/version').REACT155;

function getPlugins() {
  var plugins = [];

  /*
  this list of conditional IgnorePlugins mirrors the conditional
  requires in src/react-compat.js and exists to avoid error
  output from the webpack compilation
  */

  if (!REACT013) {
    plugins.push(new IgnorePlugin(/react\/lib\/ExecutionEnvironment/));
    plugins.push(new IgnorePlugin(/react\/lib\/ReactContext/));
    plugins.push(new IgnorePlugin(/react\/addons/));
  }
  if (REACT013) {
    plugins.push(new IgnorePlugin(/react-dom/));
  }
  if (REACT013 || REACT155) {
    plugins.push(new IgnorePlugin(/react-addons-test-utils/));
  }
  if (!REACT155) {
    plugins.push(new IgnorePlugin(/react-test-renderer/));
    plugins.push(new IgnorePlugin(/react-dom\/test-utils/));
    plugins.push(new IgnorePlugin(/create-react-class/));
  }

  return plugins;
}

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
      plugins: getPlugins(),
    },

    webpackServer: {
      noInfo: true,
    },
  });
};
