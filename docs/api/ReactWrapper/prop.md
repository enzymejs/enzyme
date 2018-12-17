# `.prop(key) => Any`

Returns the prop value for the root node of the wrapper with the provided key. It must be a single-node wrapper.

#### Arguments

1. `key` (`String`): The prop name, that is, `this.props[key]` or `props[key]` for the root node of the wrapper.


#### Example


```jsx
const wrapper = mount(<MyComponent foo={10} />);
expect(wrapper.prop('foo')).to.equal(10);
```


#### Related Methods

- [`.props() => Object`](props.md)
- [`.state([key]) => Any`](state.md)
- [`.context([key]) => Any`](context.md)
