# `.unmount() => Self`

A method that unmounts the component. This can be used to simulate a component going through
an unmount/mount lifecycle.

#### Returns

`ShallowWrapper`: Returns itself.



#### Example

```jsx
import PropTypes from 'prop-types';

const spy = sinon.spy();

class Foo extends React.Component {
  constructor(props) {
    super(props);
    this.componentWillUnmount = spy;
  }

  render() {
    const { id } = this.props;
    return (
      <div className={id}>
        {id}
      </div>
    );
  }
}
Foo.propTypes = {
  id: PropTypes.string.isRequired,
};
const wrapper = shallow(<Foo id="foo" />);
expect(spy.calledOnce).to.equal(false);
wrapper.unmount();
expect(spy.calledOnce).to.equal(true);
```
