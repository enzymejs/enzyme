# Migration Guide for enzyme v2.x to v3.x

The change from enzyme v2.x to v3.x is a more significant change than in previous major releases,
due to the fact that the internal implementation of enzyme has been almost completely rewritten.

The goal of this rewrite was to address a lot of the major issues that have plagued enzyme since
its initial release. It was also to simultaneously remove a lot of the dependencies that enzyme has
on React internals, and to make enzyme more "pluggable", paving the way for enzyme to be used
with "React-like" libraries such as Preact and Inferno.

We have done our best to make enzyme v3 as API compatible with v2.x as possible, however there are
a handful of breaking changes that we decided we needed to make, intentionally, in order to
support this new architecture and also improve the usability of the library long-term.

Airbnb has one of the largest enzyme test suites, coming in at around 30,000 enzyme unit tests.
After upgrading enzyme to v3.x in Airbnb's code base, 99.6% of these tests succeeded with no
modifications at all. Most of the tests that broke we found to be easy to fix, and some we found to
actually depend on what could arguably be considered a bug in v2.x, and the breakage was
actually desired.

In this guide, we will go over a couple of the most common breakages that we ran into, and how to
fix them. Hopefully this will make your upgrade path that much easier. If during your upgrade you
find a breakage that doesn't seem to make sense to you, feel free to file an issue.


## Configuring your Adapter

enzyme now has an "Adapter" system. This means that you now need to install enzyme along with
another module that provides the Adapter that tells enzyme how to work with your version of React
(or whatever other React-like library you are using).

At the time of writing this, enzyme publishes "officially supported" adapters for React 0.13.x,
0.14.x, 15.x, and 16.x. These adapters are npm packages of the form `enzyme-adapter-react-{{version}}`.

You will want to configure enzyme with the adapter you'd like to use before using enzyme in your
tests. The way to do this is with `enzyme.configure(...)`. For example, if your project depends
on React 16, you would want to configure enzyme this way:

```js
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });
```

The list of adapter npm packages for React semver ranges are as follows:

| enzyme Adapter Package | React semver compatibility |
| --- | --- |
| `enzyme-adapter-react-16` | `^16.0.0` |
| `enzyme-adapter-react-15` | `^15.5.0` |
| `enzyme-adapter-react-15.4` | `15.0.0-0 - 15.4.x` |
| `enzyme-adapter-react-14` | `^0.14.0` |
| `enzyme-adapter-react-13` | `^0.13.0` |


## Element referential identity is no longer preserved

enzyme's new architecture means that the react "render tree" is transformed into an intermediate
representation that is common across all react versions so that enzyme can properly traverse it
independent of React's internal representations. A side effect of this is that enzyme no longer
has access to the actual object references that were returned from `render` in your React
components. This normally isn't much of a problem, but can manifest as a test failure in some
cases.

For example, consider the following example:

<!-- eslint react/prop-types: 0 -->
```js
import React from 'react';
import Icon from './path/to/Icon';

const ICONS = {
  success: <Icon name="check-mark" />,
  failure: <Icon name="exclamation-mark" />,
};

const StatusLabel = ({ id, label }) => <div>{ICONS[id]}{label}{ICONS[id]}</div>;
```

```js
import { shallow } from 'enzyme';
import StatusLabel from './path/to/StatusLabel';
import Icon from './path/to/Icon';

const wrapper = shallow(<StatusLabel id="success" label="Success" />);

const iconCount = wrapper.find(Icon).length;
```

In v2.x, `iconCount` would be 1. In v3.x, it will be 2. This is because in v2.x it would find all
of the elements matching the selector, and then remove any duplicates. Since `ICONS.success` is
included twice in the render tree, but it's a constant that's reused, it would show up as a
duplicate in the eyes of enzyme v2.x. In enzyme v3, the elements that are traversed are
transformations of the underlying react elements, and are thus different references, resulting in
two elements being found.

Although this is a breaking change, I believe the new behavior is closer to what people would
actually expect and want. Having enzyme wrappers be immutable results in more deterministic tests
that are less prone to flakiness from external factors.

## `children()` now has slightly different meaning

enzyme has a `.children()` method which is intended to return the rendered children of a wrapper.

When using `mount(...)`, it can sometimes be unclear exactly what this would mean. Consider for
example the following react components:

<!-- eslint react/prop-types: 0, react/prefer-stateless-function: 0 -->
```js
class Box extends React.Component {
  render() {
    return <div className="box">{this.props.children}</div>;
  }
}
class Foo extends React.Component {
  render() {
    return (
      <Box bam>
        <div className="div" />
      </Box>
    );
  }
}
```

Now lets say we have a test which does something like:

```js
const wrapper = mount(<Foo />);
```

At this point, there is an ambiguity about what `wrapper.find(Box).children()` should return.
Although the `<Box ... />` element has a `children` prop of `<div className="div" />`, the actual
rendered children of the element that the box component renders is a `<div className="box">...</div>`
element.

Prior enzyme v3, we would observe the following behavior:

```js
wrapper.find(Box).children().debug();
// => <div className="div" />
```

In enzyme v3, we now have `.children()` return the *rendered* children. In other words, it returns
the element that is returned from that component's `render` function.

```js
wrapper.find(Box).children().debug();
// =>
// <div className="box">
//   <div className="div" />
// </div>
```

This may seem like a subtle difference, but making this change will be important for future APIs
we would like to introduce.

## For `mount`, updates are sometimes required when they weren't before

React applications are dynamic. When testing your react components, you often want to test them
before *and after* certain state changes take place. When using `mount`, any react component
instance in the entire render tree could register code to initiate a state change at any time.

For instance, consider the following contrived example:

```js
import React from 'react';

class CurrentTime extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      now: Date.now(),
    };
  }
  componentDidMount() {
    this.tick();
  }
  componentWillUnmount() {
    clearTimeout(this.timer);
  }
  tick() {
    this.setState({ now: Date.now() });
    this.timer = setTimeout(tick, 0);
  }
  render() {
    return <span>{this.state.now}</span>;
  }
}
```

In this code, there is a timer that continuously changes the rendered output of this component. This
might be a reasonable thing to do in your application. The thing is, enzyme has no way of knowing
that these changes are taking place, and no way to automatically update the render tree. In enzyme
v2, enzyme operated *directly* on the in-memory representation of the render tree that React itself
had. This means that even though enzyme couldn't know when the render tree was updated, updates
would be reflected anyway, since React *does* know.

enzyme v3 architecturally created a layer where React would create an intermediate representation
of the render tree at an instance in time and pass that to enzyme to traverse and inspect. This has
many advantages, but one of the side effects is that now the intermediate representation does not
receive automatic updates.

enzyme does attempt to automatically "update" the root wrapper in most common scenarios, but these
are only the state changes that it knows about. For all other state changes, you may need to call
`wrapper.update()` yourself.

The most common manifestation of this problem can be shown with the following example:

```js
class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
    this.increment = this.increment.bind(this);
    this.decrement = this.decrement.bind(this);
  }
  increment() {
    this.setState({ count: this.state.count + 1 });
  }
  decrement() {
    this.setState({ count: this.state.count - 1 });
  }
  render() {
    return (
      <div>
        <div className="count">Count: {this.state.count}</div>
        <button className="inc" onClick={this.increment}>Increment</button>
        <button className="dec" onClick={this.decrement}>Decrement</button>
      </div>
    );
  }
}
```

This is a basic "counter" component in React. Here our resulting markup is a function of
`this.state.count`, which can get updated by the `increment` and `decrement` functions. Let's take a
look at what some enzyme tests with this component might look like, and when we do or don't have to
call `update()`.

```js
const wrapper = shallow(<Counter />);
wrapper.find('.count').text(); // => "Count: 0"
```

As we can see, we can easily assert on the text and the count of this component. But we haven't
caused any state changes yet. Let's see what it looks like when we simulate a `click` event on
the increment and decrement buttons:

```js
const wrapper = shallow(<Counter />);
wrapper.find('.count').text(); // => "Count: 0"
wrapper.find('.inc').simulate('click');
wrapper.find('.count').text(); // => "Count: 1"
wrapper.find('.inc').simulate('click');
wrapper.find('.count').text(); // => "Count: 2"
wrapper.find('.dec').simulate('click');
wrapper.find('.count').text(); // => "Count: 1"
```

In this case enzyme will automatically check for updates after an event simulation takes place, as
it knows that this is a very common place for state changes to occur. In this case there is no
difference between v2 and v3.

Let's consider a different way this test could have been written.

```js
const wrapper = shallow(<Counter />);
wrapper.find('.count').text(); // => "Count: 0"
wrapper.instance().increment();
wrapper.find('.count').text(); // => "Count: 0" (would have been "Count: 1" in v2)
wrapper.instance().increment();
wrapper.find('.count').text(); // => "Count: 0" (would have been "Count: 2" in v2)
wrapper.instance().decrement();
wrapper.find('.count').text(); // => "Count: 0" (would have been "Count: 1" in v2)
```

The problem here is that once we grab the instance using `wrapper.instance()`, enzyme has no way of
knowing if you are going to execute something that will cause a state transition, and thus does not
know when to ask for an updated render tree from React. As a result, `.text()` never changes value.

The fix here is to use enzyme's `wrapper.update()` method after a state change has occurred:

```js
const wrapper = shallow(<Counter />);
wrapper.find('.count').text(); // => "Count: 0"
wrapper.instance().increment();
wrapper.update();
wrapper.find('.count').text(); // => "Count: 1"
wrapper.instance().increment();
wrapper.update();
wrapper.find('.count').text(); // => "Count: 2"
wrapper.instance().decrement();
wrapper.update();
wrapper.find('.count').text(); // => "Count: 1"
```

In practice we have found that this isn't actually needed that often, and when it is it is not
difficult to add. Additionally, having the enzyme wrapper automatically update alongside the real
render tree can result in flaky tests when writing asynchronous tests. This breaking change was
worth the architectural benefits of the new adapter system in v3, and we believe is a better choice
for an assertion library to take.


## `ref(refName)` now returns the actual ref instead of a wrapper

In enzyme v2, the wrapper returned from `mount(...)` had a prototype method on it `ref(refName)`
that returned a wrapper around the actual element of that ref. This has now been changed to
return the actual ref, which we believe is a more intuitive API.

Consider the following simple react component:

<!-- eslint react/no-string-refs: 0 -->
```js
class Box extends React.Component {
  render() {
    return <div ref="abc" className="box">Hello</div>;
  }
}
```

In this case we can call `.ref('abc')` on a wrapper of `Box`. In this case it will return a wrapper
around the rendered div. To demonstrate, we can see that both `wrapper` and the result of `ref(...)`
share the same constructor:

```js
const wrapper = mount(<Box />);
// this is what would happen with enzyme v2
expect(wrapper.ref('abc')).toBeInstanceOf(wrapper.constructor);
```

In v3, the contract is slightly changed. The ref is exactly what React would assign as the ref. In
this case, it would be a DOM Element:

```js
const wrapper = mount(<Box />);
// this is what happens with enzyme v3
expect(wrapper.ref('abc')).toBeInstanceOf(Element);
```

Similarly, if you have a ref on a composite component, the `ref(...)` method will return an instance
of that element:

<!-- eslint react/no-string-refs: 0 -->
```js
class Bar extends React.Component {
  render() {
    return <Box ref="abc" />;
  }
}
```

```js
const wrapper = mount(<Bar />);
expect(wrapper.ref('abc')).toBeInstanceOf(Box);
```

In our experience, this is most often what people would actually want and expect out of the `.ref(...)`
method.


## With `mount`, `.instance()` can be called at any level of the tree

enzyme now allows for you to grab the `instance()` of a wrapper at any level of the render tree,
not just at the root.  This means that you can `.find(...)` a specific component, then grab its
instance and call `.setState(...)` or any other methods on the instance that you'd like.


## With `mount`, `.getNode()` should not be used. `.instance()` does what it used to.

For `mount` wrappers, the `.getNode()` method used to return the actual component instance. This
method no longer exists, but `.instance()` is functionally equivalent to what `.getNode()` used to
be.


## With `shallow`, `.getNode()` should be replaced with `getElement()`

For shallow wrappers, if you were previously using `.getNode()`, you will want to replace those
calls with `.getElement()`, which is now functionally equivalent to what `.getNode()` used to do.
One caveat is that previously `.getNode()` would return the actual element instance that was
created in the `render` function of the component you were testing, but now it will be a
structurally equal react element, but not referentially equal. Your tests will need to be updated to
account for this.

## Private properties and methods have been removed

There are several properties that are on an enzyme "wrapper" that were considered to be private and
were undocumented as a result. Despite being undocumented, people may have been relying on them. In
an effort to make making changes less likely to be accidentally breaking in the future, we have
decided to make these properties properly "private". The following properties will no longer be
accessible on enzyme `shallow` or `mount` instances:

- `.node`
- `.nodes`
- `.renderer`
- `.unrendered`
- `.root`
- `.options`


## Cheerio has been updated, thus `render(...)` has been updated as well

enzyme's top level `render` API returns a [Cheerio](https://github.com/cheeriojs/cheerio) object.
The version of Cheerio that we use has been upgraded to 1.0.0. For debugging issues across enzyme
v2.x and v3.x with the `render` API, we recommend checking out [Cheerio's Changelog](https://github.com/cheeriojs/cheerio/blob/48eae25c93702a29b8cd0d09c4a2dce2f912d1f4/History.md) and
posting an issue on that repo instead of enzyme's unless you believe it is a bug in enzyme's use
of the library.

## CSS Selector

enzyme v3 now uses a real CSS selector parser rather than its own incomplete parser implementation.
This is done with [rst-selector-parser](https://github.com/aweary/rst-selector-parser) a fork of [scalpel](https://github.com/gajus/scalpel/) which is a CSS parser implemented with [nearley](https://nearley.js.org/).
We don't think this should cause any breakages across enzyme v2.x to v3.x, but if you believe you
have found something that did indeed break, please file an issue with us. Thank you to
[Brandon Dail](https://github.com/aweary) for making this happen!


## Node Equality now ignores `undefined` values

We have updated enzyme to consider node "equality" in a semantically identical way to how react
treats nodes. More specifically, we've updated enzyme's algorithms to treat `undefined` props as
equivalent to the absence of a prop. Consider the following example:

<!-- eslint react/prop-types: 0, react/prefer-stateless-function: 0 -->
```js
class Foo extends React.Component {
  render() {
    return <div className={this.props.foo} id={this.props.bar} />;
  }
}
```

With this component, the behavior in enzyme v2.x the behavior would have been like:

```js
const wrapper = shallow(<Foo />);
wrapper.equals(<div />); // => false
wrapper.equals(<div className={undefined} id={undefined} />); // => true
```

With enzyme v3, the behavior is now as follows:
```js
const wrapper = shallow(<Foo />);
wrapper.equals(<div />); // => true
wrapper.equals(<div className={undefined} id={undefined} />); // => true
```

## Lifecycle methods

enzyme v2.x had an optional flag that could be passed in to all `shallow` calls which would make it
so that more of the component's lifecycle methods were called (such as `componentDidMount` and
`componentDidUpdate`).

With enzyme v3, we have now turned on this mode by default, instead of making it opt-in. It is now
possible to *opt-out* instead. Additionally, you can now opt-out at a global level.

If you'd like to opt out globally, you can run the following:

```js
import Enzyme from 'enzyme';

Enzyme.configure({ disableLifecycleMethods: true });
```

This will default enzyme back to the previous behavior globally. If instead you'd only like to opt
enzyme to the previous behavior for a specific test, you can do the following:

```js
import { shallow } from 'enzyme';

// ...

const wrapper = shallow(<Component />, { disableLifecycleMethods: true });
```
