# `.length => number`

Returns the number of React nodes enclosed in this wrapper.



#### Returns

`Number`: count of nodes in the list in this wrapper.



#### Example


```jsx
const wrapper = mount(<div />);
expect(wrapper.length).to.equal(1);
```
