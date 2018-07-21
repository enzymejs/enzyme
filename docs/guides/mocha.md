# Using enzyme with Mocha

enzyme was originally designed to work with Mocha, so getting it up and running with Mocha should
be no problem at all. Simply install it and start using it:

```bash
npm i --save-dev enzyme
```

```jsx
import React from 'react';
import { expect } from 'chai';
import { mount } from 'enzyme';
import { spy } from 'sinon';
import Foo from './src/Foo';

spy(Foo.prototype, 'componentDidMount');

describe('<Foo />', () => {
  it('calls componentDidMount', () => {
    const wrapper = mount(<Foo />);
    expect(Foo.prototype.componentDidMount).to.have.property('callCount', 1);
  });
});

```
