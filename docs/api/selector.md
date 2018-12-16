# enzyme Selectors

Many methods in enzyme’s API accept a *selector* as an argument.
You can select several different ways:

### 1. A Valid CSS Selector

enzyme supports a subset of valid CSS selectors to find nodes inside a render tree. Support is as
follows:

- class syntax (`.foo`, `.foo-bar`, etc.)
- element tag name syntax (`input`, `div`, `span`, etc.)
- id syntax (`#foo`, `#foo-bar`, etc.)
- attribute syntax (`[href="foo"]`, `[type="text"]`, and the other attribute selectors listed [here](https://developer.mozilla.org/en-US/docs/Learn/CSS/Introduction_to_CSS/Attribute_selectors).)
- universal syntax (`*`)

The attribute syntax also works by value, rather than by string. Strings, numbers, and boolean property values are supported. Example:

```js
const wrapper = mount((
  <div>
    <span anum={3} abool={false} />
    <span anum="3" abool="false" />
  </div>
));
```

The selector `[anum=3]` will select the first <span> but not the second, because there's no quotes surrounding the 3. The selector `[anum="3"]` will select the second, because it's explicitly looking for a string because of the quotes surrounding 3. The same goes for the boolean; [abool=false] will select the first but not the second, etc.

Further, enzyme supports combining any of those supported syntaxes together, as with CSS:

```css
div.foo.bar
input#input-name
a[href="foo"]
.foo .bar
.foo > .bar
.foo + .bar
.foo ~ .bar
.foo input
```

**The Key and Ref Props**

While in most cases, any React prop can be used, there are exceptions.
The `key` and `ref` props will never work; React uses these props internally.


**Want more CSS support?**

PRs implementing more support for CSS selectors will be accepted and is an area of development for
enzyme that will likely be focused on in the future.


### 2. A React Component Constructor

enzyme allows you to find React components based on their constructor. You can pass in the reference to
the component’s constructor.
Of course, this kind of selector only checks the component type; it ignores props and children.

```jsx
function MyComponent() {
  return <div />;
}

// find instances of MyComponent
const myComponents = wrapper.find(MyComponent);
```


### 3. A React Component’s displayName

enzyme allows you to find components based on a component’s `displayName`. If a component exists
in a render tree where its `displayName` is set and has its first character as a capital letter,
you can use a string to find it:


```jsx
function MyComponent() {
  return <div />;
}
MyComponent.displayName = 'My Component';

// find instances of MyComponent
const myComponents = wrapper.find('My Component');
```

NOTE: This will *only* work if the selector (and thus the component’s `displayName`) is a string
starting with a capital letter. Strings starting with lower case letters will be assumed to be a CSS
selector (therefore a tag name).

Selecting a HOC-wrapped component, or a component with a custom `displayName`, even with lowercase letters (for example, `withHOC(MyComponent)`) will work as well.


### 4. Object Property Selector

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
