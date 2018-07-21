# `.mount() => Self`

A method that re-mounts the component, if it is not currently mounted. This can be used to simulate a component going through
an unmount/mount lifecycle.

#### Returns

`ReactWrapper`: Returns itself.



#### Example

```jsx
import PropTypes from 'prop-types';
import sinon from 'sinon';

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

const wrapper = mount(<Foo id="foo" />);
expect(willMount).to.have.property('callCount', 1);
expect(didMount).to.have.property('callCount', 1);
expect(willUnmount).to.have.property('callCount', 0);
wrapper.unmount();
expect(willMount).to.have.property('callCount', 1);
expect(didMount).to.have.property('callCount', 1);
expect(willUnmount).to.have.property('callCount', 1);
wrapper.mount();
expect(willMount).to.have.property('callCount', 2);
expect(didMount).to.have.property('callCount', 2);
expect(willUnmount).to.have.property('callCount', 1);
```


#### Related Methods

- [`.unmount() => Self`](unmount.md)
