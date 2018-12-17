# `.simulate(event[, mock]) => Self`

Simulate events on the root node in the wrapper. It must be a single-node wrapper.


#### Arguments

1. `event` (`String`): The event name to be simulated
2. `mock` (`Object` [optional]): A mock event object that will be merged with the event object passed to the handlers.


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
        <a href="url" onClick={() => { this.setState({ count: count + 1 }); }}>
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



#### Common Gotchas

- As noted in the function signature above passing a mock event is optional. It is worth noting that `ReactWrapper` will pass a `SyntheticEvent` object to the event handler in your code. Keep in mind that if the code you are testing uses properties that are not included in the `SyntheticEvent`, for instance `event.target.value`, you will need to provide a mock event like so `.simulate("change", { target: { value: "foo" }})` for it to work.

