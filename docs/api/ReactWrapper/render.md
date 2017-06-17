# `.render() => CheerioWrapper`

Returns a CheerioWrapper around the rendered HTML of the current node's subtree.

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
expect(wrapper.find(Foo).render().find('.in-foo')).to.have.length(1);
```
