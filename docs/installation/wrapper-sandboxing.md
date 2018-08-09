# Wrapper sandboxing

If you are wanting to use enzyme in a large-scale application, you may want to automate
calls to `unmount()` via a lifecycle hook in your test environment, rather than at the
individual test level. Enzyme allows for this as part of its configuration:

ES6:
```js
// setup file
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({
  adapter: new Adapter(),
  enableSandbox: true,
});
```

```js
// test file
import { shallow, mount } from 'enzyme';

const wrapper = mount(<Foo />);
```

```js
// test file (in a lifecycle hook)
import { unmountAllWrappers } from 'enzyme';

unmountAllWrappers();
```

ES5:
<!-- eslint no-var: 0 -->
```js
// setup file
var enzyme = require('enzyme');
var Adapter = require('enzyme-adapter-react-16');

enzyme.configure({
  adapter: new Adapter(),
  enableSandbox: true,
});
```

<!-- eslint no-var: 0 -->
```js
// test file
var enzyme = require('enzyme');

var wrapper = enzyme.mount(<Foo />);
```

<!-- eslint no-var: 0 -->
```js
// test file (in a lifecycle hook)
var enzyme = require('enzyme');

enzyme.unmountAllWrappers();
```
