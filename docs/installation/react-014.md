# Working with React 0.14

If you are wanting to use Enzyme with React 0.14, but don't already have React 0.14 and react-dom
installed, you should do so:

```bash
npm i --save react@0.14 react-dom@0.14
```

Further, enzyme requires the test utilities addon be installed:

```bash
npm i --save-dev react-addons-test-utils@0.14
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


