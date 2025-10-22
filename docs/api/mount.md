# Full Rendering API (`mount(...)`)

Full DOM rendering is ideal for use cases where you have components that may interact with DOM APIs or need to test components that are wrapped in higher order components.

Full DOM rendering requires that a full DOM API be available at the global scope. This means that
it must be run in an environment that at least “looks like” a browser environment. If you do not
want to run your tests inside of a browser, the recommended approach to using `mount` is to depend
on a library called [jsdom](https://github.com/jsdom/jsdom) which is essentially a headless browser
implemented completely in JS.

**Note**: unlike shallow or static rendering, full rendering actually mounts the component in the DOM, which means that tests can affect each other if they are all using the same DOM. Keep that in mind while writing your tests and, if necessary, use [`.unmount()`](ReactWrapper/unmount.md) or something similar as cleanup.

```jsx
import { mount } from 'enzyme';
import sinon from 'sinon';
import Foo from './Foo';

describe('<Foo />', () => {
  it('calls componentDidMount', () => {
    sinon.spy(Foo.prototype, 'componentDidMount');
    const wrapper = mount(<Foo />);
    expect(Foo.prototype.componentDidMount).to.have.property('callCount', 1);
  });

  it('allows us to set props', () => {
    const wrapper = mount(<Foo bar="baz" />);
    expect(wrapper.props().bar).to.equal('baz');
    wrapper.setProps({ bar: 'foo' });
    expect(wrapper.props().bar).to.equal('foo');
  });

  it('simulates click events', () => {
    const onButtonClick = sinon.spy();
    const wrapper = mount((
      <Foo onButtonClick={onButtonClick} />
    ));
    wrapper.find('button').simulate('click');
    expect(onButtonClick).to.have.property('callCount', 1);
  });
});
```

## `mount(node[, options]) => ReactWrapper`

#### Arguments

1. `node` (`ReactElement`): The node to render
2. `options` (`Object` [optional]):
- `options.context`: (`Object` [optional]): Context to be passed into the component
- `options.attachTo`: (`DOMElement` [optional]): DOM Element to attach the component to.
- `options.childContextTypes`: (`Object` [optional]): Merged contextTypes for all children of the wrapper.
- `options.wrappingComponent`: (`ComponentType` [optional]): A component that will render as a parent of the `node`. It can be used to provide context to the `node`, among other things. See the [`getWrappingComponent()` docs](ReactWrapper/getWrappingComponent.md) for an example. **Note**: `wrappingComponent` _must_ render its children.
- `options.wrappingComponentProps`: (`Object` [optional]): Initial props to pass to the `wrappingComponent` if it is specified.

#### Returns

`ReactWrapper`: The wrapper instance around the rendered output.


## ReactWrapper API

#### [`.find(selector) => ReactWrapper`](ReactWrapper/find.md)
Find every node in the render tree that matches the provided selector.

#### [`.findWhere(predicate) => ReactWrapper`](ReactWrapper/findWhere.md)
Find every node in the render tree that returns true for the provided predicate function.

#### [`.filter(selector) => ReactWrapper`](ReactWrapper/filter.md)
Remove nodes in the current wrapper that do not match the provided selector.

#### [`.filterWhere(predicate) => ReactWrapper`](ReactWrapper/filterWhere.md)
Remove nodes in the current wrapper that do not return true for the provided predicate function.

#### [`.hostNodes() => ReactWrapper`](ReactWrapper/hostNodes.md)
Removes nodes that are not host nodes; e.g., this will only return HTML nodes.

#### [`.contains(nodeOrNodes) => Boolean`](ReactWrapper/contains.md)
Returns whether or not a given node or array of nodes exists in the render tree.

#### [`.containsMatchingElement(node) => Boolean`](ReactWrapper/containsMatchingElement.md)
Returns whether or not a given react element exists in the render tree.

#### [`.containsAllMatchingElements(nodes) => Boolean`](ReactWrapper/containsAllMatchingElements.md)
Returns whether or not all the given react elements exist in the render tree.

#### [`.containsAnyMatchingElements(nodes) => Boolean`](ReactWrapper/containsAnyMatchingElements.md)
Returns whether or not one of the given react elements exist in the render tree.

#### [`.equals(node) => Boolean`](ReactWrapper/equals.md)
Returns whether or not the current wrapper root node render tree looks like the one passed in.

#### [`.hasClass(className) => Boolean`](ReactWrapper/hasClass.md)
Returns whether or not the current root node has the given class name or not.

#### [`.is(selector) => Boolean`](ReactWrapper/is.md)
Returns whether or not the current node matches a provided selector.

#### [`.exists([selector]) => Boolean`](ReactWrapper/exists.md)
Returns whether or not the current node exists, or, if given a selector, whether that selector has any matching results.

#### [`.isEmpty() => Boolean`](ReactWrapper/isEmpty.md)
*Deprecated*: Use [`.exists()`](ReactWrapper/exists.md) instead.

#### [`.isEmptyRender() => Boolean`](ReactWrapper/isEmptyRender.md)
Returns whether or not the current component returns a falsy value.

#### [`.not(selector) => ReactWrapper`](ReactWrapper/not.md)
Remove nodes in the current wrapper that match the provided selector. (inverse of `.filter()`)

#### [`.children([selector]) => ReactWrapper`](ReactWrapper/children.md)
Get a wrapper with all of the children nodes of the current wrapper.

#### [`.childAt(index) => ReactWrapper`](ReactWrapper/childAt.md)
Returns a new wrapper with child at the specified index.

#### [`.parents([selector]) => ReactWrapper`](ReactWrapper/parents.md)
Get a wrapper with all of the parents (ancestors) of the current node.

#### [`.parent() => ReactWrapper`](ReactWrapper/parent.md)
Get a wrapper with the direct parent of the current node.

#### [`.closest(selector) => ReactWrapper`](ReactWrapper/closest.md)
Get a wrapper with the first ancestor of the current node to match the provided selector.

#### [`.render() => CheerioWrapper`](ReactWrapper/render.md)
Returns a CheerioWrapper of the current node's subtree.

#### [`.renderProp(key)() => ReactWrapper`](ReactWrapper/renderProp.md)
Returns a wrapper of the node rendered by the provided render prop.

#### [`.text() => String`](ReactWrapper/text.md)
Returns a string representation of the text nodes in the current render tree.

#### [`.html() => String`](ReactWrapper/html.md)
Returns a static HTML rendering of the current node.

#### [`.get(index) => ReactElement`](ReactWrapper/get.md)
Returns the node at the provided index of the current wrapper.

#### [`.getDOMNode() => DOMComponent`](ReactWrapper/getDOMNode.md)
Returns the outer most DOMComponent of the current wrapper.

#### [`.getElement() => ReactElement`](ReactWrapper/getElement.md)
Returns the wrapped ReactElement.

#### [`.getElements() => Array<ReactElement>`](ReactWrapper/getElements.md)
Returns the wrapped ReactElements.

#### [`.at(index) => ReactWrapper`](ReactWrapper/at.md)
Returns a wrapper of the node at the provided index of the current wrapper.

#### [`.first() => ReactWrapper`](ReactWrapper/first.md)
Returns a wrapper of the first node of the current wrapper.

#### [`.last() => ReactWrapper`](ReactWrapper/last.md)
Returns a wrapper of the last node of the current wrapper.

#### [`.state([key]) => Any`](ReactWrapper/state.md)
Returns the state of the root component.

#### [`.context([key]) => Any`](ReactWrapper/context.md)
Returns the context of the root component.

#### [`.props() => Object`](ReactWrapper/props.md)
Returns the props of the root component.

#### [`.prop(key) => Any`](ReactWrapper/prop.md)
Returns the named prop of the root component.

#### [`.invoke(propName)(...args) => Any`](ReactWrapper/invoke.md)
Invokes a prop function on the current node and returns the function's return value.

#### [`.key() => String`](ReactWrapper/key.md)
Returns the key of the root component.

#### [`.simulate(event[, mock]) => ReactWrapper`](ReactWrapper/simulate.md)
Simulates an event on the current node.

*Deprecated:* Will be removed in later versions of Enzyme. [Click here for more information.](https://github.com/airbnb/enzyme/issues/2173#issuecomment-505551552)


#### [`.setState(nextState) => ReactWrapper`](ReactWrapper/setState.md)
Manually sets state of the root component.

#### [`.setProps(nextProps[, callback]) => ReactWrapper`](ReactWrapper/setProps.md)
Manually sets props of the root component.

#### [`.setContext(context) => ReactWrapper`](ReactWrapper/setContext.md)
Manually sets context of the root component.

#### [`.instance() => ReactComponent|DOMComponent`](ReactWrapper/instance.md)
Returns the wrapper's underlying instance.

#### [`.getWrappingComponent() => ReactWrapper`](ReactWrapper/getWrappingComponent.md)
Returns a wrapper representing the `wrappingComponent`, if one was passed.

#### [`.unmount() => ReactWrapper`](ReactWrapper/unmount.md)
A method that un-mounts the component.

#### [`.mount() => ReactWrapper`](ReactWrapper/mount.md)
A method that re-mounts the component.

#### [`.update() => ReactWrapper`](ReactWrapper/update.md)
Syncs the enzyme component tree snapshot with the react component tree.

#### [`.debug() => String`](ReactWrapper/debug.md)
Returns a string representation of the current render tree for debugging purposes.

#### [`.type() => String|Function`](ReactWrapper/type.md)
Returns the type of the current node of the wrapper.

#### [`.name() => String`](ReactWrapper/name.md)
Returns the name of the current node of the wrapper.

#### [`.forEach(fn) => ReactWrapper`](ReactWrapper/forEach.md)
Iterates through each node of the current wrapper and executes the provided function

#### [`.map(fn) => Array`](ReactWrapper/map.md)
Maps the current array of nodes to another array.

#### [`.matchesElement(node) => Boolean`](ReactWrapper/matchesElement.md)
Returns whether or not a given react element matches the current render tree.

#### [`.reduce(fn[, initialValue]) => Any`](ReactWrapper/reduce.md)
Reduces the current array of nodes to a value

#### [`.reduceRight(fn[, initialValue]) => Any`](ReactWrapper/reduceRight.md)
Reduces the current array of nodes to a value, from right to left.

#### [`.slice([begin[, end]]) => ReactWrapper`](ReactWrapper/slice.md)
Returns a new wrapper with a subset of the nodes of the original wrapper, according to the rules of `Array#slice`.

#### [`.tap(intercepter) => Self`](ReactWrapper/tap.md)
Taps into the wrapper method chain. Helpful for debugging.

#### [`.some(selector) => Boolean`](ReactWrapper/some.md)
Returns whether or not any of the nodes in the wrapper match the provided selector.

#### [`.someWhere(predicate) => Boolean`](ReactWrapper/someWhere.md)
Returns whether or not any of the nodes in the wrapper pass the provided predicate function.

#### [`.every(selector) => Boolean`](ReactWrapper/every.md)
Returns whether or not all of the nodes in the wrapper match the provided selector.

#### [`.everyWhere(predicate) => Boolean`](ReactWrapper/everyWhere.md)
Returns whether or not all of the nodes in the wrapper pass the provided predicate function.

#### [`.ref(refName) => ReactComponent | HTMLElement`](ReactWrapper/ref.md)
Returns the node that matches the provided reference name.

#### [`.detach() => void`](ReactWrapper/detach.md)
Unmount the component from the DOM node it's attached to.
