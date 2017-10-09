# `.props() => Object`

Returns the props hash for the root node of the wrapper. `.props()` can only be
called on a wrapper of a single node.

NOTE: When called on a shallow wrapper, `.props()` will return values for
props on the root node that the component *renders*, not the component itself.

To return the props for the entire React component, use `wrapper.instance().props`. This is valid for stateful or stateless components in React `15.*`. But, `wrapper.instance()` will return `null` for stateless React component in React `16.*`, so `wrapper.instance().props` will cause an error in this case. See [`.instance() => ReactComponent`](instance.md)


#### Example
```jsx

import PropTypes from 'prop-types';

function MyComponent(props) {
  const { includedProp } = props;
  return (
    <div className="foo bar" includedProp={includedProp}>Hello</div>
  );
}
MyComponent.propTypes = {
  includedProp: PropTypes.string.isRequired,
};

const wrapper = shallow(<MyComponent includedProp="Success!" excludedProp="I'm not included" />);
expect(wrapper.props().includedProp).to.equal('Success!');

// Warning: .props() only returns props that are passed to the root node,
// which does not include excludedProp in this example.
// See the note above about wrapper.instance().props.

console.log(wrapper.props());
// {children: "Hello", className: "foo bar", includedProp="Success!"}

console.log(wrapper.instance().props); // React 15.x - working as expected
// {children: "Hello", className: "foo bar", includedProp:"Success!", excludedProp: "I'm not included"}

console.log(wrapper.instance().props);
// React 16.* - Uncaught TypeError: Cannot read property 'props' of null
```


#### Related Methods

- [`.prop(key) => Any`](prop.md)
- [`.state([key]) => Any`](state.md)
- [`.context([key]) => Any`](context.md)
