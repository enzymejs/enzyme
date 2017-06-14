# Using Enzyme with Webpack

If you are using a test runner that runs code in a browser-based environment, you may be using
[webpack]() in order to bundle your React code.

Webpack uses static analysis to create a dependency graph at build-time of your source code to
build a bundle. Enzyme has a handful of conditional `require()` calls in it in order to remain
compatible with React 0.13 and React 0.14.

Unfortunately, these conditional requires mean there is a bit of extra setup with bundlers like
webpack.

In your webpack configuration, you simply need to make sure that the following files will be ignored:

```
cheerio
react/addons
react/lib/ReactContext
react/lib/ExecutionEnvironment
```

You will need the following configuration:

```js
/* webpack.config.js */
// ...
plugins: [
  new webpack.IgnorePlugin(/react\/addons/),
  new webpack.IgnorePlugin(/react\/lib\/ExecutionEnvironment/),
  new webpack.IgnorePlugin(/react\/lib\/ReactContext/)
]
// ...
```


## React 0.14 Compatibility

If you are using React 0.14, the instructions above will be the same but with a different list of
externals:

```js
/* webpack.config.js */
// ...
plugins: [
  new webpack.IgnorePlugin(/cheerio/),
  new webpack.IgnorePlugin(/react-dom/),
  new webpack.IgnorePlugin(/react-dom\/server/)
  new webpack.IgnorePlugin(/react-addons-test-utils/)
]
```

## React 15 Compatibility

If you are using React 15, your config should include these externals:

```js
/* webpack.config.js */
// ...
plugins: [
  new webpack.IgnorePlugin(/react\/addons/),
  new webpack.IgnorePlugin(/react\/lib\/ExecutionEnvironment/),
  new webpack.IgnorePlugin(/react\/lib\/ReactContext/)
]
// ...
```

## Example Projects

- [enzyme-example-karma-webpack](https://github.com/lelandrichardson/enzyme-example-karma-webpack)
