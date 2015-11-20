# `.state([key]) => Any`

Returns the state hash for the root node of the wrapper. Optionally pass in a prop name and it
will return just that value.


#### Arguments

1. `key` (`String` [optional]): If provided, the return value will be the `this.state[key]` of the
root component instance.



#### Example


```jsx
const wrapper = mount(<MyComponent />);
expect(wrapper.state().foo).to.equal(10);
expect(wrapper.state('foo')).to.equal(10);
```


#### Related Methods

- [`.props() => Object`](props.md)
- [`.prop(key) => Any`](prop.md)
