# `.hasClass(className) => Boolean`

Returns whether or not the wrapped node has a `className` prop including the passed in class name. It must be a single-node wrapper.


#### Arguments

1. `className` (`String` | `RegExp`): A single class name or a regex expression.


#### Returns

`Boolean`: whether or not the wrapped node has the class.


#### Example


```jsx
const wrapper = shallow(<MyComponent />);
expect(wrapper.find('.my-button').hasClass('disabled')).to.equal(true);
```

```jsx
// Searching using RegExp works fine when classes were injected by a jss decorator
const wrapper = shallow(<MyComponent />);
expect(wrapper.find('.my-button').hasClass(/(ComponentName)-(other)-(\d+)/)).to.equal(true);
```

### Common Gotchas

- `.hasClass()` expects a class name, NOT a CSS selector. `.hasClass('.foo')` should be
`.hasClass('foo')`
