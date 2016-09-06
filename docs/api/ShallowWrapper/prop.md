# `.prop(key) => Any`

Returns the prop value for the node of the current wrapper with the provided key.

NOTE: can only be called on a wrapper of a single node. Cannot be called on the root wrapper because that represents what the component renders, not the component itself.

#### Arguments

1. `key` (`String`): The prop name such that this will return value will be the `this.props[key]`
of the component instance.

#### Example


```jsx
const wrapper = shallow(<div><MyComponent foo={10} /></div>);
expect(wrapper.find('MyComponent').prop('foo')).to.equal(10);
```

#### Related Methods

- [`.props() => Object`](props.md)
- [`.state([key]) => Any`](state.md)
- [`.context([key]) => Any`](context.md)
