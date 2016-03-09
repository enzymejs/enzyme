# Using Jest with Enzyme

If you are using Jest with enzyme and using Jest's "automocking" feature, you will need to mark
react and enzyme to be unmocked in your `package.json`:

```js
/* package.json */

"jest": {
  "scriptPreprocessor": "<rootDir>/node_modules/babel-jest",
  "unmockedModulePathPatterns": [
    "react",
    "enzyme"
  ]
}
```

## Example Projects

- [enzyme-example-jest](https://github.com/lelandrichardson/enzyme-example-jest)
