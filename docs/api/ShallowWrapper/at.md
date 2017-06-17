# `.at(index) => ShallowWrapper`

Returns a wrapper around the node at a given index of the current wrapper.


#### Arguments

1. `index` (`Number`): A zero-based integer indicating which node to retrieve.



#### Returns

`ShallowWrapper`: A new wrapper that wraps the retrieved node.



#### Examples

```jsx
const wrapper = shallow(<MyComponent />);
expect(wrapper.find(Foo).at(0).props().foo).to.equal('bar');
```



#### Related Methods

- [`.get(index) => ReactElement`](get.md)
