# `.props() => Object`

Returns the props hash for the current node of the wrapper.

NOTE: can only be called on a wrapper of a single node.


#### Example


```jsx
const wrapper = mount(<MyComponent foo={10} />);
expect(wrapper.props().foo).to.equal(10);
```


#### Related Methods

- [`.prop() => Object`](prop.md)
- [`.state([key]) => Any`](state.md)
