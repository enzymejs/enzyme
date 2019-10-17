# `.closest(selector) => ReactWrapper`

Returns a wrapper of the first element that matches the selector by traversing up through the
wrapped node's ancestors in the tree, starting with itself. It must be a single-node wrapper.

#### Arguments

1. `selector` ([`EnzymeSelector`](../selector.md)): The selector to match.

#### Returns

`ReactWrapper`: A new wrapper that wraps the resulting node.



#### Examples

```jsx
const wrapper = mount(<MyComponent />);
expect(wrapper.find(Foo).closest('.bar')).to.have.lengthOf(1);
```

#### Related Methods

- [`.children([selector]) => ReactWrapper`](children.md)
- [`.parent() => ReactWrapper`](parent.md)
- [`.parents([selector]) => ReactWrapper`](parents.md)
