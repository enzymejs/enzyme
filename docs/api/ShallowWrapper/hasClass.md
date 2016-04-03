# `.hasClass(className) => Boolean`

Returns whether or not the current node has a `className` prop including the passed in class name.


#### Arguments

1. `className` (`String`): A single class name.



#### Returns

`Boolean`: whether or not the current node has the class or note.



#### Example


```jsx
const wrapper = shallow(<MyComponent />);
expect(wrapper.find('.my-button').hasClass('disabled')).to.equal(true);
```

### Common Gotchas

- `.hasClass()` expects a class name, NOT a CSS selector. `.hasClass('.foo')` should be
`.hasClass('foo')`
