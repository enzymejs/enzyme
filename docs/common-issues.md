# Common Issues

This list aims to be comprehensive. If you find an issue that has been frequently brought up in GitHub *Issues* that is not here, please open a PR to add it.

### Query Selector fails

###### Reason

This could be due to a regression, or the feature is not yet implemented. If you are wanting to use a
certain query syntax, make sure it is implemented first before raising an issue. Here is the list of
selectors we currently support: https://github.com/airbnb/enzyme/blob/master/docs/api/selector.md

### Nested component may not be updated after wrapper updates

Assume we have a simple component with an `<input />` and a `<button>`. Clicking the `<button>` updates the `<input>`'s value.

However, this test fails:
```jsx
const input = wrapper.find('input');
const button = wrapper.find('button');
button.prop('onClick')();
expect(input.prop('value')).to.equal('test');
```
fails. While this test:
```jsx
const input = wrapper.find('input');
const button = wrapper.find('button');
button.prop('onClick')();
expect(wrapper.find('input').prop('value')).to.equal('test');
```
passes.

This is because the wrapper returned by `.find()` (and every other method that produces a new wrapper) is immutable and won't update.

More details and motivation can be found at [migration from 2 to 3: Calling props() after a state change](https://github.com/airbnb/enzyme/blob/master/docs/guides/migration-from-2-to-3.md#calling-props-after-a-state-change).

###### Solutions

Instead of storing `.find()` results into a local variable, re-find from the root after any change.

```jsx
wrapper.find('button').props().onClick();
expect(wrapper.find('input').prop('value')).to.equal('test');
```

or we may wrap that into helper function(s) to call them each time

```jsx
function getButton(wrapper) {
  return wrapper.find('button');
}

// …

getButton(wrapper).prop('onClick')();
```

### Testing third party libraries

Some third party libraries are difficult or impossible to test. enzyme's scope is severely limited to what
React exposes and provides for us. Things like "portals" are not currently testable with enzyme directly for that reason.

An example:

If you are testing a library that creates a Modal, and it manually appends it to a different part of the DOM, React has lost
track of this component, and therefore enzyme has also lost track of it.

Even more so, if this library appends dom elements into react components, react still does not know about it. A library like d3 which
appends DOM elements would be an example here.

###### Solutions

You can use the `render` API to attempt to access and assert on the appended DOM components. This will likely become natively supported
when React natively supports Portals, which is expected to land with Fiber.

If the third party solution lets you attach a `ref`, that would be the ideal scenario. With a `ref` you can then get that element from enzyme.

example

```jsx
import ThirdPartyPortalLibrary from 'someplace';

class Comp extends React.Component {
  render() {
    return <ThirdPartyPortalLibrary ref={(node) => { this.portal = node; }} />;
  }
}

const wrapper = mount(<Comp />);
const { portal } = wrapper.instance();
// assert on `portal`
```
