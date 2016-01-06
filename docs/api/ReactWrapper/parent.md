# `.parent() => ReactWrapper`

Returns a wrapper with the direct parent of the node in the current wrapper.


#### Returns

`ReactWrapper`: A new wrapper that wraps the resulting nodes.



#### Examples

```jsx
const wrapper = mount(<ToDoList />);
expect(wrapper.find('ul').parent().is('div')).to.equal(true);
```

#### Related Methods

- [`.parents() => ReactWrapper`](parents.md)
- [`.children() => ReactWrapper`](children.md)
- [`.closest(selector) => ReactWrapper`](closest.md)
