# `.invoke(event[, ...args]) => Self`

Invoke event handlers


#### Arguments

1. `event` (`String`): The event name to be invoked
2. `...args` (`Any` [optional]): Arguments that will be passed to the event handler



#### Returns

`ShallowWrapper`: Returns itself.



#### Example

```jsx
class Foo extends React.Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
  }
  render() {
    const { count } = this.state;
    return (
      <div>
        <div data-clicks={count}>
          {count} clicks
        </div>
        <a onClick={() => this.setState({ count: count + 1 })}>
          Increment
        </a>
      </div>
    );
  }
}

const wrapper = shallow(<Foo />);

expect(wrapper.find('[data-clicks=0]').length).to.equal(1);
wrapper.find('a').invoke('click');
expect(wrapper.find('[data-clicks=1]').length).to.equal(1);
```

#### Related Methods

- [`.simulate(event[, mock]) => Self`](simulate.md)
