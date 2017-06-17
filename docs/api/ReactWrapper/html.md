# `.html() => String`

Returns a string of the rendered HTML markup of the current render tree. See also [.debug()](debug.md)

Note: can only be called on a wrapper of a single node.


#### Returns

`String`: The resulting HTML string



#### Examples

```jsx
function Foo() {
  return (<div className="in-foo" />);
}
```

```jsx
function Bar() {
  return (
    <div className="in-bar">
      <Foo />
    </div>
  );
}
```

```jsx
const wrapper = mount(<Bar />);
expect(wrapper.html()).to.equal('<div class="in-bar"><div class="in-foo"></div></div>');
expect(wrapper.find(Foo).html()).to.equal('<div class="in-foo"></div>');
```

```jsx
const wrapper = mount(<div><b>important</b></div>);
expect(wrapper.html()).to.equal('<div><b>important</b></div>');
```


#### Related Methods

[`.text() => String`](text.md)
