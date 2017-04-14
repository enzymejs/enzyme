# `.findWhere(fn) => ShallowWrapper`

Finds every node in the render tree that returns true for the provided predicate function.


#### Arguments

1. `predicate` (`ShallowWrapper => Boolean`): A predicate function called with the passed in wrapped
nodes.



#### Returns

`ShallowWrapper`: A new wrapper that wraps the found nodes.



#### Example

```jsx
const wrapper = shallow(<MyComponent />);
const complexComponents = wrapper.findWhere(n => n.type() !== 'string');
expect(complexComponents).to.have.length(8);
```


#### Related Methods

- [`.find(selector) => ShallowWrapper`](find.md)
