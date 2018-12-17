# `.instance() => ReactComponent`

Returns the single-node wrapper's node's underlying class instance; `this` in its methods.

NOTE: can only be called on a wrapper instance that is also the root instance. With React `16` and above, `instance()` returns `null` for stateless functional components.


#### Returns

`ReactComponent|DOMComponent`: The retrieved instance.


#### Example

<!-- eslint react/prop-types: 0, react/prefer-stateless-function: 0 -->
```jsx
function Stateless() {
  return <div>Stateless</div>;
}

class Stateful extends React.Component {
  render() {
    return <div>Stateful</div>;
  }
}
```

#### React 16.x
```jsx
test('shallow wrapper instance should be null', () => {
  const wrapper = shallow(<Stateless />);
  const instance = wrapper.instance();

  expect(instance).to.equal(null);
});

test('shallow wrapper instance should not be null', () => {
  const wrapper = shallow(<Stateful />);
  const instance = wrapper.instance();

  expect(instance).to.be.instanceOf(Stateful);
});
```

#### React 15.x
```jsx
test('shallow wrapper instance should not be null', () => {
  const wrapper = shallow(<Stateless />);
  const instance = wrapper.instance();

  expect(instance).to.be.instanceOf(Stateless);
});

test('shallow wrapper instance should not be null', () => {
  const wrapper = shallow(<Stateful />);
  const instance = wrapper.instance();

  expect(instance).to.be.instanceOf(Stateful);
});
```
