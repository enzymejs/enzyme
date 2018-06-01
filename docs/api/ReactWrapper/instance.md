# `.instance() => ReactComponent`

Returns the wrapper's underlying instance.



#### Returns

`ReactComponent|DOMComponent`: The retrieved instance.



#### Example

```jsx
const wrapper = mount(<MyComponent />);
const inst = wrapper.instance();
expect(inst).to.be.instanceOf(MyComponent);
```
