# `.findWhere(fn) => ReactWrapper`

Finds every node in the render tree that returns true for the provided predicate function.


#### Arguments

1. `predicate` (`ReactWrapper => Boolean`): A predicate function called with the passed in wrapped
nodes.



#### Returns

`ReactWrapper`: A new wrapper that wraps the found nodes.



#### Example

```jsx
const wrapper = mount(<MyComponent />);
const complexComponents = wrapper.findWhere(n => typeof n.type() !== 'string');
expect(complexComponents).to.have.length(8);
```


#### Related Methods

- [`.find(selector) => ReactWrapper`](find.md)
