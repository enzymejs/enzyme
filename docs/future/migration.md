# Migration Guide for Enzyme v2.x to v3.x

The change from Enzyme v2.x to v3.x is a more significant change than in previous major releases,
due to the fact that the internal implementation has been almost completely rewritten.

The goal of this rewrite was to address a lot of the major issues that have plagued Enzyme since
its initial release. It was also to simultaneously remove a lot of the dependence that Enzyme has
on react internals, and to make enzyme more "pluggable", paving the way for Enzyme to be used
with "React-like" libraries such as Preact and Inferno.

We have done our best to make Enzyme v3 as API compatible with v2.x as possible, however there are
a hand full of breaking changes that we decided we needed to make, intentionally, in order to
support this new architecture.

Airbnb has one of the largest Enzyme test suites, coming in at around 30,000 enzyme unit tests.
After upgrading Enzyme to v3.x in Airbnb's code base, 99.6% of these tests succeeded with no
modifications at all. Most of the tests that broke we found to be easy to fix, and some we found to
actually be depending on what could arguably be considered a bug in v2.x, and the breakage was
desired.

In this guide, we will go over a couple of the most common breakages that we ran into, and how to
fix them. Hopefully this will make your upgrade path that much easier.


## Configuring your Adapter

Enzyme now has an "Adapter" system. This means that you now need to install Enzyme along with
another module that provides the Adapter that tells Enzyme how to work with your version of React
(or whatever other react-like library you are using).

At the time of writing this, Enzyme publishes "officially supported" adapters for React 0.13.x,
0.14.x, 15.x, and 16.x. These adapters are npm packages of the form `enzyme-adapter-react-{{version}}`.

You will want to configure Enzyme with the adapter you'd like to use before using enzyme in your
tests. The way to do this is whith `Enzyme.configure(...)`. For example, if your project depends
on React 16, you would want to configure Enzyme this way:

```js
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });
```

The list of adapter npm packages for React semver ranges are as follows:

- `enzyme-adapter-react-16` for `^16.0.0-0`
- `enzyme-adapter-react-15` for `^15.5.0`
- `enzyme-adapter-react-15.4` for `>= 15.0.0 && <15.5.0`
- `enzyme-adapter-react-14` for `^0.14.x`
- `enzyme-adapter-react-13` for `^0.13.x`


## Element referential identity is no longer preserved

Enzyme's new architecture means that the react "render tree" is transformed into an intermediate
representation that is common across all react versions so that Enzyme can properly traverse it
independent of React's internal representations.  A side effect of this is that Enzyme no longer
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

const wrapper = shallow(<StatusIcon id="success" label="Success" />);

const iconCount = wrapper.find(Icon).length;
```

In v2.x, `iconCount` would be 1. In v3.x, it will be 2. This is because in v2.x it would find all
of the elements matching the selector, and then remove any duplicates. Since `ICONS.success` is
included twice in the render tree, but it's a constant that's reused, it would show up as a
duplicate in the eyes of Enzyme v2.x. In Enzyme v3, the elements that are traversed are
transformations of the underlying react elements, and are thus different references, resulting in
two elements being found.

Although this is a breaking change, I believe the new behavior is closer to what people would
actually expect and want.

## `children()` now has slightly different meaning

Enzyme has a `.children()` method which is intended to return the rendered children of a wrapper.

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
might be a reasonable thing to do in your application. The thing is, Enzyme has no way of knowing
that these changes are taking place, and no way to automatically update the render tree. In Enzyme
v2, Enzyme operated *directly* on the in-memory representation of the render tree that React itself
had. This means that even though Enzyme couldn't know when the render tree was updated, updates
would be reflected anyway, since React *does* know.

Enzyme v3 architecturally created a layer where React would create an intermediate representation
of the render tree at an instance in time and pass that to Enzyme to traverse and inspect. This has
many advantages, but one of the side effects is that now the intermediate representation does not
receive automatic updates.

Enzyme does attempt to automatically "update" the root wrapper in most common scenarios, but these
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
look at what some Enzyme tests with this component might look like, and when we do or don't have to
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

In this case Enzyme will automatically check for updates after an event simulation takes place, as
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

The problem here is that once we grab the instance using `wrapper.instance()`, Enzyme has no way of
knowing if you are going to execute something that will cause a state transition, and thus does not
know when to ask for an updated render tree from React.  As a result, `.text()` never changes value.

The fix here is to use Enzyme's `wrapper.update()` method after a state change has occurred:

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
difficult to add. This breaking change was worth the architectural benefits of the new adapter
system in v3.


## `ref(refName)` now returns the actual ref instead of a wrapper

In Enzyme v2, the wrapper returned from `mount(...)` had a prototype method on it `ref(refName)`
that returned a wrapper around the actual element of that ref. This has now been changed to
return the actual ref, which I believe is more intuitive.

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
// this is what would happen with Enzyme v2
expect(wrapper.ref('abc')).toBeInstanceOf(wrapper.constructor);
```

In v3, the contract is slightly changed. The ref is exactly what React would assign as the ref. In
this case, it would be an DOM Element:

```js
const wrapper = mount(<Box />);
// this is what would happen with Enzyme v2
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



# New Features in Enzyme v3


## `instance()` can be called at any level of the tree

TODO: talk about this



















# Migration Guide (for React 0.13 - React 15.x)


## Root Wrapper

The initially returned wrapper used to be around the element passed
into the `mount` API, and for `shallow` it was around the root node of the rendered output of the element passed in. After the upgrade, the
two APIs are now symmetrical, starting off

<!-- eslint react/prop-types: 0 -->
```js
const x = 'x';
const Foo = props => <div inner={props.outer} />;
const wrapper = mount(<Foo outer={x} />);
```

```js
expect(wrapper.props()).to.deep.equal({ outer: x });
```

## for mount, getNode() should not be used. instance() does what it used to.
