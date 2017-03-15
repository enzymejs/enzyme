# `.containsAllMatchingElements(nodes) => Boolean`

Returns whether or not one of the given react elements are all matching one element in the shallow render tree.
It will determine if the wrapper contains elements which __look like__ each of the expected elements by checking if all props of each expected element are present on the wrapper's elements and equal to each other. Props present on the wrapper elements but not supplied in the expected elements will be ignored.




#### Arguments

1. `nodes` (`Array<ReactElement>`): The array of nodes whose presence you are detecting in the current instance's
render tree.



#### Returns

`Boolean`: whether or not the current wrapper has nodes anywhere in its render tree that looks
like the nodes passed in.



#### Example


```jsx
const wrapper = shallow(
  <div>
    <span className="foo">Hello</span>
    <div style={{ fontSize: 13 }}>Goodbye</div>
    <span>Again</span>
  </div>
);

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
