# `.setContext(context) => Self`

A method that sets the context of the root component, and re-renders. Useful for when you are
wanting to test how the component behaves over time with changing contexts.

NOTE: can only be called on a wrapper instance that is also the root instance.


#### Arguments

1. `context` (`Object`): An object containing new props to merge in with the current state



#### Returns

`ReactWrapper`: Returns itself.



#### Example

```jsx
import React from 'react';
import PropTypes from 'prop-types';

class SimpleComponent extends React.Component {
  render() {
    return <div>{this.context.name}</div>;
  }
}
SimpleComponent.contextTypes = {
  name: PropTypes.string,
};
```
```jsx
const context = { name: 'foo' };
const wrapper = mount(<SimpleComponent />, { context });
expect(wrapper.text()).to.equal('foo');
wrapper.setContext({ name: 'bar' });
expect(wrapper.text()).to.equal('bar');
wrapper.setContext({ name: 'baz' });
expect(wrapper.text()).to.equal('baz');
```

#### Common Gotchas

- `.setContext()` can only be used on a wrapper that was initially created with a call to `mount()`
that includes a `context` specified in the options argument.
- The root component you are rendering must have a `contextTypes` static property.


#### Related Methods

- [`.setState(state) => Self`](setState.md)
- [`.setProps(props) => Self`](setProps.md)


