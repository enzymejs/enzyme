# `.filterWhere(fn) => ReactWrapper`

Returns a new wrapper with only the nodes of the current wrapper that, when passed into the 
provided predicate function, return true.


#### Arguments

1. `predicate` (`ReactWrapper => Boolean`): A predicate function that is passed a wrapped node.



#### Returns

`ReactWrapper`: A new wrapper that wraps the filtered nodes.



#### Example

```jsx
const wrapper = mount(<MyComponent />);
const complexFoo = wrapper.find('.foo').filterWhere(n => typeof n.type() !== 'string');
expect(complexComponents).to.have.length(4);
```


#### Related Methods

- [`.filter(selector) => ReactWrapper`](filter.md)
