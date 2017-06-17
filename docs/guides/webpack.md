# Using Enzyme with Webpack

If you are using a test runner that runs code in a browser-based environment, you may be using
[webpack]() in order to bundle your React code.

Webpack uses static analysis to create a dependency graph at build-time of your source code to
build a bundle. Enzyme has a handful of conditional `require()` calls in it in order to remain
compatible with React 0.13 and React 0.14.

Unfortunately, these conditional requires mean there is a bit of extra setup with bundlers like
webpack.

In your webpack configuration, you simply need to make sure that the following files are
labeled as "external", which means they will be ignored:

```
cheerio
react/addons
react/lib/ReactContext
react/lib/ExecutionEnvironment
```

Depending on if you are using Webpack 1 or Webpack 2 you will need different configurations.

### Webpack 1

```js
/* webpack.config.js */
module.exports = {
  // ...
  externals: {
    cheerio: 'window',
    'react/addons': true,
    'react/lib/ExecutionEnvironment': true,
    'react/lib/ReactContext': true,
  },
  // ...
};
```

### Webpack 2

```js
/* webpack.config.js */
module.exports = {
  // ...
  externals: {
    cheerio: 'window',
    'react/addons': 'react',
    'react/lib/ExecutionEnvironment': 'react',
    'react/lib/ReactContext': 'react',
  },
  // ...
};
```


## React 0.14 Compatibility

If you are using React 0.14, the instructions above will be the same but with a different list of
externals:

```
cheerio
react-dom
react-dom/server
react-addons-test-utils
```

## React 15 Compatibility

If you are using React 15, your config should include these externals:

```js
/* webpack.config.js */
module.exports = {
  // ...
  externals: {
    'react/addons': true,
    'react/lib/ExecutionEnvironment': true,
    'react/lib/ReactContext': true,
  },
  // ...
};
```

## Example Projects

- [enzyme-example-karma-webpack](https://github.com/lelandrichardson/enzyme-example-karma-webpack)
