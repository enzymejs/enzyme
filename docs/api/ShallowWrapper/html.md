# `.html() => String`

Returns a string of the rendered HTML markup of the entire current render tree (not just the shallow-rendered part). It uses [static rendering](../render.md) internally. To see only the shallow-rendered part use [`.debug()`](debug.md).

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
const wrapper = shallow(<Bar />);
expect(wrapper.html()).to.equal('<div class="in-bar"><div class="in-foo"></div></div>');
expect(wrapper.find(Foo).html()).to.equal('<div class="in-foo"></div>');
```

```jsx
const wrapper = shallow(<div><b>important</b></div>);
expect(wrapper.html()).to.equal('<div><b>important</b></div>');
```


#### Related Methods

- [`.text() => String`](text.md)
- [`.debug() => String`](debug.md)
