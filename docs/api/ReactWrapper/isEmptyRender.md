# `.isEmptyRender() => Boolean`

Returns `true` if the component rendered nothing, i.e., `null` or `false`.


#### Returns

`Boolean`: whether or not the component rendered nothing.



#### Example

```jsx
const Foo = React.createClass({
    render() {
        return null;
    },
});

const wrapper = mount(<Foo />);
expect(wrapper.isEmptyRender()).to.be(true);
```
