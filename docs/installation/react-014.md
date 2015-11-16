# Working with React 0.14

If you are wanting to use Reagent with React 0.14, but don't already have React 0.14 and react-dom
installed, you should do so:

```bash
npm i --save react@0.14 react-dom@0.14
```

Further, reagent requires the test utilities addon be installed:

```bash
npm i --save-dev react-addons-test-utils@0.14
```

Next, to get started with reagent, you can simply install it with npm:

```bash
npm i --save-dev reagent
```

And then you're ready to go!  In your test files you can simply `require` or `import` reagent:

ES6:
```js
import { shallow, mount, render } from 'reagent';
const wrapper = shallow(<Foo />);
```

ES5:
```js
var reagent = require('reagent');
var wrapper = reagent.shallow(<Foo />);
```


