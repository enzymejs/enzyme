# `.renderProp(propName)(...args) => ReactWrapper`

Returns a function that, when called with arguments `args`, will return a new wrapper based on the render prop in the original wrapper's prop `propName`.

NOTE: can only be called on wrapper of a single non-DOM component element node.

#### Arguments

1. `propName` (`String`):
1. `...args` (`Array<Any>`):

This essentially calls `wrapper.prop(propName)(...args)`.

#### Returns

`ReactWrapper`: A new wrapper that wraps the node returned from the render prop.

#### Examples

##### Test Setup

```jsx
class Mouse extends React.Component {
  constructor() {
    super();
    this.state = { x: 0, y: 0 };
  }

  render() {
    const { render } = this.props;
    return (
      <div
        style={{ height: '100%' }}
        onMouseMove={(event) => {
          this.setState({
            x: event.clientX,
            y: event.clientY,
          });
        }}
      >
        {render(this.state)}
      </div>
    );
  }
}

Mouse.propTypes = {
  render: PropTypes.func.isRequired,
};
```

```jsx
const App = () => (
  <div style={{ height: '100%' }}>
    <Mouse
      render={(x = 0, y = 0) => (
        <h1>
          The mouse position is ({x}, {y})
        </h1>
      )}
    />
  </div>
);
```

##### Testing with no arguments

```jsx
const wrapper = mount(<App />)
  .find(Mouse)
  .renderProp('render')();

expect(wrapper.equals(<h1>The mouse position is 0, 0</h1>)).to.equal(true);
```

##### Testing with multiple arguments

```jsx
const wrapper = mount(<App />)
  .find(Mouse)
  .renderProp('render')(10, 20);

expect(wrapper.equals(<h1>The mouse position is 10, 20</h1>)).to.equal(true);
```
