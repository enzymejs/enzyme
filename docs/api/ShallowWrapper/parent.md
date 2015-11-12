# `.parent() => ShallowWrapper`

Returns a wrapper with the direct parent of the node in the current wrapper.

Note: can only be called on a wrapper of a single node.


#### Returns

`ShallowWrapper`: A new wrapper that wraps the resulting nodes.



#### Examples

```jsx
const wrapper = shallow(<ToDoList />);
expect(wrapper.find('ul').parent().is('div')).to.be.true;;
```

#### Related Methods

- [`.parents() => ShallowWrapper`](parents.md)
- [`.children() => ShallowWrapper`](children.md)
- [`.closest(selector) => ShallowWrapper`](closest.md)
