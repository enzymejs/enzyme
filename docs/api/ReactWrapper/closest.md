# `.closest(selector) => ReactWrapper`

Returns a wrapper of the first element that matches the selector by traversing up through the
current node's ancestors in the tree, starting with itself.

Note: can only be called on a wrapper of a single node.


#### Returns

`ReactWrapper`: A new wrapper that wraps the resulting node.



#### Examples

```jsx
const wrapper = mount(<MyComponent />);
expect(wrapper.find(Foo).closest('.bar)).to.have.length(1);
```

#### Related Methods

- [`.children() => ReactWrapper`](children.md)
- [`.parent() => ReactWrapper`](parent.md)
- [`.parents() => ReactWrapper`](parents.md)
