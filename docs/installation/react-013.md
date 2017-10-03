# Working with React 0.13

If you are wanting to use enzyme with React 0.13, but don't already have React 0.13 installed, you
should do so:

```bash
npm i react@0.13 --save
```

Next, to get started with enzyme, you can simply install it with npm:

```bash
npm i --save-dev enzyme enzyme-adapter-react-13
```

And then you're ready to go!  In your test files you can simply `require` or `import` enzyme:

ES6:
```js
// setup file
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-13';

configure({ adapter: new Adapter() });
```

```js
// test file
import { shallow, mount, render } from 'enzyme';

const wrapper = shallow(<Foo />);
```

ES5:
<!-- eslint no-var: 0 -->
```js
// setup file
var enzyme = require('enzyme');
var Adapter = require('enzyme-adapter-react-13');

enzyme.configure({ adapter: new Adapter() });
```

<!-- eslint no-var: 0 -->
```js
// test file
var enzyme = require('enzyme');

var wrapper = enzyme.shallow(<Foo />);
```
