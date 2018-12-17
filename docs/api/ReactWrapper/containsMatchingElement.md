# `.containsMatchingElement(patternNode) => Boolean`

Returns whether or not a `patternNode` react element matches any element in the render tree.
* the matches can happen anywhere in the wrapper's contents
* the wrapper can contain more than one node; all are searched

Otherwise, the match follows the same rules as `matchesElement`.


#### Arguments

1. `patternNode` (`ReactElement`): The node whose presence you are detecting in the current instance's
render tree.


#### Returns

`Boolean`: whether or not the current wrapper has a node anywhere in its render tree that matches
the one passed in.



#### Example


```jsx
const wrapper = mount((
  <div>
    <div data-foo="foo" data-bar="bar">Hello</div>
  </div>
));

expect(wrapper.containsMatchingElement(<div data-foo="foo" data-bar="bar">Hello</div>)).to.equal(true);
expect(wrapper.containsMatchingElement(<div data-foo="foo">Hello</div>)).to.equal(true);

expect(wrapper.containsMatchingElement(<div data-foo="foo" data-bar="bar" data-baz="baz">Hello</div>)).to.equal(false);
expect(wrapper.containsMatchingElement(<div data-foo="foo" data-bar="Hello">Hello</div>)).to.equal(false);
expect(wrapper.containsMatchingElement(<div data-foo="foo" data-bar="bar" />)).to.equal(false);
```

#### Common Gotchas

- `.containsMatchingElement()` expects a ReactElement, not a selector (like many other methods). Make sure that
when you are calling it you are calling it with a ReactElement or a JSX expression.
- Keep in mind that this method determines equality based on the equality of the node's children as
well.


#### Related Methods

- [`.containsAllMatchingElements() => ReactWrapper`](containsAllMatchingElements.md) - must match all nodes in patternNodes
- [`.containsAnyMatchingElements() => ReactWrapper`](containsAnyMatchingElements.md) - must match at least one in patternNodes
