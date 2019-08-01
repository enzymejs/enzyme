# `.instance() => ReactComponent`

Returns the single-node wrapper's node's underlying class instance; `this` in its methods. It must be a single-node wrapper.

NOTE: can only be called on a wrapper instance that is also the root instance. With React `16` and above, `instance()` returns `null` for functional components, regardless of [hooks](https://reactjs.org/docs/hooks-intro.html) usage.

#### Returns

`ReactComponent|DOMComponent`: The retrieved instance.

#### Example

<!-- eslint react/prop-types: 0, react/prefer-stateless-function: 0 -->

```jsx
function SFC() {
  return <div>MyFunction</div>;
}

class Stateful extends React.Component {
  render() {
    return <div>MyClass</div>;
  }
}
```

#### React 16.x

```jsx
test('wrapper instance is null', () => {
  const wrapper = shallow(<SFC />);
  const instance = wrapper.instance();

  expect(instance).to.equal(null);
});

test('wrapper instance is not null', () => {
  const wrapper = shallow(<Stateful />);
  const instance = wrapper.instance();

  expect(instance).to.be.instanceOf(MyCStatefullass);
});
```

#### React 15.x

```jsx
test('wrapper instance is not null', () => {
  const wrapper = shallow(<SFC />);
  const instance = wrapper.instance();

  expect(instance).to.be.instanceOf(SFC);
});

test('wrapper instance is not null', () => {
  const wrapper = shallow(<Stateful />);
  const instance = wrapper.instance();

  expect(instance).to.be.instanceOf(Stateful);
});
```
