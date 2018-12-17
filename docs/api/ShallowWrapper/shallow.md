# `.shallow([options]) => ShallowWrapper`

Shallow renders the root node and returns a shallow wrapper around it.
It must be a single-node wrapper.


#### Arguments

1. `options` (`Object` [optional]):
  - `options.context`: (`Object` [optional]): Context to be passed into the component
  - `options.disableLifecycleMethods`: (`Boolean` [optional]): If set to true, `componentDidMount`
is not called on the component, and `componentDidUpdate` is not called after
[`setProps`](ShallowWrapper/setProps.md) and [`setContext`](ShallowWrapper/setContext.md). Default to `false`.


#### Returns

`ShallowWrapper`: A new wrapper that wraps the node after it's been shallow rendered.


#### Examples

```jsx
function Bar() {
  return (
    <div>
      <div className="in-bar" />
    </div>
  );
}
```

```jsx
function Foo() {
  return (
    <div>
      <Bar />
    </div>
  );
}
```

```jsx
const wrapper = shallow(<Foo />);
expect(wrapper.find('.in-bar')).to.have.lengthOf(0);
expect(wrapper.find(Bar)).to.have.lengthOf(1);
expect(wrapper.find(Bar).shallow().find('.in-bar')).to.have.lengthOf(1);
```
