# Using enzyme to Test Components in React Native

As of v0.18, React Native uses React as a dependency rather than a forked version of the library,
which means it is now possible to use enzyme's `shallow` with React Native components.

Unfortunately, React Native has many environmental dependencies that can be hard to simulate without
a host device.

This can be difficult when you want your test suite to run with typical Continuous Integration servers
such as Travis.

To use enzyme to test React Native, you currently need to configure an adapter, and load an emulated DOM.

## Configuring an Adapter

While a React Native adapter is [in discussion](https://github.com/airbnb/enzyme/issues/1436),
a standard adapter may be used, such as 'enzyme-adapter-react-16':

```jsx
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });
```

## Loading an emulated DOM with JSDOM

To use enzyme's `mount` until a React Native adapter exists, an emulated DOM must be loaded.

While some have had success with [react-native-mock-renderer](https://github.com/Root-App/react-native-mock-render),
the recommended approach is to use [https://github.com/tmpvar/jsdom](JSDOM),
as documented for enzyme at the [JSDOM](https://airbnb.io/enzyme/docs/guides/jsdom.html) documentation page.

JSDOM will allow all of the `enzyme` behavior you would expect. While Jest snapshot testing can be used with
this approach as well, it isn't encouraged and is only supported through `wrapper.debug()`.

## Using enzyme's find when lacking className props

It is worth noting that React Native allows for a [testID](https://facebook.github.io/react-native/docs/view#testid)
prop, that can be used a selector similar to `className` in standard React:

<!-- eslint no-unused-expressions: 0, semi: 0 -->
```jsx
    <View key={key} style={styles.todo} testID="todo-item">
      <Text testID="todo-title" style={styles.title}>{todo.title}</Text>
    </View>
```

```jsx
expect(wrapper.findWhere(node => node.prop('testID') === 'todo-item')).toExist();
```

## Default example configuration for Jest and JSDOM replacement

To perform the necessary configuration in your testing framework, it is recommended to use a setup script,
such as with Jest's `setupFilesAfterEnv` setting.

Create or update a `jest.config.js` file at the root of your project to include the `setupFilesAfterEnv` setting:

```jsx
// jest.config.js

module.exports = {
  // Load setup-tests.js before test execution
  setupFilesAfterEnv: '<rootDir>setup-tests.js',

  // ...
};
```

Then create or update the file specified in `setupFilesAfterEnv`, in this case `setup-tests.js` in the project root:

```jsx
// setup-tests.js

import 'react-native';
import 'jest-enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Enzyme from 'enzyme';

/**
 * Set up DOM in node.js environment for Enzyme to mount to
 */
const { JSDOM } = require('jsdom');

const jsdom = new JSDOM('<!doctype html><html><body></body></html>');
const { window } = jsdom;

function copyProps(src, target) {
  Object.defineProperties(target, {
    ...Object.getOwnPropertyDescriptors(src),
    ...Object.getOwnPropertyDescriptors(target),
  });
}

global.window = window;
global.document = window.document;
global.navigator = {
  userAgent: 'node.js',
};
copyProps(window, global);

/**
 * Set up Enzyme to mount to DOM, simulate events,
 * and inspect the DOM in tests.
 */
Enzyme.configure({ adapter: new Adapter() });
```

## Configure enzyme with other test libraries and include JSDOM on the fly

Update the file specified in `setupFilesAfterEnv`, in this case `setup-tests.js` in the project root:

```jsx
import 'react-native';
import 'jest-enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Enzyme from 'enzyme';

/**
 * Set up Enzyme to mount to DOM, simulate events,
 * and inspect the DOM in tests.
 */
Enzyme.configure({ adapter: new Adapter() });
```

### Create a separate test file

Create a file prefixed with enzyme.test.ts for example `component.enzyme.test.js`:

```jsx
/**
 * @jest-environment jsdom
 */
import React from 'react';
import { mount } from 'enzyme';
import { Text } from '../../../component/text';

describe('Component tested with airbnb enzyme', () => {
  test('App mount with enzyme', () => {
    const wrapper = mount(<Text />);
    // other tests operations
  });
});
```

**The most important part is to ensure that the test runs with the `jestEnvironment` set to `jsdom`** - one way is to include a `/* @jest-environment jsdom */` comment at the top of the file.



Then you should then be able to start writing tests!

Note that you may want to perform some additional mocking around native components,
or if you want to perform snapshot testing against React Native components. Notice
how you may need to mock React Navigation's `KeyGenerator` in this case, to avoid
random React keys that will cause snapshots to always fail.

```jsx
import React from 'react';
import renderer from 'react-test-renderer';
import { mount, ReactWrapper } from 'enzyme';
import { Provider } from 'mobx-react';
import { Text } from 'native-base';

import { TodoItem } from './todo-item';
import { TodoList } from './todo-list';
import { todoStore } from '../../stores/todo-store';

// https://github.com/react-navigation/react-navigation/issues/2269
// React Navigation generates random React keys, which makes
// snapshot testing fail. Mock the randomness to keep from failing.
jest.mock('react-navigation/src/routers/KeyGenerator', () => ({
  generateKey: jest.fn(() => 123),
}));

describe('todo-list', () => {
  describe('enzyme tests', () => {
    it('can add a Todo with Enzyme', () => {
      const wrapper = mount(
        <Provider keyLength={0} todoStore={todoStore}>
          <TodoList />
        </Provider>,
      );

      const newTodoText = 'I need to do something...';
      const newTodoTextInput = wrapper.find('Input').first();
      const addTodoButton = wrapper
        .find('Button')
        .findWhere(w => w.text() === 'Add Todo')
        .first();

      newTodoTextInput.props().onChangeText(newTodoText);

      // Enzyme usually allows wrapper.simulate() alternatively, but this doesn't support 'press' events.
      addTodoButton.props().onPress();

      // Make sure to call update if external events (e.g. Mobx state changes)
      // result in updating the component props.
      wrapper.update();

      // You can either check for a testID prop, similar to className in React:
      expect(
        wrapper.findWhere(node => node.prop('testID') === 'todo-item'),
      ).toExist();

      // Or even just find a component itself, if you broke the JSX out into its own component:
      expect(wrapper.find(TodoItem)).toExist();

      // You can even do snapshot testing,
      // if you pull in enzyme-to-json and configure
      // it in snapshotSerializers in package.json
      expect(wrapper.find(TodoList)).toMatchSnapshot();
    });
  });
});
```
