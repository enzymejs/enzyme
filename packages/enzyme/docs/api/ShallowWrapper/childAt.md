# `.childAt(index) => ShallowWrapper`

Returns a new wrapper with child at the specified index.

#### Arguments

1. `index` (`number`): A zero-based integer indicating which node to retrieve.


#### Returns

`ShallowWrapper`: A new wrapper that wraps the resulting node.



#### Examples

```jsx
const wrapper = shallow(<ToDoList items={items} />);
expect(wrapper.find('ul').childAt(0).type()).to.equal('li');
```

#### Related Methods

- [`.parents() => ShallowWrapper`](parents.md)
- [`.parent() => ShallowWrapper`](parent.md)
- [`.closest(selector) => ShallowWrapper`](closest.md)
- [`.children() => ReactWrapper`](children.md)
