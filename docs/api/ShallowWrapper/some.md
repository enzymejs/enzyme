# `.some(selector) => Boolean`

Returns whether or not any of the nodes in the wrapper match the provided selector.


#### Arguments

1. `selector` ([`EnzymeSelector`](../selector.md)): The selector to match.



#### Returns

`Boolean`: True if at least one of the nodes in the current wrapper matched the provided selector.



#### Examples

```jsx
const wrapper = shallow((
  <div>
    <div className="foo qoo" />
    <div className="foo boo" />
    <div className="foo hoo" />
  </div>
));
expect(wrapper.find('.foo').some('.qoo')).to.equal(true);
expect(wrapper.find('.foo').some('.foo')).to.equal(true);
expect(wrapper.find('.foo').some('.bar')).to.equal(false);
```

#### Related Methods

- [`.someWhere(predicate) => Boolean`](someWhere.md)
- [`.every(selector) => Boolean`](every.md)
- [`.everyWhere(predicate) => Boolean`](everyWhere.md)
