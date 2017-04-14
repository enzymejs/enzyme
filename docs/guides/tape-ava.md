# Using Enzyme with Tape and AVA

Enzyme works well with [Tape](https://github.com/substack/tape) and [AVA](https://github.com/avajs/ava).
Simply install it and start using it:

```bash
npm i --save-dev enzyme
```

## Tape

```jsx
import test from 'tape'
import React from 'react'
import { shallow, mount } from 'enzyme';

import Foo from '../path/to/foo'

test('shallow', t => {
  const wrapper = shallow(<Foo />)
  t.equal(wrapper.contains(<span>Foo</span>), true)
})

test('mount', t => {
  const wrapper = mount(<Foo />)
  const fooInner = wrapper.find('.foo-inner')
  t.equal(fooInner.is('.foo-inner'), true)
})
```

## AVA


```jsx
import test from 'ava'
import React from 'react'
import { shallow, mount } from 'enzyme';

import Foo from '../path/to/foo'

test('shallow', t => {
  const wrapper = shallow(<Foo />)
  t.is(wrapper.contains(<span>Foo</span>), true)
})

test('mount', t => {
  const wrapper = mount(<Foo />)
  const fooInner = wrapper.find('.foo-inner')
  t.is(fooInner.is('.foo-inner'), true)
})
```

## Example Projects

- [enzyme-example-ava](https://github.com/mikenikles/enzyme-example-ava)
