# `.render() => CheerioWrapper`

Returns a CheerioWrapper around the rendered HTML of the single node's subtree.
It must be a single-node wrapper.


#### Returns

`CheerioWrapper`: The resulting Cheerio object


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
expect(wrapper.find(Foo).render().find('.in-foo')).to.have.lengthOf(1);
```
