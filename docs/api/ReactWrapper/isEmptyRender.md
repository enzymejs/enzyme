# `.isEmptyRender() => Boolean`

Returns whether or not the current component returns a falsy value: `false`, `null`, `undefined`.

#### Returns

`Boolean`: whether the return is falsy

#### Example

```jsx
function Foo() {
  return null;
}

const wrapper = mount(<Foo />);
expect(wrapper.isEmptyRender()).to.be(true);
```
