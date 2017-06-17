# `.getNodes() => Array<ReactElement>`

Returns the wrapper's underlying nodes.

If the current wrapper is wrapping the root component, returns the root component's latest render output wrapped in an array.


#### Returns

`Array<ReactElement>`: The retrieved nodes.



#### Examples

```jsx
const one = <span />;
const two = <span />;

function Test() {
  return (
    <div>
      {one}
      {two}
    </div>
  );
}

const wrapper = shallow(<Test />);
expect(wrapper.find('span').getNodes()).to.deep.equal([one, two]);
```



#### Related Methods

- [`.getNode() => ReactElement`](getNode.md)
