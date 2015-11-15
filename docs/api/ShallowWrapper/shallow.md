# `.shallow() => ShallowWrapper`

Shallow renders the current node and returns a shallow wrapper around it.

NOTE: can only be called on wrapper of a single node.




#### Returns

`ShallowWrapper`: A new wrapper that wraps the current node after it's been shallow rendered.



#### Examples

```jsx
class Bar extends React.Component {
  render() {
    return (
      <div>
        <div className="in-bar" />
      </div>
    );
  }
}
```

```jsx
class Foo extends React.Component {
  render() {
    return (
      <div>
        <Bar />
      </div>
    );
  }
}
```

```jsx
const wrapper = shallow(<Foo />);
expect(wrapper.find('.in-bar')).to.have.length(0);
expect(wrapper.find(Bar)).to.have.length(1);
expect(wrapper.find(Bar).shallow().find('.in-bar')).to.have.length(1);
```
