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
    "underscore",
    "lodash",
    "domhandler",
    "object.assign",
    "define-properties",
    "function-bind",
    "object-keys"
  ]
}
```

## Example Projects

- [enzyme-example-ject](https://github.com/lelandrichardson/enzyme-example-jest)
