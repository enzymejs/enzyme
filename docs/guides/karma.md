# Using enzyme with Karma

Karma is a popular test runner that can run tests in multiple browser environments. Depending on your Karma setup, you may have a number of options for configuring Enzyme.

## Basic Enzyme setup with Karma

### Configure Enzyme

Create an Enzyme setup file. This file will configure Enzyme with the appropriate React adapter. It can also be used to initialize any that you'd like available for all tests. To avoid having to import this file and Enzyme, you can re-export all Enzyme exports from this file and just import it.

```js
/* test/enzyme.js */
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import jasmineEnzyme from 'jasmine-enzyme';

// Configure Enzyme for the appropriate React adapter
Enzyme.configure({ adapter: new Adapter() });

// Initialize global helpers
beforeEach(() => {
  jasmineEnzyme();
});

// Re-export all enzyme exports
export * from 'enzyme';
```

### Import Enzyme from the Enzyme setup file

Anywhere you want to use Enzyme, import the Enzyme setup file just as you would Enzyme itself.

```js
/* some_test.js */
// Import anything you would normally import `from 'enzyme'` from the Enzyme setup file
import { shallow } from './test/enzyme';

// ...
```


## Alternative karma-webpack setup

If you're using Karma and Webpack using [karma-webpack's alternative setup](https://github.com/webpack-contrib/karma-webpack#alternative-usage), you can configure enzyme in your test entry file and import Enzyme directly in individual tests.

```js
/* test/index_test.js */
import './enzyme';

const testsContext = require.context('.', true, /_test$/);

testsContext.keys().forEach(testsContext);
```

```js
/* some_test.js */
// If Enzyme is configured in the test entry file, Enzyme can be imported directly
import { shallow } from 'enzyme';

// ...
```
