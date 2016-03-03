# `.filterWhere(fn) => ShallowWrapper`

Returns a new wrapper with only the nodes of the current wrapper that, when passed into the 
provided predicate function, return true.


#### Arguments

1. `predicate` (`ShallowWrapper => Boolean`): A predicate function that is passed a wrapped node.



#### Returns

`ShallowWrapper`: A new wrapper that wraps the filtered nodes.



#### Example

```jsx
const wrapper = shallow(<MyComponent />);
const complexFoo = wrapper.find('.foo').filterWhere(n => typeof n.type() !== 'string');
expect(complexFoo).to.have.length(4);
```


#### Related Methods

- [`.filter(selector) => ShallowWrapper`](filter.md)
