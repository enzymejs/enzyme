# `.simulate(event[, ...args]) => Self`

Simulate events


#### Arguments

1. `event` (`String`): The event name to be simulated
2. `...args` (`Any` [optional]): A mock event object that will get passed through to the event 
handlers.



#### Returns

`ReactWrapper`: Returns itself.



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
        <div className={`clicks-${count}`}>
          {count} clicks
        </div>
        <a onClick={() => this.setState({ count: count + 1 })}>
          Increment
        </a>
      </div>
    );
  }
}

const wrapper = mount(<Foo />);

expect(wrapper.find('.clicks-0').length).to.equal(1);
wrapper.find('a').simulate('click');
expect(wrapper.find('.clicks-1').length).to.equal(1);
```
