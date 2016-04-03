# Using Enzyme with Mocha

Enzyme was originally designed to work with Mocha, so getting it up and running with Mocha should
be no problem at all. Simply install it and start using it:

```bash
npm i --save-dev enzyme
```

```jsx
import React from 'react';
import { mount, shallow } from 'enzyme';

describe('<Foo />', () => {

  it('calls componentDidMount', () => {
    const wrapper = mount(<Foo />);
    expect(Foo.prototype.componentDidMount.calledOnce).to.equal(true);
  });

});

```


## Example Projects

- [enzyme-example-mocha](https://github.com/lelandrichardson/enzyme-example-mocha)
- [enzyme-example-react-native](https://github.com/lelandrichardson/enzyme-example-react-native)
