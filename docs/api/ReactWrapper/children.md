# `.children([selector]) => ReactWrapper`

Returns a new wrapper with all of the children of the node(s) in the current wrapper. Optionally, a
selector can be provided and it will filter the children by this selector


#### Arguments

1. `selector` ([`EnzymeSelector`](../selector.md) [optional]): A selector to filter the children by.


#### Returns

`ReactWrapper`: A new wrapper that wraps the resulting nodes.



#### Examples

```jsx
const wrapper = mount(<ToDoList items={items} />);
expect(wrapper.find('ul').children()).to.have.length(items.length);
```

#### Related Methods

- [`.parents() => ReactWrapper`](parents.md)
- [`.parent() => ReactWrapper`](parent.md)
- [`.closest(selector) => ReactWrapper`](closest.md)
