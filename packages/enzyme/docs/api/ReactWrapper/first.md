# `.first() => ReactWrapper`

Reduce the set of matched nodes to the first in the set.



#### Returns

`ReactWrapper`: A new wrapper that wraps the first node in the set.



#### Examples

```jsx
const wrapper = mount(<MyComponent />);
expect(wrapper.find(Foo).first().props().foo).to.equal("bar");
```
