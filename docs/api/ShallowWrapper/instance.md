# `.instance() => ReactComponent`

Gets the instance of the component being rendered as the root node passed into `shallow()`.

NOTE: can only be called on a wrapper instance that is also the root instance. With React `16.x`, `instance()` returns `null` for stateless React component/stateless functional components. See example:

#### Returns (React 16.x)

- `ReactComponent`: The stateful React component instance.
- `null`: If stateless React component was wrapped.

#### Returns (React 15.x)

- `ReactComponent`: The component instance.

#### Example

#### Preconditions
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
test('shallow wrapper instance should not be null', () => {
  const wrapper = shallow(<Stateless />);
  const instance = wrapper.instance();

  expect(instance).not.to.be.instanceOf(Stateless);
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

