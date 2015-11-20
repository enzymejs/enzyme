# `.at(index) => ReactWrapper`

Returns a wrapper around the node at a given index of the current wrapper.


#### Arguments

1. `index` (`Number`): A zero-based integer indicating which node to retrieve.



#### Returns

`ReactWrapper`: A new wrapper that wraps the retrieved node.



#### Examples

```jsx
const wrapper = mount(<MyComponent />);
expect(wrapper.find(Foo).at(0).props().foo).to.equal("bar");
```
