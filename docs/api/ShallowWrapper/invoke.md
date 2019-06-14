# `.invoke(invokePropName)(...args) => Any`

Invokes a function prop.

#### Arguments

1. `propName` (`String`): The function prop that is invoked
2. `...args` (`Any` [optional]): Arguments that is passed to the prop function

This essentially calls wrapper.prop(propName)(...args).

#### Returns

`Any`: Returns the value from the prop function

#### Example

```jsx
class Foo extends React.Component {
  loadData() {
    return fetch();
  }

  render() {
    return (
      <div>
        <button
          type="button"
          onClick={() => this.loadData()}
        >
          Load more
        </button>
      </div>
    );
  }
}
const wrapper = shallow(<Foo />);
wrapper.find('button').invoke('onClick')().then(() => {
  // expect()
});
```
