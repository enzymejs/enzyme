/* eslint-disable no-var,prefer-arrow-callback,vars-on-top, import/no-extraneous-dependencies */

require('babel-register');

var IgnorePlugin = require('webpack').IgnorePlugin;
var is = require('./src/version').is;

function getPlugins() {
  const adapter13 = new IgnorePlugin(/adapters\/ReactThirteenAdapter/);
  const adapter14 = new IgnorePlugin(/adapters\/ReactFourteenAdapter/);
  const adapter154 = new IgnorePlugin(/adapters\/ReactFifteenFourAdapter/);
  const adapter15 = new IgnorePlugin(/adapters\/ReactFifteenFiveAdapter/);
  const adapter16 = new IgnorePlugin(/adapters\/ReactSixteenAdapter/);

  var plugins = [
    adapter13,
    adapter14,
    adapter154,
    adapter15,
    adapter16,
  ];

  function not(x) {
    return function notPredicate(y) {
      return y !== x;
    };
  }

  // we want to ignore all of the adapters *except* the one we are currently using
  if (is('0.13.x')) {
    plugins = plugins.filter(not(adapter13));
  } else if (is('0.14.x')) {
    plugins = plugins.filter(not(adapter14));
  } else if (is('^15.0.0-0 && < 15.5.0')) {
    plugins = plugins.filter(not(adapter154));
  } else if (is('^15.5.0')) {
    plugins = plugins.filter(not(adapter15));
  } else if (is('^16.0.0-0')) {
    plugins = plugins.filter(not(adapter16));
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
