# `.every(selector) => Boolean`

Returns whether or not all of the nodes in the wrapper match the provided selector.


#### Arguments

1. `selector` ([`EnzymeSelector`](../selector.md)): The selector to match.



#### Returns

`Boolean`: True if every node in the current wrapper matched the provided selector.



#### Examples

```jsx
const wrapper = mount((
  <div>
    <div className="foo qoo" />
    <div className="foo boo" />
    <div className="foo hoo" />
  </div>
));
expect(wrapper.find('.foo').every('.foo')).to.equal(true);
expect(wrapper.find('.foo').every('.qoo')).to.equal(false);
expect(wrapper.find('.foo').every('.bar')).to.equal(false);
```

#### Related Methods

- [`.someWhere(predicate) => Boolean`](someWhere.md)
- [`.every(selector) => Boolean`](every.md)
- [`.everyWhere(predicate) => Boolean`](everyWhere.md)
