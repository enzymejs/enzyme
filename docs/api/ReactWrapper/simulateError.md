# `.simulateError(error) => Self`

Simulate a component throwing an error as part of its rendering lifecycle.

This is particularly useful in combination with React 16 error boundaries (ie, the `componentDidCatch` lifecycle method).


#### Arguments

1. `error` (`Any`): The error to throw.



#### Returns

`ReactWrapper`: Returns itself.



#### Example

```jsx
function Something() {
  // this is just a placeholder
  return null;
}

class ErrorBoundary extends React.Component {
  componentDidCatch(error, info) {
    const { spy } = this.props;
    spy(error, info);
  }

  render() {
    const { children } = this.props;
    return (
      <React.Fragment>
        {children}
      </React.Fragment>
    );
  }
}
ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  spy: PropTypes.func.isRequired,
};

const spy = sinon.spy();
const wrapper = mount(<ErrorBoundary spy={spy}><Something /></ErrorBoundary>);
const error = new Error('hi!');
wrapper.find(Something).simulateError(error);

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


