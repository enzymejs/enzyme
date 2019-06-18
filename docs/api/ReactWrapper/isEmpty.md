# `.isEmpty() => Boolean`
**Deprecated**: Use [`.exists()`](exists.md) instead.

Returns whether or not the wrapper is empty.


#### Returns

`Boolean`: whether or not the wrapper is empty.


#### Example


```jsx
const wrapper = mount(<div className="some-class" />);
expect(wrapper.find('.other-class').isEmpty()).to.equal(true);
```
