# `.simulate(event[, ...args]) => Self`

Simulate events


#### Arguments

1. `event` (`String`): The event name to be simulated
2. `...args` (`Any` [optional]): A mock event object that will get passed through to the event
handlers.



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
        <a href="url" onClick={() => { this.setState({ count: count + 1 }); }}>
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

- Currently, event simulation for the shallow renderer does not propagate as one would normally
expect in a real environment. As a result, one must call `.simulate()` on the actual node that has
the event handler set.
- Even though the name would imply this simulates an actual event, `.simulate()` will in fact
target the component's prop based on the event you give it. For example, `.simulate('click')` will
actually get the `onClick` prop and call it.
