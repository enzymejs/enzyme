# `.prop(key) => Any`

Returns the prop value for the root node of the wrapper with the provided key.
`.prop(key)` can only be called on a wrapper of a single node.

NOTE: When called on a shallow wrapper, `.prop(key)` will only return values for props that exist for the parent element of the component, not the whole React component. To return the props for the
entire React component, use `wrapper.instance().props`. See [`.instance() =>
ReactComponent`](instance.md)

#### Arguments

1. `key` (`String`): The prop name such that this will return value will be the `this.props[key]`
of the parent element of the component.



#### Example


```jsx
const MyComponent = React.createClass({
  render() {
    return (
        <div className="foo bar" includedProp={this.props.includedProp}>Hello</div>
    )
  }
})
const wrapper = shallow(<MyComponent includedProp="Success!" excludedProp="I'm not included" />);
expect(wrapper.prop('includedProp')).to.equal("Success!");

// Warning: .prop(key) only returns values for props that exist in the parent element.
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
