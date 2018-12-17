# `.containsAllMatchingElements(patternNodes) => Boolean`

Returns whether or not all of the given react elements in `patternNodes` match an element in the wrapper's render tree. Every single element of `patternNodes` must be matched one or more times. Matching follows the rules for `containsMatchingElement`.


#### Arguments

1. `patternNodes` (`Array<ReactElement>`): The array of nodes whose presence you are detecting in the current instance's
render tree.


#### Returns

`Boolean`: whether or not the current wrapper has nodes anywhere in its render tree that looks
like the nodes passed in.


#### Example


```jsx
const style = { fontSize: 13 };
const wrapper = shallow((
  <div>
    <span className="foo">Hello</span>
    <div style={style}>Goodbye</div>
    <span>Again</span>
  </div>
));

expect(wrapper.containsAllMatchingElements([
  <span>Hello</span>,
  <div>Goodbye</div>,
])).to.equal(true);
```


#### Common Gotchas

- `.containsAllMatchingElements()` expects an array of ReactElement, not a selector (like many other methods). Make sure that
when you are calling it you are calling it with an array of ReactElement or a JSX expression.
- Keep in mind that this method determines matching based on the matching of the node's children as
well.


#### Related Methods

- [`.matchesElement() => ShallowWrapper`](matchesElement.md) - rules for matching each node
- [`.containsMatchingElement() => ShallowWrapper`](containsMatchingElement.md) - rules for matching whole wrapper
- [`.containsAnyMatchingElements() => ShallowWrapper`](containsAnyMatchingElements.md) - must match at least one in patternNodes
