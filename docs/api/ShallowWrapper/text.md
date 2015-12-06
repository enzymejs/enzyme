# `.text() => String`

Returns a string of the rendered text of the current render tree.  This function should be
looked at with skepticism if being used to test what the actual HTML output of the component
will be. If that is what you would like to test, use enzyme's `render` function instead.

Note: can only be called on a wrapper of a single node.


#### Returns

`String`: The resulting string 



#### Examples

```jsx
const wrapper = shallow(<div><b>important</b></div>);
expect(wrapper.text()).to.equal('important');
```

```jsx
const wrapper = shallow(<div><Foo /><b>important</b></div>);
expect(wrapper.text()).to.equal('<Foo />important');
```



#### Related Methods

[`.html() => String`](html.md)
