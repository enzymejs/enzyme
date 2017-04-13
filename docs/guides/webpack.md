# Using Enzyme with Webpack

If you are using a test runner that runs code in a browser-based environment, you may be using
[webpack]() in order to bundle your React code.

Webpack uses static analysis to create a dependency graph at build-time of your source code to
build a bundle. Enzyme has a handful of conditional `require()` calls in it in order to remain
compatible with React 0.13 and React 0.14 and React 15.

Unfortunately, these conditional requires mean there is a bit of extra setup with bundlers like
webpack.

In your webpack configuration, you simply need to make sure that you include `IgnorePlugin`s for
the conditional dependencies not needed for your version of `react`.

Enzyme exports a function returning the `IgnorePlugin`s needed for the version of `react` you have installed.

Depending on if you are using Webpack 1 or Webpack 2 you will need different additions to your configuration.

### Webpack 1

```js
/* webpack.config.js */
{
  plugins: require('enzyme/webpack').getPluginsForInstalledReact(),
  loaders: {
    {
      test: /\.json$/,
      loader: 'json-loader',
    },
  }
}
```

### Webpack 2

```js
/* webpack.config.js */
{
  plugins: require('enzyme/webpack').getPluginsForInstalledReact(),
}
```


## Example Projects

- [enzyme-example-karma-webpack](https://github.com/lelandrichardson/enzyme-example-karma-webpack)
