# `.props() => Object`

Returns the props object for the root node of the wrapper. It must be a single-node wrapper.

NOTE: When called on a shallow wrapper, `.props()` will return values for props on the root node that the component *renders*, not the component itself.

This method is a reliable way of accessing the props of a node; `wrapper.instance().props` will work as well, but in React 16+, stateless functional components do not have an instance. See [`.instance() => ReactComponent`](instance.md)


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
