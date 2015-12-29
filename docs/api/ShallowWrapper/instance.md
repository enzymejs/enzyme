# `.instance() => ReactComponent`

Gets the instance of the component being rendered as the root node passed into `shallow()`.

NOTE: can only be called on a wrapper instance that is also the root instance.



#### Returns

`ReactComponent`: The component instance.



#### Example

```jsx
const wrapper = shallow(<MyComponent />);
const inst = wrapper.instance();
expect(inst).to.be.instanceOf(MyComponent);
```
