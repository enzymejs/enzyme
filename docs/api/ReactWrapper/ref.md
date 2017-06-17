# `.ref(refName) => ReactWrapper`

Returns a wrapper of the node that matches the provided reference name.


NOTE: can only be called on a wrapper instance that is also the root instance.

#### Arguments

1. `refName` (`String`): The ref attribute of the node


#### Returns

`ReactWrapper`: A wrapper of the node that matches the provided reference name.



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
expect(wrapper.ref('secondRef').prop('amount')).to.equal(4);
expect(wrapper.ref('secondRef').text()).to.equal('Second');
```


#### Related Methods

- [`.find(selector) => ReactWrapper`](find.md)
- [`.findWhere(predicate) => ReactWrapper`](findWhere.md)
