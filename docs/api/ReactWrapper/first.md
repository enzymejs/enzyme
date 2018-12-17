# `.first() => ReactWrapper`

Reduce the set of matched nodes to the first in the set, just like `.at(0)`.


#### Returns

`ReactWrapper`: A new wrapper that wraps the first node in the set.


#### Examples

```jsx
const wrapper = mount(<MyComponent />);
expect(wrapper.find(Foo).first().props().foo).to.equal('bar');
```


#### Related Methods

- [`.at(index) => ReactWrapper`](at.md) - retrieve any wrapper node
- [`.last() => ReactWrapper`](last.md)
