# `.containsAnyMatchingElements(nodes) => Boolean`

Returns whether or not one of the given react elements is matching on element in the shallow render tree.
It will determine if an element in the wrapper __looks like__ one of the expected element by checking if all props of the expected element are present on the wrappers element and equals to each other.


#### Arguments

1. `nodes` (`Array<ReactElement>`): The array of nodes whose presence you are detecting in the current instance's
render tree.



#### Returns

`Boolean`: whether or not the current wrapper has a node anywhere in its render tree that looks
like one of the array passed in.



#### Example


```jsx
const wrapper = shallow(
  <div>
    <span className="foo">Hello</span>
    <div style={{ fontSize: 13 }}>Goodbye</div>
    <span>Again</span>
  </div>
);

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
