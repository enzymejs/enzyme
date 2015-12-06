# Using Enzyme with Webpack

If you are using a test runner that runs code in a browser-based environment, you may be using
[webpack]() in order to bundle your React code.

Webpack uses static analysis to create a dependency graph at build-time of your source code to
build a bundle. Enzyme has a hand full of conditional `require()` calls in it in order to remain
compatible with React 0.13 and React 0.14.

Unfortunately, these conditional requires mean there is a bit of extra setup with bundlers like
webpack.

In your webpack configuration, you simply need to make sure that the following two files are
labeled as "external", which means they will be ignored:

```
cheerio
react/lib/ReactContext
react/lib/ExecutionEnvironment
```

Here is an example piece of configuration code marking these as external:

```js
/* webpack.config.js */
// ...
externals: {
  'cheerio': 'window',
  'react/lib/ExecutionEnvironment': true,
  'react/lib/ReactContext': true
}
// ...
```

## React 0.13 Compatibility

If you are using React 0.13, the instructions above will be the same but with a different list of 
externals:

```
cheerio
react-dom
react-dom/server
react-addons-test-utils
```


## Example Projects

- [enzyme-example-karma-webpack](https://github.com/lelandrichardson/enzyme-example-karma-webpack)
