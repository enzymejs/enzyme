# `.parents([selector]) => ReactWrapper`

Returns a wrapper around all of the parents/ancestors of the wrapper. Does not include the node
in the current wrapper. Optionally, a selector can be provided and it will filter the parents by
this selector

Note: can only be called on a wrapper of a single node.


#### Arguments

1. `selector` ([`EnzymeSelector`](../selector.md) [optional]): The selector to filter the parents by.


#### Returns

`ReactWrapper`: A new wrapper that wraps the resulting nodes.



#### Examples

```jsx
const wrapper = mount(<ToDoList />);
expect(wrapper.find('ul').parents()).to.have.length(2);
```

#### Related Methods

- [`.children() => ReactWrapper`](children.md)
- [`.parent() => ReactWrapper`](parent.md)
- [`.closest(selector) => ReactWrapper`](closest.md)
