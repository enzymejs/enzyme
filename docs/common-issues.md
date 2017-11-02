# Common Issues

This list aims to be comprehensive. If you find an issue that has been frequently brought up in Github *issues* that is not here, please open a PR to add it.

### Query Selector fails

###### Reason

This could be due to a regression, or the feature is not yet implemented. If you are wanting to use a
certain query syntax, make sure it is implemented first before raising an issue. Here is the list of
selectors we currently support: https://github.com/airbnb/enzyme/blob/master/docs/api/selector.md

### Testing third party libraries

Some third party libraries are difficult or impossible to test. enzyme's scope is severly limited to what
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
