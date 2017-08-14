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


## Element referencial identity is no longer preserved

Enzyme's new architecture means that the react "render tree" is transformed into an intermediate
representation that is common across all react versions so that Enzyme can properly traverse it
independent of React's internal representations.  A side effect of this is that Enzyme no longer
has access to the actual object references that were returned from `render` in your React
components.  This normally isn't much of a problem, but can manifest as a test failure in some
cases.

For example, consider the following example:

```js
import React from 'react';
import Icon from './path/to/Icon';

const ICONS = {
  success: <Icon name="check-mark" />,
  failure: <Icon name="exclamation-mark" />,
};

const StatusLabel = ({ id, label }) => <div>{ICONS[id]}{label}{ICONS[id]}</div>
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

## `get(n)` versus `getElement(n)` versus `getNode()`


## Updates are sometimes required

# Migration Guide (for React 0.13 - React 15.x)


## Root Wrapper

The initially returned wrapper used to be around the element passed
into the `mount` API, and for `shallow` it was around the root node of the rendered output of the element passed in. After the upgrade, the
two APIs are now symmetrical, starting off

```js
const x = 'x';
const Foo = props => <div inner={props.outer} />
const wrapper = mount(<Foo outer={x} />);
```

```js
expect(wrapper.props()).to.deep.equal({ outer: x });
```

## Refs

Refs no longer return a "wrapper". They return what the ref would actually be.


## for shallow, getNode() was renamed to getElement()

## for mount, getNode() should not be used. instance() does what it used to.

## for mount, getElement() will return the root JSX element

## what getNode() returns

we need to keep in mind that `getElement()` will no longer be referentially equal to what it was before.

## Updates are required

```js
wrapper.find('.async-btn').simulate('click');
setImmediate(() => {
  // this didn't used to be needed
  wrapper.update(); // TODO(lmr): this is a breaking change...
  expect(wrapper.find('.show-me').length).to.equal(1);
  done();
});
```




## Enzyme.use




# Migration Guide (for React 16)

## Stateless Functional Components

SFCs actually go down a different code path in react 16, which means that they
dont have "instances" associated with them, which means there are a couple of things
that we used to be able to do with enzyme + SFCs that will just no longer work.

We could fix a lot of this if there was a reliable way to get from an SFC "fiber" to
the corresponding DOM element that it renders.

## Strings vs. Numbers

React 16 converts numbers to strings very early on. we can't change this. this will change
some behavior in enzyme but we are considering this the "correct" behavior.











# Left to do:

- move adapters into standalone packages
- x create Enzyme.use API
- x create api to inject adapter per use
- x make sure all react dependence is moved into adapters
- x make tests run for all adapters
- export tests for 3rd party adapters to run
- check the targetApiVersion returned by the adapter and use the semver library
