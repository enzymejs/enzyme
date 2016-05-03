# `.rightEquals(node) => Boolean`

Returns whether or not the current wrapper root node render tree looks like the one passed in. Equality is based on the expected element (`node`) and not on the wrapper root node. It will determine if the the wrapper root node `looks like` the expected element by checking if all props of the expected element are present on the wrapper root node and equals to each other.


#### Arguments

1. `node` (`ReactElement`): The node whose presence you are detecting in the current instance's
render tree.



#### Returns

`Boolean`: whether or not the current wrapper has a node anywhere in it's render tree that looks
like the one passed in.



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

const wrapper = shallow(<MyComponent />);
expect(wrapper.rightEquals(<div>Hello</div>)).to.equal(true);
expect(wrapper.rightEquals(<div className="foo bar">Hello</div>)).to.equal(true);
```


#### Common Gotchas

- `.rightEquals()` expects a ReactElement, not a selector (like many other methods). Make sure that
when you are calling it you are calling it with a ReactElement or a JSX expression.
- Keep in mind that this method determines equality based on the equality of the node's children as
well.
