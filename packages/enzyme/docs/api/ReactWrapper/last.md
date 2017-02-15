# `.last() => ReactWrapper`

Reduce the set of matched nodes to the last in the set.



#### Returns

`ReactWrapper`: A new wrapper that wraps the last node in the set.



#### Examples

```jsx
const wrapper = mount(<MyComponent />);
expect(wrapper.find(Foo).last().props().foo).to.equal("bar");
```
