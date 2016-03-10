# Using Enzyme with Browserify

If you are using a test runner that runs code in a browser-based environment, you may be using
[browserify]() in order to bundle your React code.

Browserify uses static analysis to create a dependency graph at build-time of your source code to
build a bundle. Enzyme has a hand full of conditional `require()` calls in it in order to remain
compatible with React 0.13 and React 0.14.

Unfortunately, these conditional requires mean there is a bit of extra setup with bundlers like
browserify.

In your browserify configuration, you simply need to make sure that the following two files are
labeled as "external", which means they will be ignored:

```
react/lib/ReactContext
react/lib/ExecutionEnvironment
```

Here is an example piece of configuration code marking these as external:

```js
var browserify = require('browserify');

var b = browserify();

// make sure to mark these as external!
b.external('react/lib/ReactContext');
b.external('react/lib/ExecutionEnvironment');

// the rest of your browserify configuration
```


## React 0.14 Compatibility

If you are using React 0.14, the instructions above will be the same but with a different list of 
externals:

```
react-dom
react-dom/server
react-addons-test-utils
```


## Example Projects

- [enzyme-example-karma](https://github.com/lelandrichardson/enzyme-example-karma)
