# `.matchesElement(node) => Boolean`

Returns whether or not a given react element matches the current render tree.
It will determine if the the wrapper root node __looks like__ the expected element by checking if all props of the expected element are present on the wrapper root node and equals to each other.


#### Arguments

1. `node` (`ReactElement`): The node whose presence you are detecting in the current instance's
render tree.



#### Returns

`Boolean`: whether or not the current wrapper match the one passed in.



#### Example


```jsx
onst MyComponent = React.createClass({
  handleClick() {
    ...
  },
  render() {
    return (
      <div onClick={this.handleClick} className="foo bar">Hello</div>
    );
  }
});

const wrapper = mount(<MyComponent />);
expect(wrapper.matchesElement(
  <div>Hello</div>
)).to.equal(true);
expect(wrapper.matchesElement(
  <div className="foo bar">Hello</div>
)).to.equal(true);
```


#### Common Gotchas

- `.matchesElement()` expects a ReactElement, not a selector (like many other methods). Make sure that
when you are calling it you are calling it with a ReactElement or a JSX expression.
- Keep in mind that this method determines matching based on the matching of the node's children as
well.
