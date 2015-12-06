# `.children([selector]) => ShallowWrapper`

Returns a new wrapper with all of the children of the node(s) in the current wrapper. Optionally, a 
selector can be provided and it will filter the children by this selector


#### Arguments

1. `selector` ([`EnzymeSelector`](../selector.md) [optional]): A selector to filter the children by.


#### Returns

`ShallowWrapper`: A new wrapper that wraps the resulting nodes.



#### Examples

```jsx
const wrapper = shallow(<ToDoList items={items} />);
expect(wrapper.find('ul').children()).to.have.length(items.length);
```

#### Related Methods

- [`.parents() => ShallowWrapper`](parents.md)
- [`.parent() => ShallowWrapper`](parent.md)
- [`.closest(selector) => ShallowWrapper`](closest.md)
