# `.isEmpty() => Boolean`
**Deprecated**: Use [.exists()](exists.md) instead.

Returns whether or not the current node is empty.


#### Returns

`Boolean`: whether or not the current node is empty.



#### Example


```jsx
const wrapper = shallow(<div className="some-class" />);
expect(wrapper.find('.other-class').isEmpty()).to.be(true);
```
