# `.last() => ShallowWrapper`

Reduce the set of matched nodes to the last in the set.



#### Returns

`ShallowWrapper`: A new wrapper that wraps the last node in the set.



#### Examples

```jsx
const wrapper = shallow(<MyComponent />);
expect(wrapper.find(Foo).last().props().foo).to.equal('bar');
```
