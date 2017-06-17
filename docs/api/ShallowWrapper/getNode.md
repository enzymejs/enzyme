# `.getNode() => ReactElement`

Returns the wrapper's underlying node.

If the current wrapper is wrapping the root component, returns the root component's latest render output.


#### Returns

`ReactElement`: The retrieved node.



#### Examples

```jsx
const element = (
  <div>
    <span />
    <span />
  </div>
);

function MyComponent() {
  return element;
}

const wrapper = shallow(<MyComponent />);
expect(wrapper.getNode()).to.equal(element);
```



#### Related Methods

- [`.getNodes() => Array<ReactElement>`](getNodes.md)
