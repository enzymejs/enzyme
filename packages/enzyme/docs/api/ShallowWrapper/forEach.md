# `.forEach(fn) => Self`

Iterates through each node of the current wrapper and executes the provided function with a
wrapper around the corresponding node passed in as the first argument.


#### Arguments

1. `fn` (`Function ( ShallowWrapper node, Number index )`): A callback to be run for every node in the collection.
Should expect a ShallowWrapper as the first argument, and will be run with a context of the original
instance.



#### Returns

`ShallowWrapper`: Returns itself.



#### Example

```jsx
const wrapper = shallow(
  <div>
    <div className="foo bax" />
    <div className="foo bar" />
    <div className="foo baz" />
  </div>
);

wrapper.find('.foo').forEach(function (node) {
  expect(node.hasClass('foo')).to.equal(true);
});
```


#### Related Methods

- [`.map(fn) => ShallowWrapper`](map.md)
