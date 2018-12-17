# `.ref(refName) => ReactComponent | HTMLElement`

Returns the node that matches the provided reference name.


NOTE: can only be called on a wrapper instance that is also the root instance.

#### Arguments

1. `refName` (`String`): The ref attribute of the node


#### Returns

`ReactComponent | HTMLElement`: The node that matches the provided reference name. This can be a react component instance, or an HTML element instance.


#### Examples

<!-- eslint react/no-string-refs: 1 -->
```jsx
class Foo extends React.Component {
  render() {
    return (
      <div>
        <span ref="firstRef" amount={2}>First</span>
        <span ref="secondRef" amount={4}>Second</span>
        <span ref="thirdRef" amount={8}>Third</span>
      </div>
    );
  }
}
```

```jsx
const wrapper = mount(<Foo />);
expect(wrapper.ref('secondRef').innerText).to.equal('Second');
```


#### Related Methods

- [`.find(selector) => ReactWrapper`](find.md)
- [`.findWhere(predicate) => ReactWrapper`](findWhere.md)
