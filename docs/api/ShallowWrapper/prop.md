# `.prop(key) => Any`

Returns the prop value for the node of the current wrapper with the provided key.

NOTE: can only be called on a wrapper of a single node. In contrast to a mounted component's `.prop()`, this one operates on the **root element** of the component, not the component itself.

#### Arguments

1. `key` (`String`): The prop name such that this will return value will be the `this.props[key]`
of the component instance.

#### Example

```jsx
const MyComponent = () => <div bar={10}/>;
const wrapper = shallow(<MyComponent/>);
expect(wrapper.find('MyComponent').prop('bar')).to.equal(10);
```

#### Related Methods

- [`.props() => Object`](props.md)
- [`.state([key]) => Any`](state.md)
- [`.context([key]) => Any`](context.md)
