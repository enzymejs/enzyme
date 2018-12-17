# `.containsAnyMatchingElements(patternNodes) => Boolean`

Returns whether or not at least one of the given react elements in `patternNodes` matches an element in the wrapper's render tree. One or more elements of `patternNodes` must be matched one or more times. Matching follows the rules for `containsMatchingElement`.


#### Arguments

1. `patternNodes` (`Array<ReactElement>`): The array of nodes whose presence you are detecting in the current instance's
render tree.


#### Returns

`Boolean`: whether or not the current wrapper has a node anywhere in its render tree that looks
like one of the array passed in.


#### Example


```jsx
const style = { fontSize: 13 };
const wrapper = mount((
  <div>
    <span className="foo">Hello</span>
    <div style={style}>Goodbye</div>
    <span>Again</span>
  </div>
));

expect(wrapper.containsAnyMatchingElements([
  <span>Bonjour</span>,
  <div>Goodbye</div>,
])).to.equal(true);
```


#### Common Gotchas

- `.containsAnyMatchingElements()` expects an array of ReactElement, not a selector (like many other methods). Make sure that
when you are calling it you are calling it with an array ReactElement or a JSX expression.
- Keep in mind that this method determines equality based on the equality of the node's children as
well.


#### Related Methods

- [`.matchesElement() => ReactWrapper`](matchesElement.md) - rules for matching each node
- [`.containsMatchingElement() => ReactWrapper`](containsMatchingElement.md) - rules for matching whole wrapper
- [`.containsAllMatchingElements() => ReactWrapper`](containsAllMatchingElements.md) - must match all nodes in patternNodes
