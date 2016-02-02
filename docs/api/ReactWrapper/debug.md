# `.debug() => String`

Returns an HTML-like string of the wrapper for debugging purposes. Useful to print out to the 
console when tests are not passing when you expect them to.


#### Returns

`String`: The resulting string.



#### Examples

Say we have the following components:
```jsx
class Foo extends React.Component {
  render() {
    return (
      <div className="foo">
        <span>Foo</span>
      </div>
    );
  }
}

class Bar extends React.Component {
  render() {
    return (
      <div className="bar">
        <span>Non-Foo</span>
        <Foo baz="bax" />
      </div>
    );
  }
}
```

In this case, running:
```jsx
console.log(mount(<Bar id="2" />).debug());
```

Would output the following to the console:
```jsx
<Bar id="2">
  <div className="bar">
    <span>
      Non-Foo
    </span>
    <Foo baz="bax">
      <div className="foo">
        <span>
          Foo
        </span>
      </div>
    </Foo>
  </div>
</Bar>
```

Likewise, running:

```jsx
console.log(mount(<Bar id="2" />).find(Foo).debug();
```
Would output the following to the console:
```jsx
<Foo baz="bax">
  <div className="foo">
    <span>
      Foo
    </span>
  </div>
</Foo>
```
