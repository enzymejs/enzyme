# `.invoke(propName)(...args) => Any`

Invokes a function prop.
Note that in React 16.8+, `.invoke` will wrap your handler with [`ReactTestUtils.act`](https://reactjs.org/docs/test-utils.html#act) and call `.update()` automatically.

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
wrapper.find('button').invoke('onClick')().then(() => {
  // expect()
});
```
