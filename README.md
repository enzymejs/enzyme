Catalyst
======

JavaScript Testing utility for React / Flux



Installation
============

Install catalyst from NPM into your project

```bash
npm install airbnb-catalyst --save-dev
```

If you plan on using `mount`, it requires jsdom. Jsdom requires io.js. As a result, if you want to use `mount`, you will
need to install io.js on your machine.

Io.js is pretty much a slide-in replacement for node and shouldn't change your workflow at all. Thankfully, NVM is a CLI
client that can make it super easy to switch between io.js and node.js if for some reason you need or want to.

To install NVM:

```bash
brew install nvm
nvm install iojs
```

Now your machine will be running io.js. You can use the `nvm use` command to switch between the two environments:

```bash
nvm use node
```

```bash
nvm use iojs
```



Basic Usage
===========

## Shallow Rendering

```javascript
import { shallow } from 'airbnb-catalyst';

describe('<MyComponent />', () => {

  it('should render three <Foo /> components', () => {
    const wrapper = shallow(<MyComponent />);
    expect(wrapper.findAll(Foo).length).to.equal(3);
  });

  it('should render an `.icon-star`, () => {
    const wrapper = shallow(<MyComponent />);
    expect(wrapper.find('.icon-star')).to.exist;
  });

  it('should render children when passed in', () => {
    const wrapper = shallow(
      <MyComponent>
        <div className="unique" />
      </MyComponent>
    );
    expect(wrapper.contains(<div className="unique" />)).to.be.true;
  });

});
```

## JsDom Full Rendering

```javascript
import {
  describeWithDom,
  useSinon,
  sinon,
  mount,
  spyLifecycle,
  spyMethods,
} from 'airbnb-catalyst';

describeWithDom('<Foo />', () => {
  useSinon();

  it('calls componentDidMount', () => {
    spyLifecycle(Foo);
    const wrapper = mount(<Foo />);
    expect(Foo.prototype.componentDidMount.calledOnce).to.be.true;
  });

  it('allows us to set props', () => {
    const wrapper = mount(<Foo bar="baz" />);
    expect(wrapper.find(Foo).props.bar).to.equal("baz");
    wrapper.setProps({ bar: "foo" });
    expect(wrapper.find(Foo).props.bar).to.equal("foo");
  });

  it('renders children when passed in', () => {
    const onButtonClick = sinon.spy();
    const wrapper = mount(
      <Foo onButtonClick={onButtonClick} />
    );
    simulate.click(wrapper.find('button'));
    expect(onButtonClick.calledOnce).to.be.true;
  });

});
```


## Static Rendered Markup

```javascript
import { render } from 'airbnb-catalyst';

describe('<Foo />', () => {

  it('renders three `.foo-bar`s', () => {
    const wrapper = render(<Foo />);
    expect(wrapper.find('.foo-bar').length).to.equal(3);
  });

  it('rendered the title', () => {
    const wrapper = render(<Foo title="unique" />);
    expect(wrapper.text()).to.contain("unique");
  });

});
```






Top-Level API
=============

## Testing Full Lifecycle React Components


**`mount(node) => {ReactWrapper}`**

Mounts and renders a react component into the document and provides a testing wrapper around it. This utility uses
jsDom, and as such, will run the full lifecycle of your component and give a more "true" test than any of the other
utilities.

This utility is ideal for testing stateful React components and state transitions of react components, handling of DOM
events, etc.

NOTE: To use this function, one must have called `useJsDom()` earlier in the script.

The `ReactWrapper` class that is returned has several useful prototype methods. See below:


**`ReactWrapper::setProps(newProps) => {Promise}`**

This method will inject new props into the root component passed in to the constructor and re-render the tree. This is
useful if you're testing how a React component behaves as new props are passed into an already mounted instance (e.g.,
`componentDidUpdate` and `componentWillReceiveProps` lifecycle methods).


**`ReactWrapper::forceUpdate() => void`**

This method effectively passes through a call to the component's `forceUpdate()` method. Will force another render pass.
This can sometimes be useful when you have components that may do "side-effecty" things (not generally recommended,
but sometimes there's a good reason).


**`ReactWrapper::ref(refName) => {ReactElement|HTMLElement}`**

This method will return a `ref` from the component passed in through `mount()`. Please note that this library follows
the React 0.14 convention that a ref on a DOM Component will return the actual `HTMLElement` instance, meaning you do
not need to call `React.findDOMNode()` on the result.


**`ReactWrapper::find(selector) => {ReactElement|HTMLElement}`**

A useful utility to find a single component in the render tree.  Please note that this will throw an error if there is
more than one potential component found. If this is a possibility, please use `findAll`, which returns an array,
instead.  If the component found is a DOM Component, it will return the corresponding instance of `HTMLElement` instead.

The `selector` parameter can be of three different forms:

1. A CSS Class Name selector (e.g., `".foo-bar"`). Note that only simple single-class selectors are allowed.
2. A DOM Component Tag Name (e.g., `"div"`)
3. A React Component Constructor Function


**`ReactWrapper::findAll(selector) => {Array<ReactElement|HTMLElement}`**

A useful utility to find a set of components in a render tree. Returns an array of ReactElements and HTMLElements
matching the selector. If one of the component found is a DOM Component, it will return the corresponding instance of
`HTMLElement` in it's place instead.

The `selector` parameter can be of three different forms:

1. A CSS Class Name selector (e.g., `".foo-bar"`). Note that only simple single-class selectors are allowed.
2. A DOM Component Tag Name (e.g., `"div"`)
3. A React Component Constructor Function


**`ReactWrapper::findWhere(predicate) => {Array<ReactElement|HTMLElement}`**

Similar to `findAll`, except that it's argument is a general predicate function to be run on the React tree node. Any
node such that `predicate(node)` returns a truthy value will get included in the result set.


**`simulate.*` Event Simulation**

This is effectively the `React.addons.TestUtils.Simulate` namespace passed through for convenience. That said, I would
eventually like to add some utilities around this to more properly emulate native keyboard and mouse events.


**`spyLifecycle(Component)`**

This is a utility method that accepts a single React Component Constructor and will use `sinon` to call `spy` on the
implemented React Lifecycle Methods on it, making it easier to test whether your component is working like you expect.

The spies used are tied into the sandboxed instance of sinon that catalyst uses internally, so if you call `useSinon()`
in your mocha tests earlier in the script, these spies will automatically be restored after every test.


**`spyMethods(Component)`**

This is a utility method that accepts a single React Component Constructor and will use `sinon` to call `spy` on the
prototype methods of the component that are not lifecycle methods, making it easier to test whether your component is
working like you expect.

The spies used are tied into the sandboxed instance of sinon that catalyst uses internally, so if you call `useSinon()`
in your mocha tests earlier in the script, these spies will automatically be restored after every test.




## Testing Components Using Shallow Rendering

**`shallow(node) => {ShallowWrapper}`**

This is the "shallow mode" of testing react components with catalyst. Internally, this is using React's "Shallow
Rendering" and returning a wrapper around the resulting tree with some useful prototype methods.

Shallow Rendering is most useful for testing simple components that aren't stateful, where you are trying to test the
overall behavior of the output render. This is usually most useful in cases where your `render()` function has
several logical branches that can result in different output.


**`ShallowWrapper::find(selector) => {ShallowNode}`**

A method to find a node in the shallow tree that matches the provided selector.  There must be one and
only one node that matches, or else this method will throw an error. If it is possible for the selector to return
more than one result, use `findAll()` instead.

The selector parameter can be any one of the following three type:

1. A CSS Class Name selector (e.g., `".foo-bar"`). Note that only simple single-class selectors are allowed.
2. A DOM Component Tag Name (e.g., `"div"`)
3. A React Component Constructor Function


**`ShallowWrapper::findAll(selector) => {Array<ShallowNode>}`**

A method to return an array of nodes in the shallow tree that match the provided selector.

The selector parameter can be any one of the following three type:

1. A CSS Class Name selector (e.g., `".foo-bar"`). Note that only simple single-class selectors are allowed.
2. A DOM Component Tag Name (e.g., `"div"`)
3. A React Component Constructor Function


**`ShallowWrapper::findWhere(predicate) => {Array<ShallowNode>}`**

A method to return an array of nodes in the shallow tree that pass the provided predicate function.


**`ShallowWrapper::contains(node) => {Boolean}`**

A method that returns true or false if the passed in node exists in the tree somewhere. This is useful because this
follows value-type semantics (ie, things do not need to be referentially equal).

Example:

```javascript
const wrapper = shallow(
  <div>
    <i className="icon-foo icon-white pull-right" />
  </div>
);
expect(wrapper.contains(<i className="icon-foo icon-white pull-right" />)).to.be.true;
expect(wrapper.contains(<i className="icon-foo icon-white pull-left" />)).to.be.false;
```




## Testing Components Using Static HTML Output

**`render(node) => {CheerioWrapper}`**

Why reinvent the wheel?  Cheerio does a great job parsing and navigating HTML strings in JS, and there is no need to
recreate it.  This function is essentially just calling `React.renderToStaticMarkup` on the passed in node and calling
`cheerio.load()` on the result.

It is possible that in the future there will be a couple of utilities added on to cheerio's prototype in order to
assist with testing React components, but I don't know what those would be yet.

For now, this utility exists at the very least to provide symmetry with `mount` and `shallow`.




## Testing Flux Stores

**`dispatch(action, payload)`**

Dispatch an action directly rather than going through an action creator:

```javascript
dispatch(FooActions.fooSuccess, { foo: "bar" });
```



## Testing Flux Actions

**`spyActions(Actions)`**

Wraps an Alt Actions instance so that all of the action creators are wrapped with sinon spies. This uses the internal
sandboxed instance of sinon so that the spies get restored after each test.  This can be particularly useful if you're
testing the implementation of async action creators, whose implementations may invoke other action creators.




## Testing Connected Components

**`stubActions(Actions)`**

Wraps an Alt Actions instance so that all action creators are stubbed out to no-ops. Allows you to assert that
specific action creators were called, without actually testing the implementation of the action creators themselves.

This is especially useful if you call actions as the result of user behavior (ie, clicks, hovers, and keypresses) and
want to test that specific actions get called as a result, but do not want to test the implementations (which may,
for example, contain AJAX requests).



Current Status
==============

I'm pretty confident with the react side of this library (`mount`, `shallow`, `render`, and their corresponding APIs),
however I am likely to add in more helpers with regard to testing Flux as well as change the API of what's already
implemented.  I wanted to put this out there in it's current state for people to take a look though.

The goal for this repo is to provide a full example app that covers most of the common scenarios, and demonstrate the
agreed upon way to test them.

At the moment, the library's full test suite should pass, however the FluxApp example is not in a finished state and
has many non-passing tests.

If there are pieces of the example app or this library's implementation that you think ought to be changed, please
submit a PR so we can discuss!



To Do List
==========

- fully implement and test FluxApp example
- `spyActions` and `stubActions` not yet implemented
- `dispatch` not yet implemented
- write a "Testing Guide" breaking down testing strategy, common scenarios, things to not do, things to do, etc.






Gotchas
=======

```
Error: Invariant Violation: addComponentAsRefTo(...): Only a ReactOwner can have refs.
```

This is likely a result of using proxyquire to require your component, and there are multiple instances of React in
memory.  This can break some things. To ensure that the right instance of React is being used by your component, make 
sure to pass in react with proxyquire:


Before:

```javascript
import React from 'react';
const MyComponent = __helper.requireAsset('path/to/component/MyComponent', {
  "foo": FooStub,
});

describeWithDom('jsdom stuff', () => {

  it('should increment index on rightArrow click', () => {
    const wrapper = mount(<MyComponent />);
    // ...
  });
  
]);
```


After:

```javascript
import React from 'react';
let MyComponent = __helper.requireAsset('path/to/component/MyComponent', {
  "foo": FooStub,
  "react": React,
});

describeWithDom('jsdom stuff', () => {

  it('should increment index on rightArrow click', () => {
    const wrapper = mount(<MyComponent />);
    // ...
  });
  
]);
```



```
Error: jQuery requires a window with a document
```

In Node.js environments without a window and a document global, jquery is loaded as a function that accepts a window to 
attach it to.

Since most of our browser based files cdare what we are testing, they will not be compatible with the node version of 
jquery.  The way around this is to inject a jQuery object into your module using proxyquire inside a mocha `beforeEach` 
call:


Before:

```javascript
import React from 'react';
const MyComponent = __helper.requireAsset('path/to/component/MyComponent');

describeWithDom('jsdom stuff', () => {

  it('should increment index on rightArrow click', () => {
    const wrapper = mount(<MyComponent />);
    // ...
  });
  
]);
```


After:

```javascript
import React from 'react';
let MyComponent = __helper.requireAsset('path/to/component/MyComponent');

describeWithDom('jsdom stuff', () => {

  beforeEach(() => {
    MyComponent = __helper.requireAsset('path/to/component/MyComponent', {
      "jquery": require('jquery')(global.window),
      "react": React,
    });
  });

  it('should increment index on rightArrow click', () => {
    const wrapper = mount(<MyComponent />);
    // ...
  });
  
]);
```
