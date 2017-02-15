# `.dive([options]) => ShallowWrapper`

Shallow render the one non-DOM child of the current wrapper, and return a wrapper around the result.

NOTE: can only be called on wrapper of a single non-DOM component element node.


#### Arguments

1. `options` (`Object` [optional]):
- `options.context`: (`Object` [optional]): Context to be passed into the component



#### Returns

`ShallowWrapper`: A new wrapper that wraps the current node after it's been shallow rendered.



#### Examples

```jsx
class Bar extends React.Component {
  render() {
    return (
      <div>
        <div className="in-bar" />
      </div>
    );
  }
}
```

```jsx
class Foo extends React.Component {
  render() {
    return (
      <div>
        <Bar />
      </div>
    );
  }
}
```

```jsx
const wrapper = shallow(<Foo />);
expect(wrapper.find('.in-bar')).to.have.length(0);
expect(wrapper.find(Bar)).to.have.length(1);
expect(wrapper.find(Bar).dive().find('.in-bar')).to.have.length(1);
```
