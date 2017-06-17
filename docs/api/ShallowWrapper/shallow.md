# `.shallow([options]) => ShallowWrapper`

Shallow renders the current node and returns a shallow wrapper around it.

NOTE: can only be called on wrapper of a single node.


#### Arguments

1. `options` (`Object` [optional]):
- `options.context`: (`Object` [optional]): Context to be passed into the component



#### Returns

`ShallowWrapper`: A new wrapper that wraps the current node after it's been shallow rendered.



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
expect(wrapper.find('.in-bar')).to.have.length(0);
expect(wrapper.find(Bar)).to.have.length(1);
expect(wrapper.find(Bar).shallow().find('.in-bar')).to.have.length(1);
```
