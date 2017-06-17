# Common Issues

This list aims to be comprehensive. If you find an issue that has been frequently brought up in Github *issues* that is not here, please open a PR to add it.

### Webpack Build Issues

- [Related Github issue](https://github.com/airbnb/enzyme/issues/684)

###### Common Solutions

_Mismatched versions of React and React* libraries._

It is important to ensure all React and React* libraries your project depend on are matching versions.
If you are using React 15.4.0, you should ensure your React* libraries (like react-test-utils) are equivalently on 15.4.0.

_Bad configuration._

Please see the guide for [webpack](/docs/guides/webpack) to ensure your configuration is correct for weback.

### Error: Cannot find module 'react-dom/lib/ReactTestUtils'

- [Related Github issue](https://github.com/airbnb/enzyme/issues/684)
- [Related code](https://github.com/airbnb/enzyme/blob/3aeb02461eabf2fd402613991915d8d6f4b88536/src/react-compat.js#L97-L105)

###### Reason

In order to properly support multiple versions of React, we have conditional requirements that npm does not support with tools like
`peerDependencies`. Instead we manually require and throw errors if the dependency is not met.

###### Solution

Install a matching version of React for `react-test-utils`. Example package.json

```json
{
  "devDependencies": {
    "react": "15.4.0",
    "react-test-utils": "15.4.0"
  }
}
```

### Query Selector fails

###### Reason

This could be due to a regression, or the feature is not yet implemented. If you are wanting to use a
certain query syntax, make sure it is implemented first before raising an issue. Here is the list of
selectors we currently support: https://github.com/airbnb/enzyme/blob/master/docs/api/selector.md

### Testing third party libraries

Some third party libraries are difficult or impossible to test. Enzyme's scope is severly limited to what
React exposes and provides for us. Things like "portals" are not currently testable with Enzyme directly for that reason.

An example:

If you are testing a library that creates a Modal, and it manually appends it to a different part of the DOM, React has lost
track of this component, and therefore Enzyme has also lost track of it.

Even more so, if this library appends dom elements into react components, react still does not know about it. A library like d3 which
appends DOM elements would be an example here.

###### Solutions

You can use the `render` API to attempt to access and assert on the appended DOM components. This will likely become natively supported
when React natively supports Portals, which is expected to land with Fiber.

If the third party solution lets you attach a `ref`, that would be the ideal scenario. With a `ref` you can then get that element from Enzyme.

example

```jsx
import ThirdPartyPortalLibrary from 'someplace';

class Comp extends React.Component {
  render() {
    return <ThirdPartyPortalLibrary ref={(node) => { this.portal = node; }} />;
  }
}

const wrapper = mount(<Comp />);
const portal = wrapper.instance().portal;
// assert on `portal`
```
