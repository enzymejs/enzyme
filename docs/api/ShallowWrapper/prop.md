# `.prop(key) => Any`

Returns the prop value for the root node of the wrapper with the provided key. It must be a single-node wrapper.

NOTE: When called on a shallow wrapper, `.prop(key)` will return values for
props on the root node that the component *renders*, not the component itself.
To return the props for the entire React component, use `wrapper.instance().props`.
See [`.instance() => ReactComponent`](instance.md)

#### Arguments

1. `key` (`String`): The prop name, that is, `this.props[key]` or `props[key]` for the root node of the wrapper.


#### Example


```jsx
import PropTypes from 'prop-types';
import ValidateNumberInputComponent from './ValidateNumberInputComponent';

class MyComponent extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
      number: 0,
    };
    this.onValidNumberInput = this.onValidNumberInput.bind(this);
  }

  onValidNumberInput(e) {
    const number = e.target.value;
    if (!number || typeof number === 'number') {
      this.setState({ number });
    }
  }

  render() {
    const { includedProp } = this.props;
    const { number } = this.state;
    return (
      <div className="foo bar" includedProp={includedProp}>
        <ValidateNumberInputComponent onChangeHandler={onValidNumberInput} number={number} />
      </div>
    );
  }
}
MyComponent.propTypes = {
  includedProp: PropTypes.string.isRequired,
};

const wrapper = shallow(<MyComponent includedProp="Success!" excludedProp="I'm not included" />);
expect(wrapper.prop('includedProp')).to.equal('Success!');

const validInput = 1;
wrapper.find('ValidateNumberInputComponent').prop('onChangeHandler')(validInput);
expect(wrapper.state('number')).to.equal(number);

const invalidInput = 'invalid input';
wrapper.find('ValidateNumberInputComponent').prop('onChangeHandler')(invalidInput);
expect(wrapper.state('number')).to.equal(0);

// Warning: .prop(key) only returns values for props that exist in the root node.
// See the note above about wrapper.instance().props to return all props in the React component.

console.log(wrapper.prop('includedProp'));
// "Success!"

console.log(wrapper.prop('excludedProp'));
// undefined

console.log(wrapper.instance().props.excludedProp);
// "I'm not included"
```


#### Related Methods

- [`.props() => Object`](props.md)
- [`.state([key]) => Any`](state.md)
- [`.context([key]) => Any`](context.md)
