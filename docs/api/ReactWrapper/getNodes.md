# `.getNodes() => Array<ReactElement>`

Returns the wrapper's underlying nodes.


#### Returns

`Array<ReactElement>`: The retrieved nodes.



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
expect(wrapper.find('span').getNodes()).to.have.lengthOf(2);
```



#### Related Methods

- [`.getNode() => ReactElement`](getNode.md)
