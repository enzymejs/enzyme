# `.hostNodes() => ReactWrapper`

Returns a new wrapper with only host nodes.



#### Returns

`ReactWrapper`: A new wrapper that wraps the filtered nodes.



#### Examples

```jsx
const wrapper = mount(<div><MyComponent className="foo" /><div className="foo" /></div>);
expect(wrapper.find('.foo').hostNodes()).to.have.length(1);
```
