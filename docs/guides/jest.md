# Using Jest with Enzyme

If you are using Jest with enzyme and using Jest's "automocking" feature, you will need to mark
several modules to be unmocked in your `package.json`:

```js
/* package.json */

"jest": {
  "scriptPreprocessor": "<rootDir>/node_modules/babel-jest",
  "unmockedModulePathPatterns": [
    "react",
    "react-dom",
    "react-addons-test-utils",
    "fbjs",
    "enzyme",
    "cheerio",
    "htmlparser2",
    "lodash",
    "domhandler",
    "object.assign",
    "define-properties",
    "function-bind",
    "object-keys",
    "object.values",
    "es-abstract"
  ]
}
```

## Example Projects

- [enzyme-example-jest](https://github.com/lelandrichardson/enzyme-example-jest)
