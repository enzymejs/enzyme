# `.parents() => ShallowWrapper`

Returns a wrapper around all of the parents/ancestors of the wrapper. Does not include the node
in the current wrapper.

Note: can only be called on a wrapper of a single node.


#### Returns

`ShallowWrapper`: A new wrapper that wraps the resulting nodes.



#### Examples

```jsx
const wrapper = shallow(<ToDoList />);
expect(wrapper.find('ul').parents()).to.have.length(2);
```

#### Related Methods

- [`.children() => ShallowWrapper`](children.md)
- [`.parent() => ShallowWrapper`](parent.md)
- [`.closest(selector) => ShallowWrapper`](closest.md)
