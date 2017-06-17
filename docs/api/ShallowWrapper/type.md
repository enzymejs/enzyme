# `.type() => String|Function|null`

Returns the type of the current node of this wrapper. If it's a composite component, this will be
the component constructor. If it's native DOM node, it will be a string of the tag name. If it's `null`, it will be `null`.

Note: can only be called on a wrapper of a single node.


#### Returns

`String|Function|null`: The type of the current node



#### Examples

```jsx
function Foo() {
  return <div />;
}
const wrapper = shallow(<Foo />);
expect(wrapper.type()).to.equal('div');
```

```jsx
function Foo() {
  return (
    <div>
      <button className="btn">Button</button>
    </div>
  );
}
const wrapper = shallow(<Foo />);
expect(wrapper.find('.btn').type()).to.equal('button');
```

```jsx
function Foo() {
  return <Bar />;
}
const wrapper = shallow(<Foo />);
expect(wrapper.type()).to.equal(Bar);
```

```jsx
function Null() {
  return null;
}
const wrapper = shallow(<Null />);
expect(wrapper.type()).to.equal(null);
```
