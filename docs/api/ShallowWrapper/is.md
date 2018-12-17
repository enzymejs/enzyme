# `.is(selector) => Boolean`

Returns whether or not the single wrapped node matches the provided selector. It must be a single-node wrapper.


#### Arguments

1. `selector` ([`EnzymeSelector`](../selector.md)): The selector to match.


#### Returns

`Boolean`: whether or not the wrapped node matches the provided selector.


#### Example


```jsx
const wrapper = shallow(<div className="some-class other-class" />);
expect(wrapper.is('.some-class')).to.equal(true);
```
