# `.simulate(event[, mock]) => Self`

Simulate events on the root node in the wrapper. It must be a single-node wrapper.


#### Arguments

1. `event` (`String`): The event name to be simulated
2. `mock` (`Object` [optional]): A mock event object that will be merged with the event object passed to the handlers.


#### Returns

`ReactWrapper`: Returns itself.


#### Example `class component`

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

#### Example `functional component`

```jsx
const Foo = ({ width, height, onChange }) => (
  <div>
    <input name="width" value={width} onChange={onChange} />
    <input name="height" value={height} onChange={onChange} />
  </div>
);
Foo.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
};

const testState = { width: 10, height: 20 };
const wrapper = mount((
  <Foo
    width={testState.width}
    height={testState.height}
    onChange={(e) => {
      testState[e.target.name] = e.target.value;
    }}
  />
));

expect(wrapper.find('input').at(0).prop('value')).toEqual(10);
expect(wrapper.find('input').at(1).prop('value')).toEqual(20);
wrapper.find('input').at(0).simulate('change', { target: { name: 'width', value: 50 } });
wrapper.find('input').at(1).simulate('change', { target: { name: 'height', value: 70 } });
expect(testState.width).toEqual(50);
expect(testState.height).toEqual(70);
```

#### Common Gotchas

- As noted in the function signature above passing a mock event is optional. It is worth noting that `ReactWrapper` will pass a `SyntheticEvent` object to the event handler in your code. Keep in mind that if the code you are testing uses properties that are not included in the `SyntheticEvent`, for instance `event.target.value`, you will need to provide a mock event like so `.simulate("change", { target: { value: "foo" }})` for it to work.

