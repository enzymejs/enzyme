# `.prop(key) => Any`

Returns the prop value for the root node of the wrapper with the provided key.
`.prop(key)` can only be called on a wrapper of a single node.

NOTE: When called on a shallow wrapper, `.prop(key)` will return values for
props on the root node that the component *renders*, not the component itself.
To return the props for the entire React component, use `wrapper.instance().props`.
See [`.instance() => ReactComponent`](instance.md)

#### Arguments

1. `key` (`String`): The prop name such that this will return value will be the `this.props[key]`
of the root node of the component.



#### Example


```jsx
class MyComponent extends React.Component {
  render() {
    return (
        <div className="foo bar" includedProp={this.props.includedProp}>Hello</div>
    )
  }
}
const wrapper = shallow(<MyComponent includedProp="Success!" excludedProp="I'm not included" />);
expect(wrapper.prop('includedProp')).to.equal("Success!");

// Warning: .prop(key) only returns values for props that exist in the root node.
// See the note above about wrapper.instance().props to return all props in the React component.

wrapper.prop('includedProp');
// "Success!"

wrapper.prop('excludedProp');
// undefined

wrapper.instance().props.excludedProp;
// "I'm not included"
```


#### Related Methods

- [`.props() => Object`](props.md)
- [`.state([key]) => Any`](state.md)
- [`.context([key]) => Any`](context.md)
