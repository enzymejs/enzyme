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


## Keys

keys no longer work? we should maybe fix this in the spec...


## for shallow, getNode() was renamed to getElement()

## for mount, getNode() should not be used. instance() does what it used to.

## for mount, getElement() will return the root JSX element

## what getNode() returns

we need to keep in mind that `getElement()` will no longer be referentially equal to what it was before.

## Updates are required

```
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
