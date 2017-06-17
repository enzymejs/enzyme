# Enzyme Selectors

Many methods in Enzyme's API accept a *selector* as an argument. Selectors in Enzyme can fall into
one of the following four categories:


### 1. A Valid CSS Selector

Enzyme supports a subset of valid CSS selectors to find nodes inside a render tree. Support is as
follows:

- class syntax (`.foo`, `.foo-bar`, etc.)
- tag syntax (`input`, `div`, `span`, etc.)
- id syntax (`#foo`, `#foo-bar`, etc.)
- prop syntax (`[htmlFor="foo"]`, `[bar]`, `[baz=1]`, etc.);

**Note -- Prop selector**
Strings, numeric literals and boolean property values are supported for prop syntax
in combination of the expected string syntax. For example, the following
is supported:

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

Further, enzyme supports combining any of those supported syntaxes together to uniquely identify a
single node.  For instance:

```css
div.foo.bar
input#input-name
label[foo=true]
```

Enzyme also gives support for the following contextual selectors

```
.foo .bar
.foo > .bar
.foo + .bar
.foo ~ .bar
.foo input
```


**Want more CSS support?**

PR's implementing more support for CSS selectors will be accepted and is an area of development for
enzyme that will likely be focused on in the future.



### 2. A React Component Constructor

Enzyme allows you to find components based on their constructor. You can pass in the reference to
the component's constructor:

```jsx
function MyComponent() {
  return <div />;
}

// find instances of MyComponent
const myComponents = wrapper.find(MyComponent);
```



### 3. A React Component's displayName

Enzyme allows you to find components based on a component's `displayName`. If a component exists
in a render tree where its `displayName` is set and has its first character as a capital letter,
a string can be used to find it:


```jsx
function MyComponent() {
  return <div />;
}
MyComponent.displayName = 'MyComponent!';

// find instances of MyComponent
const myComponents = wrapper.find('MyComponent!');
```

NOTE: This will *only* work if the selector (and thus the component's `displayName`) is a string
starting with a capital letter. Strings starting with lower case letters will assume it is a CSS
selector using the tag syntax.



### 4. Object Property Selector

Enzyme allows you to find components and nodes based on a subset of their properties:


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
