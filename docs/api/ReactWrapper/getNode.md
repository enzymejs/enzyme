# `.getNode() => ReactElement`

Returns the wrapper's underlying node.


#### Returns

`ReactElement`: The retrieved node.



#### Examples

```jsx
class Test extends React.Component {
  render() {
    return (
      <div>
        <span />
        <span />
      </div>
    );
  }
}

const wrapper = mount(<Test />);
expect(wrapper.getNode()).to.be.an.instanceof(Test);
```



#### Related Methods

- [`.getNodes() => Array<ReactElement>`](getNodes.md)
