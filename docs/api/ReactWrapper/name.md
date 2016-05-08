# `.name() => String|null`

Returns the name of the current node of this wrapper. If it's a composite component, this will be
the name of the component. If it's native DOM node, it will be a string of the tag name. If it's
`null`, it will be `null`.

The order of precedence on returning the name is: `type.displayName` -> `type.name` -> `type`.

Note: can only be called on a wrapper of a single node.


#### Returns

`String|null`: The name of the current node



#### Examples

```jsx
const wrapper = mount(<div/>);
expect(wrapper.name()).to.equal('div');
```

```jsx
const wrapper = mount(<Foo />);
expect(wrapper.name()).to.equal('Foo');
```

```jsx
Foo.displayName = 'A cool custom name';
const wrapper = mount(<Foo />);
expect(wrapper.name()).to.equal('A cool custom name');
```
