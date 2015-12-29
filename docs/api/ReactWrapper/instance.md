# `.instance() => ReactComponent`

Gets the instance of the component being rendered as the root node passed into `mount()`.

NOTE: can only be called on a wrapper instance that is also the root instance.



#### Returns

`ReactComponent`: The component instance.



#### Example

```jsx
const wrapper = mount(<MyComponent />);
const inst = wrapper.instance();
expect(inst).to.be.instanceOf(MyComponent);
```
