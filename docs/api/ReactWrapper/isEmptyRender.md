# `.isEmptyRender() => Boolean`

Returns whether or not the wrapper would ultimately render only the allowed falsy values: `false` or `null`.

#### Returns

`Boolean`: whether the return is falsy

#### Example

```jsx
function Foo() {
  return null;
}

const wrapper = mount(<Foo />);
expect(wrapper.isEmptyRender()).to.equal(true);
```
