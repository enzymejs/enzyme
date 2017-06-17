# `.type() => String|Function`

Returns the type of the current node of this wrapper. If it's a composite component, this will be
the component constructor. If it's native DOM node, it will be a string of the tag name.

Note: can only be called on a wrapper of a single node.


#### Returns

`String|Function`: The type of the current node



#### Examples

```jsx
const wrapper = mount(<div />);
expect(wrapper.type()).to.equal('div');
```

```jsx
const wrapper = mount(<Foo />);
expect(wrapper.type()).to.equal(Foo);
```
