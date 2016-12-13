# `.exists() => Boolean`

Returns whether or not the current node exists.


#### Returns

`Boolean`: whether or not the current node exists.



#### Example


```jsx
const wrapper = mount(<div className="some-class" />);
expect(wrapper.find('.other-class').exists()).to.be(false);
```
