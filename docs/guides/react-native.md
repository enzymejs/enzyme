# Using Enzyme to Test Components in React Native

As of React 0.18, React Native uses React as a dependency rather than a forked version of the library,
which means it is now possible to use Enzyme's `shallow` with React Native components.

Unfortunately, React Native has many environmental dependencies that can be hard to simulate without 
a host device.

This can be difficult when you want your test suite to run with typical Continuous Integration servers
such as Travis.

A pure JS mock of React Native exists and can solve this problem in the majority of use cases.

To install it, run:

```bash
npm i --save-dev react-native-mock
```

Requiring or importing the `/mock` entry file of this project will input the mock `react-native` 
export into the require cache, so that your application uses the mock instead.

If you are using a test runner such as mocha, this means that you can use the `--require` flag 
before you run your test suite, and enzyme should "just work":


### Mocha CLI

```bash
mocha --require react-native-mock/mock --recursive path/to/test/dir
```

### In Code

```js
/* file-that-runs-before-all-of-my-tests.js */

// This will mutate `react-native`'s require cache with `react-native-mock`'s.
require('react-native-mock/mock'); // <-- side-effects!!!
```


## Example Projects

- [enzyme-example-react-native](https://github.com/lelandrichardson/enzyme-example-react-native)
