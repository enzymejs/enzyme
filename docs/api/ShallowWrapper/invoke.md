# `.invoke(event[, ...args]) => Any`

Invokes an event handler (a prop that matches the event name).

#### Arguments

1. `event` (`String`): The event name to be invoked
2. `...args` (`Any` [optional]): Arguments that will be passed to the event handler

#### Returns

`Any`: Returns the value from the event handler..

#### Example

```jsx
class Foo extends React.Component {
  loadData() {
    return fetch();
  }
  render() {
    return (
      <a onClick={() => this.loadData()}>
        Load more
      </a>
    );
  }
}

const wrapper = shallow(<Foo />);

wrapper.invoke('click').then(() => {
  // expect()
});
```

#### Related Methods

- [`.simulate(event[, data]) => Self`](simulate.md)
