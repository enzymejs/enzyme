# Using enzyme with Tape and AVA

enzyme works well with [Tape](https://github.com/substack/tape) and [AVA](https://github.com/avajs/ava).
Simply install it and start using it:

```bash
npm i --save-dev enzyme enzyme-adapter-react-16
```

## Tape

```jsx
import test from 'tape';
import React from 'react';
import { shallow, mount, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import Foo from '../path/to/foo';

configure({ adapter: new Adapter() });

test('shallow', (t) => {
  const wrapper = shallow(<Foo />);
  t.equal(wrapper.contains(<span>Foo</span>), true);
});

test('mount', (t) => {
  const wrapper = mount(<Foo />);
  const fooInner = wrapper.find('.foo-inner');
  t.equal(fooInner.is('.foo-inner'), true);
});
```

## AVA


```jsx
import test from 'ava';
import React from 'react';
import { shallow, mount, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import Foo from '../path/to/foo';

configure({ adapter: new Adapter() });

test('shallow', (t) => {
  const wrapper = shallow(<Foo />);
  t.is(wrapper.contains(<span>Foo</span>), true);
});

test('mount', (t) => {
  const wrapper = mount(<Foo />);
  const fooInner = wrapper.find('.foo-inner');
  t.is(fooInner.is('.foo-inner'), true);
});
```

## Example Projects

- [enzyme-example-tape](https://github.com/TaeKimJR/enzyme-example-tape)
- [enzyme-example-ava](https://github.com/mikenikles/enzyme-example-ava)
