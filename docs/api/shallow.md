# Shallow Rendering API

Shallow rendering is useful to constrain yourself to testing a component as a unit, and to ensure
that your tests aren't indirectly asserting on behavior of child components.

As of Enzyme v3, the `shallow` API does call React lifecycle methods such as `componentDidMount` and `componentDidUpdate`. You can read more about this in the [version 3 migration guide](../guides/migration-from-2-to-3.md#lifecycle-methods).

```jsx
import { shallow } from 'enzyme';
import sinon from 'sinon';
import Foo from './Foo';

describe('<MyComponent />', () => {
  it('renders three <Foo /> components', () => {
    const wrapper = shallow(<MyComponent />);
    expect(wrapper.find(Foo)).to.have.lengthOf(3);
  });

  it('renders an `.icon-star`', () => {
    const wrapper = shallow(<MyComponent />);
    expect(wrapper.find('.icon-star')).to.have.lengthOf(1);
  });

  it('renders children when passed in', () => {
    const wrapper = shallow((
      <MyComponent>
        <div className="unique" />
      </MyComponent>
    ));
    expect(wrapper.contains(<div className="unique" />)).to.equal(true);
  });

  it('simulates click events', () => {
    const onButtonClick = sinon.spy();
    const wrapper = shallow(<Foo onButtonClick={onButtonClick} />);
    wrapper.find('button').simulate('click');
    expect(onButtonClick).to.have.property('callCount', 1);
  });
});
```

## `shallow(node[, options]) => ShallowWrapper`

#### Arguments

1. `node` (`ReactElement`): The node to render
2. `options` (`Object` [optional]):
  - `options.context`: (`Object` [optional]): Context to be passed into the component
  - `options.disableLifecycleMethods`: (`Boolean` [optional]): If set to true, `componentDidMount`
is not called on the component, and `componentDidUpdate` is not called after
[`setProps`](ShallowWrapper/setProps.md) and [`setContext`](ShallowWrapper/setContext.md). Default to `false`.
  - `options.wrappingComponent`: (`ComponentType` [optional]): A component that will render as a parent of the `node`. It can be used to provide context to the `node`, among other things. See the [`getWrappingComponent()` docs](ShallowWrapper/getWrappingComponent.md) for an example. **Note**: `wrappingComponent` _must_ render its children.
  - `options.wrappingComponentProps`: (`Object` [optional]): Initial props to pass to the `wrappingComponent` if it is specified.
  - `options.suspenseFallback`: (`Boolean` [optional]): If set to true, when rendering `Suspense` enzyme will replace all the lazy components in children with `fallback` element prop. Otherwise it won't handle fallback of lazy component. Default to `true`. Note: not supported in React < 16.6.

#### Returns

`ShallowWrapper`: The wrapper instance around the rendered output.


## ShallowWrapper API

#### [`.find(selector) => ShallowWrapper`](ShallowWrapper/find.md)
Find every node in the render tree that matches the provided selector.

#### [`.findWhere(predicate) => ShallowWrapper`](ShallowWrapper/findWhere.md)
Find every node in the render tree that returns true for the provided predicate function.

#### [`.filter(selector) => ShallowWrapper`](ShallowWrapper/filter.md)
Remove nodes in the current wrapper that do not match the provided selector.

#### [`.filterWhere(predicate) => ShallowWrapper`](ShallowWrapper/filterWhere.md)
Remove nodes in the current wrapper that do not return true for the provided predicate function.

#### [`.hostNodes() => ShallowWrapper`](ShallowWrapper/hostNodes.md)
Removes nodes that are not host nodes; e.g., this will only return HTML nodes.

#### [`.contains(nodeOrNodes) => Boolean`](ShallowWrapper/contains.md)
Returns whether or not a given node or array of nodes is somewhere in the render tree.

#### [`.containsMatchingElement(node) => Boolean`](ShallowWrapper/containsMatchingElement.md)
Returns whether or not a given react element exists in the shallow render tree.

#### [`.containsAllMatchingElements(nodes) => Boolean`](ShallowWrapper/containsAllMatchingElements.md)
Returns whether or not all the given react elements exist in the shallow render tree.

#### [`.containsAnyMatchingElements(nodes) => Boolean`](ShallowWrapper/containsAnyMatchingElements.md)
Returns whether or not one of the given react elements exists in the shallow render tree.

#### [`.equals(node) => Boolean`](ShallowWrapper/equals.md)
Returns whether or not the current render tree is equal to the given node, based on the expected value.

#### [`.matchesElement(node) => Boolean`](ShallowWrapper/matchesElement.md)
Returns whether or not a given react element matches the shallow render tree.

#### [`.hasClass(className) => Boolean`](ShallowWrapper/hasClass.md)
Returns whether or not the current node has the given class name or not.

#### [`.is(selector) => Boolean`](ShallowWrapper/is.md)
Returns whether or not the current node matches a provided selector.

#### [`.exists([selector]) => Boolean`](ShallowWrapper/exists.md)
Returns whether or not the current node exists, or, if given a selector, whether that selector has any matching results.

#### [`.isEmpty() => Boolean`](ShallowWrapper/isEmpty.md)
*Deprecated*: Use [`.exists()`](ShallowWrapper/exists.md) instead.

#### [`.isEmptyRender() => Boolean`](ShallowWrapper/isEmptyRender.md)
Returns whether or not the current component returns a falsy value.

#### [`.not(selector) => ShallowWrapper`](ShallowWrapper/not.md)
Remove nodes in the current wrapper that match the provided selector. (inverse of `.filter()`)

#### [`.children([selector]) => ShallowWrapper`](ShallowWrapper/children.md)
Get a wrapper with all of the children nodes of the current wrapper.

#### [`.childAt(index) => ShallowWrapper`](ShallowWrapper/childAt.md)
Returns a new wrapper with child at the specified index.

#### [`.parents([selector]) => ShallowWrapper`](ShallowWrapper/parents.md)
Get a wrapper with all of the parents (ancestors) of the current node.

#### [`.parent() => ShallowWrapper`](ShallowWrapper/parent.md)
Get a wrapper with the direct parent of the current node.

#### [`.closest(selector) => ShallowWrapper`](ShallowWrapper/closest.md)
Get a wrapper with the first ancestor of the current node to match the provided selector.

#### [`.shallow([options]) => ShallowWrapper`](ShallowWrapper/shallow.md)
Shallow renders the current node and returns a shallow wrapper around it.

#### [`.render() => CheerioWrapper`](ShallowWrapper/render.md)
Returns a CheerioWrapper of the current node's subtree.

#### [`.renderProp(key)() => ShallowWrapper`](ShallowWrapper/renderProp.md)
Returns a wrapper of the node rendered by the provided render prop.

#### [`.unmount() => ShallowWrapper`](ShallowWrapper/unmount.md)
A method that un-mounts the component.

#### [`.text() => String`](ShallowWrapper/text.md)
Returns a string representation of the text nodes in the current render tree.

#### [`.html() => String`](ShallowWrapper/html.md)
Returns a static HTML rendering of the current node.

#### [`.get(index) => ReactElement`](ShallowWrapper/get.md)
Returns the node at the provided index of the current wrapper.

#### [`.getElement() => ReactElement`](ShallowWrapper/getElement.md)
Returns the wrapped ReactElement.

#### [`.getElements() => Array<ReactElement>`](ShallowWrapper/getElements.md)
Returns the wrapped ReactElements.

#### [`.at(index) => ShallowWrapper`](ShallowWrapper/at.md)
Returns a wrapper of the node at the provided index of the current wrapper.

#### [`.first() => ShallowWrapper`](ShallowWrapper/first.md)
Returns a wrapper of the first node of the current wrapper.

#### [`.last() => ShallowWrapper`](ShallowWrapper/last.md)
Returns a wrapper of the last node of the current wrapper.

#### [`.state([key]) => Any`](ShallowWrapper/state.md)
Returns the state of the root component.

#### [`.context([key]) => Any`](ShallowWrapper/context.md)
Returns the context of the root component.

#### [`.props() => Object`](ShallowWrapper/props.md)
Returns the props of the current node.

#### [`.prop(key) => Any`](ShallowWrapper/prop.md)
Returns the named prop of the current node.

#### [`.key() => String`](ShallowWrapper/key.md)
Returns the key of the current node.

#### [`.invoke(propName)(...args) => Any`](ShallowWrapper/invoke.md)
Invokes a prop function on the current node and returns the function's return value.

#### [`.simulate(event[, data]) => ShallowWrapper`](ShallowWrapper/simulate.md)
Simulates an event on the current node.

*Deprecated:* Will be removed in later versions of Enzyme. [Click here for more information.](https://github.com/airbnb/enzyme/issues/2173#issuecomment-505551552)

#### [`.setState(nextState) => ShallowWrapper`](ShallowWrapper/setState.md)
Manually sets state of the root component.

#### [`.setProps(nextProps[, callback]) => ShallowWrapper`](ShallowWrapper/setProps.md)
Manually sets props of the root component.

#### [`.setContext(context) => ShallowWrapper`](ShallowWrapper/setContext.md)
Manually sets context of the root component.

#### [`.getWrappingComponent() => ShallowWrapper`](ShallowWrapper/getWrappingComponent.md)
Returns a wrapper representing the `wrappingComponent`, if one was passed.

#### [`.instance() => ReactComponent`](ShallowWrapper/instance.md)
Returns the instance of the root component.

#### [`.update() => ShallowWrapper`](ShallowWrapper/update.md)
Syncs the enzyme component tree snapshot with the react component tree.

#### [`.debug() => String`](ShallowWrapper/debug.md)
Returns a string representation of the current shallow render tree for debugging purposes.

#### [`.type() => String|Function|null`](ShallowWrapper/type.md)
Returns the type of the current node of the wrapper.

#### [`.name() => String`](ShallowWrapper/name.md)
Returns the name of the current node of the wrapper.

#### [`.forEach(fn) => ShallowWrapper`](ShallowWrapper/forEach.md)
Iterates through each node of the current wrapper and executes the provided function

#### [`.map(fn) => Array`](ShallowWrapper/map.md)
Maps the current array of nodes to another array.

#### [`.reduce(fn[, initialValue]) => Any`](ShallowWrapper/reduce.md)
Reduces the current array of nodes to a value

#### [`.reduceRight(fn[, initialValue]) => Any`](ShallowWrapper/reduceRight.md)
Reduces the current array of nodes to a value, from right to left.

#### [`.slice([begin[, end]]) => ShallowWrapper`](ShallowWrapper/slice.md)
Returns a new wrapper with a subset of the nodes of the original wrapper, according to the rules of `Array#slice`.

#### [`.tap(intercepter) => Self`](ShallowWrapper/tap.md)
Taps into the wrapper method chain. Helpful for debugging.

#### [`.some(selector) => Boolean`](ShallowWrapper/some.md)
Returns whether or not any of the nodes in the wrapper match the provided selector.

#### [`.someWhere(predicate) => Boolean`](ShallowWrapper/someWhere.md)
Returns whether or not any of the nodes in the wrapper pass the provided predicate function.

#### [`.every(selector) => Boolean`](ShallowWrapper/every.md)
Returns whether or not all of the nodes in the wrapper match the provided selector.

#### [`.everyWhere(predicate) => Boolean`](ShallowWrapper/everyWhere.md)
Returns whether or not all of the nodes in the wrapper pass the provided predicate function.

#### [`.dive([options]) => ShallowWrapper`](ShallowWrapper/dive.md)
Shallow render the one non-DOM child of the current wrapper, and return a wrapper around the result.
