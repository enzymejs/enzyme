# `.parents([selector]) => ReactWrapper`

Returns a wrapper around all of the parents/ancestors of the single node in the wrapper. Does not include the node itself.
Optionally, a selector can be provided and it will filter the parents by this selector. It must be a single-node wrapper.


#### Arguments

1. `selector` ([`EnzymeSelector`](../selector.md) [optional]): The selector to filter the parents by.


#### Returns

`ReactWrapper`: A new wrapper that wraps the resulting nodes.


#### Examples

```jsx
const wrapper = mount(<ToDoList />);
expect(wrapper.find('ul').parents()).to.have.lengthOf(2);
```

#### Related Methods

- [`.children([selector]) => ReactWrapper`](children.md)
- [`.parent() => ReactWrapper`](parent.md)
- [`.closest(selector) => ReactWrapper`](closest.md)
