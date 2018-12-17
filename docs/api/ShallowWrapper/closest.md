# `.closest(selector) => ShallowWrapper`

Returns a wrapper of the first element that matches the selector by traversing up through the
wrapped node's ancestors in the tree, starting with itself. It must be a single-node wrapper.


#### Returns

`ShallowWrapper`: A new wrapper that wraps the resulting node.



#### Examples

```jsx
const wrapper = shallow(<MyComponent />);
expect(wrapper.find(Foo).closest('.bar')).to.have.lengthOf(1);
```

#### Related Methods

- [`.children() => ShallowWrapper`](children.md)
- [`.parent() => ShallowWrapper`](parent.md)
- [`.parents() => ShallowWrapper`](parents.md)
