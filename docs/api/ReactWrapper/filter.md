# `.filter(selector) => ReactWrapper`

Returns a new wrapper with only the nodes of the current wrapper that match the provided selector.


#### Arguments

1. `selector` ([`EnzymeSelector`](../selector.md)): The selector to match.



#### Returns

`ReactWrapper`: A new wrapper that wraps the filtered nodes.



#### Examples

```jsx
const wrapper = mount(<MyComponent />);
expect(wrapper.find('.foo').filter('.bar')).to.have.length(1);
```

#### Related Methods

- [`.filterWhere(predicate) => ReactWrapper`](filterWhere.md)
