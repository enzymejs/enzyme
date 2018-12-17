# `.last() => ReactWrapper`

Reduce the set of matched nodes to the last in the set, just like `.at(length - 1)`.


#### Returns

`ReactWrapper`: A new wrapper that wraps the last node in the set.


#### Examples

```jsx
const wrapper = mount(<MyComponent />);
expect(wrapper.find(Foo).last().props().foo).to.equal('bar');
```


#### Related Methods

- [`.at(index) => ReactWrapper`](at.md) - retrieve a wrapper node by index
- [`.first() => ReactWrapper`](first.md)
