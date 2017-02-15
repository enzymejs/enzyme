# `.context([key]) => Any`

Returns the context hash for the root node of the wrapper. Optionally pass in a prop name and it
will return just that value.


#### Arguments

1. `key` (`String` [optional]): If provided, the return value will be the `this.context[key]` of the
root component instance.



#### Example


```jsx
const wrapper = mount(
  <MyComponent />,
  { context: { foo: 10 } }
);

expect(wrapper.context().foo).to.equal(10);
expect(wrapper.context('foo')).to.equal(10);
```


#### Related Methods

- [`.state([key]) => Any`](state.md)
- [`.props() => Object`](props.md)
- [`.prop(key) => Any`](prop.md)
