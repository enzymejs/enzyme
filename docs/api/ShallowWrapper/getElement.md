# `.getElement() => ReactElement`

Returns the wrapped ReactElement.

If the current wrapper is wrapping the root component, returns the root component's latest render output.


#### Returns

`ReactElement`: The retrieved ReactElement.



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
expect(wrapper.getElement()).to.equal(element);
```



#### Related Methods

- [`.getElements() => Array<ReactElement>`](getElements.md)
