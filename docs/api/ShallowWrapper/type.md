# `.type() => String|Function|null`

Returns the type of the current node of this wrapper. If it's a composite component, this will be
the component constructor. If it's native DOM node, it will be a string of the tag name. If it's `null`, it will be `null`.

Note: can only be called on a wrapper of a single node.


#### Returns

`String|Function|null`: The type of the current node



#### Examples

```jsx
const wrapper = shallow(<div/>);
expect(wrapper.type()).to.equal('div');
```

```jsx
const wrapper = shallow(<Foo />);
expect(wrapper.type()).to.equal(Foo);
```

```jsx
class Null extends React.Component {
  render() {
    return null;
  }
}
const wrapper = shallow(<Null />);
expect(wrapper.type()).to.equal(null);
```
