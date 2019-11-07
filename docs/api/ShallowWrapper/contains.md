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

expect(wrapper.contains(<div data-foo="foo" data-bar="bar">Hello</div>)).toEqual(true);

expect(wrapper.contains(<div data-foo="foo">Hello</div>)).toEqual(false);
expect(wrapper.contains(<div data-foo="foo" data-bar="bar" data-baz="baz">Hello</div>)).toEqual(false);
expect(wrapper.contains(<div data-foo="foo" data-bar="Hello">Hello</div>)).toEqual(false);
expect(wrapper.contains(<div data-foo="foo" data-bar="bar" />)).toEqual(false);
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
])).toEqual(true);

expect(wrapper.contains([
  <span>Hello</span>,
  <div>World</div>,
])).toEqual(false);
```

```jsx
const calculatedValue = 2 + 2;

const wrapper = shallow((
  <div>
    <div data-foo="foo" data-bar="bar">{calculatedValue}</div>
  </div>
));

expect(wrapper.contains(<div data-foo="foo" data-bar="bar">{4}</div>)).toEqual(true);
```

#### Common Gotchas

- `.contains()` expects a ReactElement, not a selector (like many other methods). Make sure that
when you are calling it you are calling it with a ReactElement or a JSX expression.
- Keep in mind that this method determines equality based on the equality of the node's children as
well.
