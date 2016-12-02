# Using Enzyme with Webpack

If you are using a test runner that runs code in a browser-based environment, you may be using
[webpack]() in order to bundle your React code.

Webpack uses static analysis to create a dependency graph at build-time of your source code to
build a bundle. Enzyme has a handful of conditional `require()` calls in it in order to remain
compatible with React 0.13 and React 0.14+.

Unfortunately, these conditional requires mean there is a bit of extra setup with bundlers like
webpack.

In your webpack configuration, you simply need to make sure that the following requirements are
labeled as "external", which prevents Webpack from shimming the requirements for them:

## React 0.13 Compatibility

```js
/* webpack.config.js */
// ...
externals: {
  'react-dom': true,
  'react-dom/server': true,
  'react-addons-test-utils': true
}
// ...
```

## React 0.14+ Compatibility

```js
/* webpack.config.js */
// ...
externals: {
  'react/addons': true,
  'react/lib/ExecutionEnvironment': true,
  'react/lib/ReactContext': true
}
// ...
```

Alternatively, you can use the [IgnorePlugin](http://webpack.github.io/docs/list-of-plugins.html#ignoreplugin) to make this more explicit.

```js
/* webpack.config.js */
// ...
plugins: [
  // change the requirement request regexs if you are using React 0.13
  // and want to ignore the React 0.14+ modules instead.
  new webpack.IgnorePlugin(/react\/addons/),
  new webpack.IgnorePlugin(/react\/lib\/ReactContext/),
  new webpack.IgnorePlugin(/react\/lib\/ExecutionEnvironment/)
]// ...
```

## Example Projects

- [enzyme-example-karma-webpack](https://github.com/lelandrichardson/enzyme-example-karma-webpack)
