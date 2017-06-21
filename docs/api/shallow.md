# Shallow Rendering API

Shallow rendering is useful to constrain yourself to testing a component as a unit, and to ensure
that your tests aren't indirectly asserting on behavior of child components.

```jsx
import { shallow } from 'enzyme';

describe('<MyComponent />', () => {
  it('should render three <Foo /> components', () => {
    const wrapper = shallow(<MyComponent />);
    expect(wrapper.find(Foo)).to.have.length(3);
  });

  it('should render an `.icon-star`', () => {
    const wrapper = shallow(<MyComponent />);
    expect(wrapper.find('.icon-star')).to.have.length(1);
  });

  it('should render children when passed in', () => {
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
    expect(onButtonClick.calledOnce).to.equal(true);
  });
});

```

## `shallow(node[, options]) => ShallowWrapper`

#### Arguments

1. `node` (`ReactElement`): The node to render
2. `options` (`Object` [optional]):
  - `options.context`: (`Object` [optional]): Context to be passed into the component
  - `options.disableLifecycleMethods`: (`Boolean` [optional]): If set to true, `componentWillMount`
is not called on the component, and `componentDidUpdate` is not called after
[`setProps`](ShallowWrapper/setProps.md) and [`setContext`](ShallowWrapper/setContext.md).

#### Returns

`ShallowWrapper`: The wrapper instance around the rendered output.


## ShallowWrapper API

#### [`.at(index) => ShallowWrapper`](ShallowWrapper/at.md)
Returns a wrapper of the node at the provided index of the current wrapper.

#### [`.childAt(index) => ShallowWrapper`](ShallowWrapper/childAt.md)
Returns a new wrapper with child at the specified index.

#### [`.children() => ShallowWrapper`](ShallowWrapper/children.md)
Get a wrapper with all of the children nodes of the current wrapper.

#### [`.closest(selector) => ShallowWrapper`](ShallowWrapper/closest.md)
Get a wrapper with the first ancestor of the current node to match the provided selector.

#### [`.contains(nodeOrNodes) => Boolean`](ShallowWrapper/contains.md)
Returns whether or not a given node or array of nodes is somewhere in the render tree.

#### [`.containsAllMatchingElements(nodes) => Boolean`](ShallowWrapper/containsAllMatchingElements.md)
Returns whether or not all the given react elements exists in the shallow render tree.

#### [`.containsAnyMatchingElements(nodes) => Boolean`](ShallowWrapper/containsAnyMatchingElements.md)
Returns whether or not one of the given react elements exists in the shallow render tree.

#### [`.containsMatchingElement(node) => Boolean`](ShallowWrapper/containsMatchingElement.md)
Returns whether or not a given react element exists in the shallow render tree.

#### [`.context([key]) => Any`](ShallowWrapper/context.md)
Returns the context of the root component.

#### [`.debug() => String`](ShallowWrapper/debug.md)
Returns a string representation of the current shallow render tree for debugging purposes.

#### [`.dive([options]) => ShallowWrapper`](ShallowWrapper/dive.md)
Shallow render the one non-DOM child of the current wrapper, and return a wrapper around the result.

#### [`.equals(node) => Boolean`](ShallowWrapper/equals.md)
Returns whether or not the current render tree is equal to the given node, based on the expected value.

#### [`.every(selector) => Boolean`](ShallowWrapper/every.md)
Returns whether or not all of the nodes in the wrapper match the provided selector.

#### [`.everyWhere(predicate) => Boolean`](ShallowWrapper/everyWhere.md)
Returns whether or not all of the nodes in the wrapper pass the provided predicate function.

#### [`.exists() => Boolean`](ShallowWrapper/exists.md)
Returns whether or not the current node exists.

#### [`.filter(selector) => ShallowWrapper`](ShallowWrapper/filter.md)
Remove nodes in the current wrapper that do not match the provided selector.

#### [`.filterWhere(predicate) => ShallowWrapper`](ShallowWrapper/filterWhere.md)
Remove nodes in the current wrapper that do not return true for the provided predicate function.

#### [`.find(selector) => ShallowWrapper`](ShallowWrapper/find.md)
Find every node in the render tree that matches the provided selector.

#### [`.findWhere(predicate) => ShallowWrapper`](ShallowWrapper/findWhere.md)
Find every node in the render tree that returns true for the provided predicate function.

#### [`.first() => ShallowWrapper`](ShallowWrapper/first.md)
Returns a wrapper of the first node of the current wrapper.

#### [`.forEach(fn) => ShallowWrapper`](ShallowWrapper/forEach.md)
Iterates through each node of the current wrapper and executes the provided function

#### [`.get(index) => ReactElement`](ShallowWrapper/get.md)
Returns the node at the provided index of the current wrapper.

#### [`.getNode() => ReactElement`](ShallowWrapper/getNode.md)
Returns the wrapper's underlying node.

#### [`.getNodes() => Array<ReactElement>`](ShallowWrapper/getNodes.md)
Returns the wrapper's underlying nodes.

#### [`.hasClass(className) => Boolean`](ShallowWrapper/hasClass.md)
Returns whether or not the current node has the given class name or not.

#### [`.html() => String`](ShallowWrapper/html.md)
Returns a static HTML rendering of the current node.

#### [`.instance() => ReactComponent`](ShallowWrapper/instance.md)
Returns the instance of the root component.

#### [`.is(selector) => Boolean`](ShallowWrapper/is.md)
Returns whether or not the current node matches a provided selector.

#### [`.isEmpty() => Boolean`](ShallowWrapper/isEmpty.md)
*Deprecated*: Use [.exists()](ShallowWrapper/exists.md) instead.

#### [`.isEmptyRender() => Boolean`](ShallowWrapper/isEmptyRender.md)
Returns whether or not the current component returns a falsy value.

#### [`.key() => String`](ShallowWrapper/key.md)
Returns the key of the current node.

#### [`.last() => ShallowWrapper`](ShallowWrapper/last.md)
Returns a wrapper of the last node of the current wrapper.

#### [`.map(fn) => Array`](ShallowWrapper/map.md)
Maps the current array of nodes to another array.

#### [`.matchesElement(node) => Boolean`](ShallowWrapper/matchesElement.md)
Returns whether or not a given react element matches the shallow render tree.

#### [`.name() => String`](ShallowWrapper/name.md)
Returns the name of the current node of the wrapper.

#### [`.not(selector) => ShallowWrapper`](ShallowWrapper/not.md)
Remove nodes in the current wrapper that match the provided selector. (inverse of `.filter()`)

#### [`.parent() => ShallowWrapper`](ShallowWrapper/parent.md)
Get a wrapper with the direct parent of the current node.

#### [`.parents() => ShallowWrapper`](ShallowWrapper/parents.md)
Get a wrapper with all of the parents (ancestors) of the current node.

#### [`.prop(key) => Any`](ShallowWrapper/prop.md)
Returns the named prop of the current node.

#### [`.props() => Object`](ShallowWrapper/props.md)
Returns the props of the current node.

#### [`.reduce(fn[, initialValue]) => Any`](ShallowWrapper/reduce.md)
Reduces the current array of nodes to a value

#### [`.reduceRight(fn[, initialValue]) => Any`](ShallowWrapper/reduceRight.md)
Reduces the current array of nodes to a value, from right to left.

#### [`.render() => CheerioWrapper`](ShallowWrapper/render.md)
Returns a CheerioWrapper of the current node's subtree.

#### [`.setContext(context) => ShallowWrapper`](ShallowWrapper/setContext.md)
Manually sets context of the root component.

#### [`.setProps(nextProps) => ShallowWrapper`](ShallowWrapper/setProps.md)
Manually sets props of the root component.

#### [`.setState(nextState) => ShallowWrapper`](ShallowWrapper/setState.md)
Manually sets state of the root component.

#### [`.shallow([options]) => ShallowWrapper`](ShallowWrapper/shallow.md)
Shallow renders the current node and returns a shallow wrapper around it.

#### [`.simulate(event[, data]) => ShallowWrapper`](ShallowWrapper/simulate.md)
Simulates an event on the current node.

#### [`.slice([begin[, end]]) => ShallowWrapper`](ShallowWrapper/slice.md)
Returns a new wrapper with a subset of the nodes of the original wrapper, according to the rules of `Array#slice`.

#### [`.some(selector) => Boolean`](ShallowWrapper/some.md)
Returns whether or not any of the nodes in the wrapper match the provided selector.

#### [`.someWhere(predicate) => Boolean`](ShallowWrapper/someWhere.md)
Returns whether or not any of the nodes in the wrapper pass the provided predicate function.

#### [`.state([key]) => Any`](ShallowWrapper/state.md)
Returns the state of the root component.

#### [`.tap(intercepter) => Self`](ShallowWrapper/tap.md)
Taps into the wrapper method chain. Helpful for debugging.

#### [`.text() => String`](ShallowWrapper/text.md)
Returns a string representation of the text nodes in the current render tree.

#### [`.type() => String|Function`](ShallowWrapper/type.md)
Returns the type of the current node of the wrapper.

#### [`.unmount() => ShallowWrapper`](ShallowWrapper/unmount.md)
A method that un-mounts the component.

#### [`.update() => ShallowWrapper`](ShallowWrapper/update.md)
Calls `.forceUpdate()` on the root component instance.
