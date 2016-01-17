# `.contains(node) => Boolean`

Returns whether or not the current wrapper has a node anywhere in it's render tree that looks like
the one passed in.


#### Arguments

1. `node` (`ReactElement`): The node whose presence you are detecting in the current instance's
render tree.



#### Returns

`Boolean`: whether or not the current wrapper has a node anywhere in it's render tree that looks
like the one passed in.



#### Example


```jsx
const wrapper = shallow(<MyComponent />);
expect(wrapper.contains(<div className="foo bar" />)).to.equal(true);
```


#### Common Gotchas

- `.contains()` expects a ReactElement, not a selector (like many other methods). Make sure that
when you are calling it you are calling it with a ReactElement or a JSX expression.
- Keep in mind that this method determines equality based on the equality of the node's children as
well.
