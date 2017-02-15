# `.is(selector) => Boolean`

Returns whether or not the current node matches a provided selector.


#### Arguments

1. `selector` ([`EnzymeSelector`](../selector.md)): The selector to match.



#### Returns

`Boolean`: whether or not the current node matches a provided selector.



#### Example


```jsx
const wrapper = shallow(<div className="some-class other-class" />);
expect(wrapper.is('.some-class')).to.equal(true);
```

