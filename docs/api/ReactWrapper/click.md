# `.click([mock]) => Self`

Simulate click events


#### Arguments

1. `mock` (`Object` [optional]): A mock event object that will be merged with the event object passed to the handlers.



#### Returns

`ReactWrapper`: Returns itself.



#### Example

```jsx
class Foo extends React.Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
    this.incrementCount = this.incrementCount.bind(this);
  }

  incrementCount() {
    this.setState({ count: this.state.count + 1 });
  }

  render() {
    return (
        <a
          className={`clicks-${this.state.count}`}
          onClick={this.incrementCount}
        >foo</a>
    );
  }
}

const wrapper = mount(<Foo />);

expect(wrapper.find('.clicks-0').length).to.equal(1);
wrapper.click();
expect(wrapper.find('.clicks-1').length).to.equal(1);
```



#### Related Methods

- [`.simulate(event[, mock] => Self`](simulate.md)
- [`.val(value[, mock]) => Self`](val.md)