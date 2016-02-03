# `.unmount() => Self`

A method that unmounts the component. This can be used to simulate a component going through
an unmount/mount lifecycle.

#### Returns

`ReactWrapper`: Returns itself.



#### Example

```jsx
const willMount = sinon.spy();
const didMount = sinon.spy();
const willUnmount = sinon.spy();

class Foo extends React.Component {
  constructor(props) {
    super(props);
    this.componentWillUnmount = willUnmount;
    this.componentWillMount = willMount;
    this.componentDidMount = didMount;
  }
  render() {
    return (
      <div className={this.props.id}>
        {this.props.id}
      </div>
    );
  }
}
const wrapper = mount(<Foo id="foo" />);
expect(willMount.callCount).to.equal(1);
expect(didMount.callCount).to.equal(1);
expect(willUnmount.callCount).to.equal(0);
wrapper.unmount();
expect(willMount.callCount).to.equal(1);
expect(didMount.callCount).to.equal(1);
expect(willUnmount.callCount).to.equal(1);
```


#### Related Methods

- [`.mount() => Self`](mount.md)
