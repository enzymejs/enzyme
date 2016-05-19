# `.simulate(event[, ...args]) => Self`

Simulate events. The propagation behavior of browser events is simulated — however,
this method does not emit an actual event. Event handlers are called with a SyntheticEvent object.


#### Arguments

1. `event` (`String`): The event name to be simulated
2. `mock` (`Object` [optional]): A mock event object that will be merged with the event
object passed to the handlers.



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

const wrapper = shallow(<Foo />);

expect(wrapper.find('.clicks-0').length).to.equal(1);
wrapper.find('a').simulate('click');
expect(wrapper.find('.clicks-1').length).to.equal(1);
```


#### Common Gotchas

- Even though the name would imply this simulates an actual event, `.simulate()` will in fact
target the component's prop based on the event you give it. For example, `.simulate('click')` will
actually get the `onClick` prop and call it.
