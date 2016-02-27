# `.unmount() => Self`

A method that unmounts the component. This can be used to simulate a component going through
an unmount/mount lifecycle.

#### Returns

`ShallowWrapper`: Returns itself.



#### Example

```jsx
const spy = sinon.spy();

class Foo extends React.Component {
  constructor(props) {
    super(props);
    this.componentWillUnmount = spy;
  }
  render() {
    return (
      <div className={this.props.id}>
        {this.props.id}
      </div>
    );
  }
}
const wrapper = shallow(<Foo id="foo" />);
expect(spy.calledOnce).to.equal(false);
wrapper.unmount();
expect(spy.calledOnce).to.equal(true);
```
