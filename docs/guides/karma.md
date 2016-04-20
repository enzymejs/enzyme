# Using Enzyme with Karma

Karma is a popular test runner that can run tests in browser environments. Enzyme is compatible with
Karma, but often requires a little bit of configuration.

This configuration largely depends on which plugins you are using to bundle your JavaScript code.  In
the case of Browserify or Webpack, see the below documentation in order to get these up and running.


## Enzyme + Karma + Webpack

See the [webpack guide](webpack.md).

```js
/* karma.conf.js */

webpack: { //kind of a copy of your webpack config
  devtool: 'inline-source-map', //just do inline source maps instead of the default
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /\/node_modules\//,
        loader: 'babel',
        query: {
          presets: ['airbnb']
        }
      }
    ]
  },
  externals: {
    'cheerio': 'window',
    'react/addons': true,
    'react/lib/ExecutionEnvironment': true,
    'react/lib/ReactContext': true
  }
},
```

## Enzyme + Karma + Browserify

See the [browserify guide](browserify.md).

```js
/* karma.conf.js */
browserify: {
  debug: true,
  transform: [
    ['babelify', { presets: ['airbnb'] }]
  ],
  configure: function(bundle) {
    bundle.on('prebundle', function() {
      bundle.external('react/addons');
      bundle.external('react/lib/ReactContext');
      bundle.external('react/lib/ExecutionEnvironment');
    });
  }
},
```


## Example Projects

- [enzyme-example-karma](https://github.com/lelandrichardson/enzyme-example-karma)
- [enzyme-example-karma-webpack](https://github.com/lelandrichardson/enzyme-example-karma-webpack)
