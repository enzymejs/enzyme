# `.matchesElement(patternNode) => Boolean`

Returns whether or not a given react element `patternNode` matches the wrapper's render tree. It must be a single-node wrapper, and only the root node is checked.

The `patternNode` acts like a wildcard. For it to match a node in the wrapper:
* tag names must match
* contents must match:  In text nodes, leading and trailing spaces are ignored, but not space in the middle. Child elements must match according to these rules, recursively.
* `patternNode` props (attributes) must appear in the wrapper's nodes, but not the other way around. Their values must match if they do appear.
* `patternNode` style CSS properties must appear in the wrapper's node's style, but not the other way around. Their values must match if they do appear.


#### Arguments

1. `patternNode` (`ReactElement`): The node whose presence you are detecting in the wrapper's single node.


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


#### Related Methods

- [`.containsMatchingElement() => ShallowWrapper`](containsMatchingElement.md) - searches all nodes in the wrapper, and searches their entire depth
