# `.everyWhere(fn) => Boolean`

Returns whether or not all of the nodes in the wrapper pass the provided predicate function.


#### Arguments

1. `predicate` (`ReactWrapper => Boolean`): A predicate function to match the nodes.



#### Returns

`Boolean`: True if every node in the current wrapper passed the predicate function.



#### Example

```jsx
const wrapper = mount((
  <div>
    <div className="foo qoo" />
    <div className="foo boo" />
    <div className="foo hoo" />
  </div>
));
expect(wrapper.find('.foo').everyWhere(n => n.hasClass('foo'))).to.equal(true);
expect(wrapper.find('.foo').everyWhere(n => n.hasClass('qoo'))).to.equal(false);
expect(wrapper.find('.foo').everyWhere(n => n.hasClass('bar'))).to.equal(false);
```


#### Related Methods

- [`.some(selector) => Boolean`](some.md)
- [`.every(selector) => Boolean`](every.md)
- [`.everyWhere(predicate) => Boolean`](everyWhere.md)
