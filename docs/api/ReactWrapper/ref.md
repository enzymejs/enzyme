# `.ref(refName) => Any`

Returns a wrapper of the node that matches the provided reference name.


NOTE: can only be called on a wrapper instance that is also the root instance.

#### Arguments

1. `refName` (`String`): The ref attribute of the node


#### Returns

`ReactWrapper`: A wrapper of the node that matches the provided reference name.



#### Example


```jsx
const wrapper = mount(<MyComponent foo={10} />);
expect(wrapper.prop('foo')).to.equal(10);
```


#### Related Methods

- [`.props() => Object`](props.md)
- [`.state([key]) => Any`](state.md)
