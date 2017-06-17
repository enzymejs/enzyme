# `.getDOMNode() => DOMComponent`

Returns the outer most DOMComponent of the current wrapper.

Notes:
- can only be called on a wrapper of a single node.
- will raise if called on a wrapper of a stateless functional component.


#### Returns

`DOMComponent`: The retrieved DOM component.



#### Examples

```jsx
const wrapper = mount(<MyComponent />);
expect(wrapper.getDOMNode()).to.have.property('className');
```
