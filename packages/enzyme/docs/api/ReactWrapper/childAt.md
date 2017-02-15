# `.childAt(index) => ReactWrapper`

Returns a new wrapper with child at the specified index.

#### Arguments

1. `index` (`number`): A zero-based integer indicating which node to retrieve.


#### Returns

`ReactWrapper`: A new wrapper that wraps the resulting node.



#### Examples

```jsx
const wrapper = mount(<ToDoList items={items} />);
expect(wrapper.find('ul').childAt(0).type()).to.equal('li');
```

#### Related Methods

- [`.parents() => ReactWrapper`](parents.md)
- [`.parent() => ReactWrapper`](parent.md)
- [`.closest(selector) => ReactWrapper`](closest.md)
- [`.children() => ReactWrapper`](children.md)
