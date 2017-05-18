# `.isEmptyRender() => Boolean`

Returns true if the component rendered nothing. i.e. `null` or `false`.


#### Returns

`Boolean`: true if the component rendered nothing. i.e. `null` or `false`.



#### Example


```jsx
class EmptyComponent extends React.Component {
  render () {
    return null; // or false
  }
}

const wrapper = shallow(<EmptyComponent />);
expect(wrapper.isEmptyRender()).to.be(true);
```
