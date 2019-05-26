# `.last() => ShallowWrapper`

Reduce the set of matched nodes to the last in the set, just like `.at(length - 1)`.

#### Arguments

1. fromIndex (Number [optional]): The index at which item you wan't moving backwards.


#### Returns

`ShallowWrapper`: A new wrapper that wraps the last node in the set.


#### Examples

```jsx
const wrapper = shallow(<MyComponent />);
expect(wrapper.find(Foo).last().props().foo).to.equal('bar');
```

```jsx
const wrapper = shallow(<MyComponent />);
expect(wrapper.find(Foo).last(-1).props().foo).to.equal('baz');
```


#### Related Methods

- [`.at(index) => ShallowWrapper`](at.md) - retrieve a wrapper node by index
- [`.first() => ShallowWrapper`](first.md)
