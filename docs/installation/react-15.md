# Working with React 15

If you are wanting to use Enzyme with React 15, but don't already have React 15 and react-dom
installed, you should do so:

```bash
npm i --save react@15.0.0-rc.2 react-dom@15.0.0-rc.2
```

Further, enzyme requires the test utilities addon be installed:

```bash
npm i --save-dev react-addons-test-utils@15.0.0-rc.2
```

Next, to get started with enzyme, you can simply install it with npm:

```bash
npm i --save-dev enzyme
```

And then you're ready to go!  In your test files you can simply `require` or `import` enzyme:

ES6:
```js
import { shallow, mount, render } from 'enzyme';

const wrapper = shallow(<Foo />);
```

ES5:
<!-- eslint no-var: 0 -->
```js
var enzyme = require('enzyme');

var wrapper = enzyme.shallow(<Foo />);
```
