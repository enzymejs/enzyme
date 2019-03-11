# `.simulateError(error) => Self`

Simulate a component throwing an error as part of its rendering lifecycle.

This is particularly useful in combination with React 16 error boundaries (ie, the `componentDidCatch` and `static getDerivedStateFromError` lifecycle methods).


#### Arguments

1. `error` (`Any`): The error to throw.



#### Returns

`ShallowWrapper`: Returns itself.



#### Example

```jsx
function Something() {
  // this is just a placeholder
  return null;
}

class ErrorBoundary extends React.Component {
  static getDerivedStateFromError(error) {
    return {
      hasError: true,
    };
  }

  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error, info) {
    const { spy } = this.props;
    spy(error, info);
  }

  render() {
    const { children } = this.props;
    const { hasError } = this.state;
    return (
      <React.Fragment>
        {hasError ? 'Error' : children}
      </React.Fragment>
    );
  }
}
ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  spy: PropTypes.func.isRequired,
};

const spy = sinon.spy();
const wrapper = shallow(<ErrorBoundary spy={spy}><Something /></ErrorBoundary>);
const error = new Error('hi!');
wrapper.find(Something).simulateError(error);

expect(wrapper.state()).to.have.property('hasError', true);
expect(spy).to.have.property('callCount', 1);
expect(spy.args).to.deep.equal([
  error,
  {
    componentStack: `
    in Something (created by ErrorBoundary)
    in ErrorBoundary (created by WrapperComponent)
    in WrapperComponent`,
  },
]);
```


