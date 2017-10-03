# `.hostNodes() => ShallowWrapper`

Returns a new wrapper with only host nodes.



#### Returns

`ShallowWrapper`: A new wrapper that wraps the filtered nodes.



#### Examples

```jsx
const wrapper = shallow(<div><MyComponent className="foo" /><div className="foo" /></div>);
expect(wrapper.find('.foo').hostNodes()).to.have.length(1);
```
