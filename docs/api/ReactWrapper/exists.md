# `.exists([selector]) => Boolean`

Returns whether or not any nodes exist in the wrapper. Or, if a selector is passed in, whether that selector has any matches in the wrapper.



#### Arguments

1. `selector` ([`EnzymeSelector`](../selector.md) [optional]): The selector to check existence for.



#### Returns

`Boolean`: whether or not any nodes are on the list, or the selector had any matches.



#### Example


```jsx
const wrapper = mount(<div className="some-class" />);
expect(wrapper.exists('.some-class')).to.equal(true);
expect(wrapper.find('.other-class').exists()).to.equal(false);
```
