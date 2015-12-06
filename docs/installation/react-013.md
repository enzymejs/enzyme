# Working with React 0.13

If you are wanting to use Enzyme with React 0.13, but don't already have React 0.13 installed, you
should do so:

```bash
npm i react@0.13 --save
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
```js
var enzyme = require('enzyme');
var wrapper = enzyme.shallow(<Foo />);
```

