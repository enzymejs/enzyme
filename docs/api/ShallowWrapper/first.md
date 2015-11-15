# `.first() => ShallowWrapper`

Reduce the set of matched nodes to the first in the set.



#### Returns

`ShallowWrapper`: A new wrapper that wraps the first node in the set.



#### Examples

```jsx
const wrapper = shallow(<MyComponent />);
expect(wrapper.find(Foo).first().props().foo).to.equal("bar");
```
