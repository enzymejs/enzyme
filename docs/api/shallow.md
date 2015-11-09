# Shallow Rendering API

Shallow rendering is useful to constrain yourself to testing a component as a unit, and to ensure
that your tests aren't indirectly asserting on behavior of child components.

```jsx
import { shallow } from 'airbnb-catalyst';

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
    const wrapper = shallow(
      <MyComponent>
        <div className="unique" />
      </MyComponent>
    );
    expect(wrapper.contains(<div className="unique" />)).to.be.true;
  });
  
  it('simulates click events', () => {
    const onButtonClick = sinon.spy();
    const wrapper = shallow(
      <Foo onButtonClick={onButtonClick} />
    );
    wrapper.find('button').click();
    expect(onButtonClick.calledOnce).to.be.true;
  });

});

```


## ShallowWrapper API

#### [`.find(selector) => ShallowWrapper`](ShallowWrapper/find.md)
Find every node in the render tree that matches the provided selector.

#### [`.findWhere(predicate) => ShallowWrapper`](/docs/api/ShallowWrapper/findWhere.md)
Find every node in the render tree that return true for the provided predicate function.

#### [`.filter(selector) => ShallowWrapper`](/docs/api/ShallowWrapper/filter.md)
Remove nodes in the current wrapper that do not match the provided selector.

#### [`.filterWhere(predicate) => ShallowWrapper`](/docs/api/ShallowWrapper/filterWhere.md)
Remove nodes in the current wrapper that do not return true for the provided predicate function.

#### [`.contains(node) => Boolean`](ShallowWrapper/contains.md) 
Returns whether or not a given node is somewhere in the render tree.

#### [`.hasClass(className) => Boolean`](/docs/api/ShallowWrapper/hasClass.md)
Returns whether or not the current root node has the given class name or not.

#### [`.is(selector) => Boolean`](/docs/api/ShallowWrapper/is.md)
Returns whether or not the current node matches a provided selector.

#### [`.not(selector) => ShallowWrapper`](/docs/api/ShallowWrapper/not.md)
Remove nodes in the current wrapper that match the provided selector. (inverse of `.filter()`)

#### [`.children() => ShallowWrapper`](/docs/api/ShallowWrapper/children.md)
Get a wrapper with all of the children nodes of the current wrapper.

#### [`.parents() => ShallowWrapper`](/docs/api/ShallowWrapper/parents.md)
Get a wrapper with all of the parents (ancestors) of the current node.

#### [`.parent() => ShallowWrapper`](/docs/api/ShallowWrapper/parent.md)
Get a wrapper with the direct parent of the current node.

#### [`.closest(selector) => ShallowWrapper`](/docs/api/ShallowWrapper/closest.md)
Get a wrapper with the first ancestor of the current node to match the provided selector.

#### [`.text() => String`](/docs/api/ShallowWrapper/text.md)
Returns a string representation of the text nodes in the current render tree.

#### [`.get(index) => ShallowWrapper`](/docs/api/ShallowWrapper/get.md)
Returns a wrapper of the node at the provided index of the current wrapper.

#### [`.first() => ShallowWrapper`](/docs/api/ShallowWrapper/first.md)
Returns a wrapper of the first node of the current wrapper.

#### [`.last() => ShallowWrapper`](/docs/api/ShallowWrapper/last.md)
Returns a wrapper of the last node of the current wrapper.

#### [`.state([key]) => Any`](/docs/api/ShallowWrapper/state.md)
Returns the state of the root component.

#### [`.props() => Object`](/docs/api/ShallowWrapper/props.md)
Returns the props of the root component.

#### [`.prop(key) => Any`](/docs/api/ShallowWrapper/prop.md)
Returns the named prop of the root component.

#### [`.simulate(event[, data]) => ShallowWrapper`](/docs/api/ShallowWrapper/simulate.md)
Simulates an event on the current node.

#### [`.setState(nextState) => ShallowWrapper`](/docs/api/ShallowWrapper/setState.md)
Manually sets state of the root component.

#### [`.setProps(nextProps) => ShallowWrapper`](/docs/api/ShallowWrapper/setProps.md)
Manually sets props of the root component.

#### [`.instance() => ReactComponent`](/docs/api/ShallowWrapper/instance.md)
Returns the instance of the root component.

#### [`.update() => ShallowWrapper`](/docs/api/ShallowWrapper/update.md)
Calls `.forceUpdate()` on the root component instance.

#### [`.debug() => String`](/docs/api/ShallowWrapper/debug.md)
Returns a string representation of the current shallow render tree for debugging purposes.
