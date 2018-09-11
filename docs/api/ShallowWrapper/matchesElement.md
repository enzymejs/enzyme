# `.matchesElement(node) => Boolean`

Returns whether or not a given react element matches the shallow render tree.
It will determine if the wrapper root node __looks like__ the expected element by checking if all props of the expected element are present on the wrapper root node and equals to each other.


#### Arguments

1. `node` (`ReactElement`): The node whose presence you are detecting in the current instance's
render tree.



#### Returns

`Boolean`: whether or not the current wrapper match the one passed in.



#### Example

<!-- eslint-disable react/button-has-type -->
```jsx
class MyComponent extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    // ...
  }

  render() {
    return (
      <button type="button" onClick={this.handleClick} className="foo bar">Hello</button>
    );
  }
}

const wrapper = shallow(<MyComponent />);
expect(wrapper.matchesElement(<button>Hello</button>)).to.equal(true);
expect(wrapper.matchesElement(<button className="foo bar">Hello</button>)).to.equal(true);
```


#### Common Gotchas

- `.matchesElement()` expects a ReactElement, not a selector (like many other methods). Make sure that
when you are calling it you are calling it with a ReactElement or a JSX expression.
- Keep in mind that this method determines matching based on the matching of the node's children as
well.
