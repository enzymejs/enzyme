# `.second() => ShallowWrapper`

Reduce the set of matched nodes to the second in the set.



#### Returns

`ShallowWrapper`: A new wrapper that wraps the second node in the set.



#### Examples

```jsx
const wrapper = shallow(<MyComponent />);
expect(wrapper.find(Foo).second().props().foo).to.equal("bar");
```
