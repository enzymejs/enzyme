# `.getElements() => Array<ReactElement>`

Returns the wrapped ReactElements

If the current wrapper is wrapping the root component, returns the root component's latest render output wrapped in an array.


#### Returns

`Array<ReactElement>`: The retrieved ReactElements.



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
expect(wrapper.find('span').getElements()).to.deep.equal([one, two]);
```



#### Related Methods

- [`.getElement() => ReactElement`](getElement.md)
