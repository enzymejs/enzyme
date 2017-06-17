# `.contains(nodeOrNodes) => Boolean`

Returns whether or not all given react elements match elements in the render tree.
It will determine if an element in the wrapper matches the expected element by checking if the expected element has the same props as the wrapper's element and share the same values.


#### Arguments

1. `nodeOrNodes` (`ReactElement|Array<ReactElement>`): The node or array of nodes whose presence you are detecting in the current instance's
render tree.



#### Returns

`Boolean`: whether or not the current wrapper has nodes anywhere in its render tree that match
the ones passed in.



#### Example


```jsx
const wrapper = shallow((
  <div>
    <div data-foo="foo" data-bar="bar">Hello</div>
  </div>
));

expect(wrapper.contains(<div data-foo="foo" data-bar="bar">Hello</div>)).to.equal(true);

expect(wrapper.contains(<div data-foo="foo">Hello</div>)).to.equal(false);
expect(wrapper.contains(<div data-foo="foo" data-bar="bar" data-baz="baz">Hello</div>)).to.equal(false);
expect(wrapper.contains(<div data-foo="foo" data-bar="Hello">Hello</div>)).to.equal(false);
expect(wrapper.contains(<div data-foo="foo" data-bar="bar" />)).to.equal(false);
```

```jsx
const wrapper = shallow((
  <div>
    <span>Hello</span>
    <div>Goodbye</div>
    <span>Again</span>
  </div>
));

expect(wrapper.contains([
  <span>Hello</span>,
  <div>Goodbye</div>,
])).to.equal(true);

expect(wrapper.contains([
  <span>Hello</span>,
  <div>World</div>,
])).to.equal(false);
```


#### Common Gotchas

- `.contains()` expects a ReactElement, not a selector (like many other methods). Make sure that
when you are calling it you are calling it with a ReactElement or a JSX expression.
- Keep in mind that this method determines equality based on the equality of the node's children as
well.
