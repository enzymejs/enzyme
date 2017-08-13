# Enzyme Adapter & Compatibility Proposal


## Motivation

This proposal is attempting to address a handful of pain points that Enzyme has been
subject to for quite a while.  This proposal has resulted mostly [#715](https://github.com/airbnb/enzyme/issues/715),
and a resulting discussion among core maintainers of this project.

The desired results of this proposal are the following:

1. Cleaner code, easier maintenance, less bug prone.

By standardizing on a single tree specification, the implementation of Enzyme would no longer have
to take into account the matrix of supported structures and nuanced differences between different
versions of React, as well as to some extent the differences between `mount` and `shallow`.

2. Additional libraries can provide compatible adapters

React API-compatible libraries such as `preact` and `inferno` would be able to provide adapters to Enzyme
for their corresponding libraries, and be able to take full advantage of Enzyme's APIs.

3. Better user experience (ie, bundlers won't complain about missing deps)

Enzyme has had a long-standing issue with static-analysis bundlers such as Webpack and Browserify because
of our usage of internal React APIs. With this change, this would be minimized if not removed entirely,
since these things can be localized into the adapter modules, and users will only install the ones they need.

Additionally, we can even attempt to remove the use of internal react APIs by lobbying for react-maintained packages
such as `react-test-renderer` to utilize the React Standard Tree (RST) format (details below).

4. Standardization and interopability with other tools

If we can agree on the tree format (specified below as "React Standard Tree"), other tools can start to use and
understand this format as well. Standardization is a good thing, and could allow tools to be built that maybe
don't even exist yet.


## Proposal


### React Standard Tree (RST)

This proposal hinges on a standard tree specification. Keep in mind that this tree needs to account for more
than what is currently satisfied by the output of something like `react-test-renderer`, which is currently
only outputting the "host" nodes (ie, HTML elements). We need a tree format that allows for expressing a full
react component tree, including composite components.

```
// Strings and Numbers are rendered as literals.
type LiteralValue = string | number

// A "node" in an RST is either a LiteralValue, or an RSTNode
type Node = LiteralValue | RSTNode

// if node.type
type RenderedNode = RSTNode | [Node]

type SourceLocation = {|
  fileName: string
  lineNumber: number
|}

type NodeType = 'class' | 'function' | 'host';

// An RSTNode has this specific shape
type RSTNode = {|
  // Either a string or a function. A string is considered a "host" node, and
  // a function would be a composite component. It would be the component constructor or
  // an SFC in the case of a function.
  type: string | function;

  // This node's type
  nodeType: NodeType;

  // The props object passed to the node, which will include `children` in its raw form,
  // exactly as it was passed to the component.
  props: object;

  // The backing instance to the node. Can be null in the case of "host" nodes and SFCs.
  // Enzyme will expect instances to have the _public interface_ of a React Component, as would
  // be expected in the corresponding React release returned by `getTargetVersion` of the
  // renderer. Alternative React libraries can choose to provide an object here that implements
  // the same interface, and Enzyme functionality that uses this will continue to work (An example
  // of this would be the `setState()` prototype method).
  instance: ComponentInstance?;

  // For a given node, this corresponds roughly to the result of the `render` function with the
  // provided props, but transformed into an RST. For "host" nodes, this will always be `null` or
  // an Array. For "composite" nodes, this will always be `null` or an `RSTNode`.
  rendered: RenderedNode?;

  // an optional property with source information (useful in debug messages) that would be provided
  // by this babel transform: https://babeljs.io/docs/plugins/transform-react-jsx-source/
  __source?: SourceLocation;
|}
```

### Enzyme Adapter Protocol

**Definitions:**

An `Element` is considered to be whatever data structure is returned by the JSX pragma being used. In the
react case, this would be the data structure returned from `React.createElement`


```
type RendererOptions = {
  // An optional predicate function that takes in an `Element` and returns
  // whether or not the underlying Renderer should treat it as a "Host" node
  // or not. This function should only be called with elements that are
  // not required to be considered "host" nodes (ie, with a string `type`),
  // so the default implementation of `isHost` is just a function that returns
  // false.
  ?isHost(Element): boolean;
}

type EnzymeAdapter = {
  // This is a method that will return a semver version string for the _react_ version that
  // it expects enzyme to target. This will allow enzyme to know what to expect in the `instance`
  // that it finds on an RSTNode, as well as intelligently toggle behavior across react versions
  // etc. For react adapters, this will likely just be `() => React.Version`, but for other
  // adapters for libraries like inferno or preact, it will allow those libraries to specify
  // a version of the API that they are committing to.
  getTargetApiVersion(): string;

  // Provided a bag of options, return an `EnzymeRenderer`. Some options can be implementation
  // specific, like `attach` etc. for React, but not part of this interface explicitly.
  createRenderer(?options: RendererOptions): EnzymeRenderer;

  // converts an RSTNode to the corresponding JSX Pragma Element. This will be needed
  // in order to implement the `Wrapper.mount()` and `Wrapper.shallow()` methods, but should
  // be pretty straightforward for people to implement.
  nodeToElement(RSTNode): Element;
}

type EnzymeRenderer = {
  // both initial render and updates for the renderer.
  render(Element): void;

  // retrieve a frozen-in-time copy of the RST.
  getNode(): RSTNode?;
}
```


### Using different adapters with Enzyme

At the top level, Enzyme would expose a `configure` method, which would allow for an `adapter`
option to be specified and globally configure Enzyme's adapter preference:

```
import Enzyme from 'enzyme';
import ThirdPartyEnzymeAdapter from 'third-party-enzyme-adapter';

Enzyme.configure({ adapter: ThirdPartyEnzymeAdapter });

```

Additionally, each wrapper Enzyme exposes will allow for an overriding `adapter` option that will use a
given adapter for just that wrapper:

```
import { shallow } from 'enzyme';
import ThirdPartyEnzymeAdapter from 'third-party-enzyme-adapter';

shallow(<Foo />, { adapter: ThirdPartyEnzymeAdapter });
```

Enzyme will build adapters for all major versions of React since React 0.13, though will deprecate
adapters as usage of a particular major version fades.

```
import React13Adapter from 'enzyme-adapter-react-13';
import React14Adapter from 'enzyme-adapter-react-14';
import React15Adapter from 'enzyme-adapter-react-15';
// ...
```

### Validation

Enzyme will provide an `validate(node): Error?` method that will traverse down a provided `RSTNode` and
return an `Error` if any deviations from the spec are encountered, and `null` otherwise. This will
provide a way for implementors of the adapters to determine whether or not they are in compliance or not.
