# `.findWhere(fn) => ShallowWrapper`

Finds every node in the render tree that return true for the provided predicate function.


#### Arguments

1. `predicate` (`ReactElement => Boolean`): A predicate function to match



#### Returns

`ShallowWrapper`: A new wrapper that wraps the found nodes.



#### Example

```jsx
const wrapper = shallow(<MyComponent />);
const complexComponents = wrapper.findWhere(n => typeof n.type !== 'string');
expect(complexComponents).to.have.length(8);
```


#### Related Methods

- [`.find(selector) => ShallowWrapper`](find.md)
