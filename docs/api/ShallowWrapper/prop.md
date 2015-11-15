# `.prop(key) => Any`

Returns the prop value for the node of the current wrapper with the provided key. 

NOTE: can only be called on a wrapper of a single node.

#### Arguments

1. `key` (`String`): The prop name such that this will return value will be the `this.props[key]` 
of the component instance.



#### Example


```jsx
const wrapper = shallow(<MyComponent foo={10} />);
expect(wrapper.prop('foo')).to.equal(10);
```


#### Related Methods

- [`.props() => Object`](props.md)
- [`.state([key]) => Any`](state.md)
