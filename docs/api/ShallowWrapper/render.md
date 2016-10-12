# `.render() => CheerioWrapper`

Returns a CheerioWrapper around the rendered HTML of the current node's subtree.

Note: can only be called on a wrapper of a single node.


#### Returns

`CheerioWrapper`: The resulting Cheerio object



#### Examples

```jsx
class Foo extends React.Component {
  render() {
    return (<div className="in-foo" />);
  }
}
```

```jsx
class Bar extends React.Component {
  render() {
    return (
      <div className="in-bar">
        <Foo />
      </div>
    );
  }
}
```

```jsx
const wrapper = shallow(<Bar />);
expect(wrapper.find('.in-foo')).to.have.length(0);
expect(wrapper.find(Foo).render().find('.in-foo')).to.have.length(1);
```
