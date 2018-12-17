# `.hostNodes() => ShallowWrapper`

Returns a new wrapper with only host nodes.
When using `react-dom`, host nodes are HTML elements rather than custom React components, e.g. `<div>` versus `<MyComponent>`.


#### Returns

`ShallowWrapper`: A new wrapper that wraps the filtered nodes.


#### Examples

The following code takes a wrapper with two nodes, one a `<MyComponent>` React component, and the other a `<span>`, and filters out the React component.

```jsx
const wrapper = shallow((
  <div>
    <MyComponent className="foo" />
    <span className="foo" />
  </div>
));
const twoNodes = wrapper.find('.foo');
expect(twoNodes.hostNodes()).to.have.lengthOf(1);
```
