# `.isEmptyRender() => Boolean`

Returns whether or not the current component returns one of the allowed falsy values: `false` or `null`.

#### Returns

`Boolean`: whether the return is falsy

#### Example

```jsx
function Foo() {
  return null;
}

const wrapper = shallow(<Foo />);
expect(wrapper.isEmptyRender()).to.be(true);
```
