# enzyme Selectors

Many methods in enzyme’s API accept a *selector* as an argument. Selectors in enzyme can fall into
one of the following five categories:



### 1. A Valid CSS Selector

enzyme supports a subset of valid CSS selectors to find nodes inside a render tree. Support is as
follows:

- class syntax (`.foo`, `.foo-bar`, etc.)
- element syntax (`input`, `div`, `span`, etc.)
- id syntax (`#foo`, `#foo-bar`, etc.)
- attribute syntax (`[href="foo"]`, `[type="text"]`, etc.)

Further, enzyme supports combining any of those supported syntaxes together to uniquely identify a
single node. For instance:

```css
div.foo.bar
input#input-name
a[href="foo"]
```

enzyme also gives support for the following contextual selectors

```css
.foo .bar
.foo > .bar
.foo + .bar
.foo ~ .bar
.foo input
```

**Want more CSS support?**

PRs implementing more support for CSS selectors will be accepted and is an area of development for
enzyme that will likely be focused on in the future.



### 2. Prop Selector

In addition to traditional CSS selectors, enzyme supports using a React prop like an Attribute Selector as if it were an HTML attribute. Strings, Numbers, and Boolean property values are supported.

```js
const wrapper = mount((
  <div>
    <span foo={3} bar={false} title="baz" />
  </div>
));

wrapper.find('[foo=3]');
wrapper.find('[bar=false]');
wrapper.find('[title="baz"]');
```

**The Key and Ref Prop**

While in most cases, any React prop can be used, there are exceptions. The `key` and `ref` props will never work. This decision comes from how React uses these props internally, which means they should not be relied upon.



### 3. A React Component Constructor

enzyme allows you to find components based on their constructor. You can pass in the reference to
the component’s constructor:

```jsx
function MyComponent() {
  return <div />;
}

// find instances of MyComponent
const myComponents = wrapper.find(MyComponent);
```



### 4. A React Component’s displayName

enzyme allows you to find components based on a component’s `displayName`. If a component exists
in a render tree where its `displayName` is set and has its first character as a capital letter,
a string can be used to find it:


```jsx
function MyComponent() {
  return <div />;
}
MyComponent.displayName = 'My Component';

// find instances of MyComponent
const myComponents = wrapper.find('My Component');
```

NOTE: This will *only* work if the selector (and thus the component’s `displayName`) is a string
starting with a capital letter. Strings starting with lower case letters will assume it is a CSS
selector using the tag syntax.



### 5. Object Property Selector

enzyme allows you to find components and nodes based on a subset of their properties:


```jsx
const wrapper = mount((
  <div>
    <span foo={3} bar={false} title="baz" />
  </div>
));

wrapper.find({ foo: 3 });
wrapper.find({ bar: false });
wrapper.find({ title: 'baz' });
```

**Undefined Properties**

Undefined properties are not allowed in the object property selector and will cause an error:


```jsx
wrapper.find({ foo: 3, bar: undefined });
// => TypeError: Enzyme::Props can't have 'undefined' values. Try using 'findWhere()' instead.
```

If you have to search by `undefined` property value, use [.findWhere()](ShallowWrapper/findWhere.md).
