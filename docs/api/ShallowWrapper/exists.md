# `.exists([selector]) => Boolean`

Returns whether or not the current node exists. Or, if a selector is passed in, whether that selector has any matching results.



#### Arguments

1. `selector` ([`EnzymeSelector`](../selector.md) [optional]): The selector to check existence for.



#### Returns

`Boolean`: whether or not the current node exists, or the selector had any results.



#### Example


```jsx
const wrapper = mount(<div className="some-class" />);
expect(wrapper.exists('.some-class')).to.equal(true);
expect(wrapper.find('.other-class').exists()).to.equal(false);
```
