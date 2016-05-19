# `.containsMatchingElement(node) => Boolean`

Returns whether or not a given react element is matching one element in the shallow render tree.
It will determine if an element in the wrapper __looks like__ the expected element by checking if all props of the expected element are present on the wrappers element and equals to each other.


#### Arguments

1. `node` (`ReactElement`): The node whose presence you are detecting in the current instance's
render tree.



#### Returns

`Boolean`: whether or not the current wrapper has a node anywhere in its render tree that looks
like the one passed in.



#### Example


```jsx
const MyComponent = React.createClass({
  handleClick() {
    ...
  },
  render() {
    return (
      <div>
        <div onClick={this.handleClick} className="foo bar">Hello</div>
      </div>
    );
  }
});

const wrapper = shallow(<MyComponent />);
expect(wrapper.containsMatchingElement(
  <div>Hello</div>
)).to.equal(true);
expect(wrapper.containsMatchingElement(
  <div className="foo bar">Hello</div>
)).to.equal(true);
```

#### Common Gotchas

- `.containsMatchingElement()` expects a ReactElement, not a selector (like many other methods). Make sure that
when you are calling it you are calling it with a ReactElement or a JSX expression.
- Keep in mind that this method determines equality based on the equality of the node's children as
well.
