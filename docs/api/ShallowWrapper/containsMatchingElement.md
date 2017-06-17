# `.containsMatchingElement(node) => Boolean`

Returns whether or not a given react element matches one element in the render tree.
It will determine if an element in the wrapper matches the expected element by checking if all props supplied in the expected element are present on the wrapper's element and equal to each other. Props present on the wrapper element but not supplied in the expected element will be ignored.


#### Arguments

1. `node` (`ReactElement`): The node whose presence you are detecting in the current instance's
render tree.



#### Returns

`Boolean`: whether or not the current wrapper has a node anywhere in its render tree that matches
the one passed in.



#### Example


```jsx
const wrapper = shallow((
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
