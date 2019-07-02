# `.debug([options]) => String`

Returns an HTML-like string of the wrapper for debugging purposes. Useful to print out to the
console when tests are not passing when you expect them to.


#### Arguments

`options` (`Object` [optional]):
- `options.ignoreProps`: (`Boolean` [optional]): Whether props should be omitted in the resulting string. Props are included by default.
- `options.verbose`: (`Boolean` [optional]): Whether arrays and objects passed as props should be verbosely printed.

#### Returns

`String`: The resulting string.



#### Examples

Say we have the following components:
```jsx
function Foo() {
  return (
    <div className="foo">
      <span>Foo</span>
    </div>
  );
}

function Bar() {
  return (
    <div className="bar">
      <span>Non-Foo</span>
      <Foo baz="bax" object={{ a: 1, b: 2 }} />
    </div>
  );
}
```

In this case, running:
```jsx
console.log(mount(<Bar id="2" />).debug());
```

Would output the following to the console:
<!-- eslint-disable -->
```text
<Bar id="2">
  <div className="bar">
    <span>
      Non-Foo
    </span>
    <Foo baz="bax" object={{...}}>
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
console.log(mount(<Bar id="2" />).find(Foo).debug());
```
Would output the following to the console:
<!-- eslint-disable -->
```text
<Foo baz="bax">
  <div className="foo">
    <span>
      Foo
    </span>
  </div>
</Foo>
```
and:
```jsx
console.log(mount(<Bar id="2" />).find(Foo).debug({ ignoreProps: true }));
```
Would output the following to the console:
<!-- eslint-disable -->
```text
<Foo>
  <div>
    <span>
      Foo
    </span>
  </div>
</Foo>
```

and:
```jsx
console.log(mount(<Bar id="2" />).find(Foo).debug({ verbose: true }));
```
Would output the following to the console:
<!-- eslint-disable -->
```text
<Foo baz="bax" object={{ a: 1, b: 2 }}>
  <div className="foo">
    <span>
      Foo
    </span>
  </div>
</Foo>
```
