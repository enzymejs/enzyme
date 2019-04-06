# `.invoke(propName)(...args) => Any`

Invokes a function prop.

#### Arguments

1. `propName` (`String`): The function prop that is invoked
2. `...args` (`Any` [optional]): Arguments that is passed to the prop function



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
const wrapper = mount(<Foo />);
wrapper.find('a').invoke('onClick')().then(() => {
  // expect()
});
```
