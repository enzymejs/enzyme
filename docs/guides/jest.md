# Using Jest with Enzyme

If you are using Jest 0.9+ with enzyme and using Jest's "automocking" feature, you will need to mark
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

If you are using a previous version of Jest together with npm3, you may need to unmock [more modules](https://github.com/airbnb/enzyme/blob/78febd90fe2fb184771b8b0356b0fcffbdad386e/docs/guides/jest.md).

## Example Projects

- [enzyme-example-jest](https://github.com/lelandrichardson/enzyme-example-jest)
