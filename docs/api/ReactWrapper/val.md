# `.val(value[, mock]) => Self`

Simulate change value events


#### Arguments

1. `value` (`String`): The value
2. `mock` (`Object` [optional]): A mock event object that will be merged with the event object passed to the handlers.



#### Returns

`ReactWrapper`: Returns itself.



#### Example

```jsx
class Foo extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: 'original value' };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.setState({ value: event.target.value });
  }

  render() {
    return (
        <input type="text"
          value={this.state.value}
          onChange={this.handleChange}
        />
    );
  }
}

const wrapper = mount(<Foo />);

expect(wrapper.find('input').props().value).to.equal('original value');
wrapper.val('new value');
expect(wrapper.find('input').props().value).to.equal('new value');
```



#### Related Methods

- [`.simulate(event[, mock] => Self`](simulate.md)
- [`.click([mock]) => Self`](click.md)