# `.find(selector) => ShallowWrapper`

Finds every node in the render tree of the current wrapper that matches the provided selector.


#### Arguments

1. `selector` ([`EnzymeSelector`](../selector.md)): The selector to match.



#### Returns

`ShallowWrapper`: A new wrapper that wraps the found nodes.



#### Examples

CSS Selectors:
```jsx
const wrapper = shallow(<MyComponent />);
expect(wrapper.find('.foo')).to.have.lengthOf(1);
expect(wrapper.find('.bar')).to.have.lengthOf(3);

// compound selector
expect(wrapper.find('div.some-class')).to.have.lengthOf(3);

// CSS id selector
expect(wrapper.find('#foo')).to.have.lengthOf(1);
```

Component Constructors:
```jsx
import Foo from '../components/Foo';

const wrapper = shallow(<MyComponent />);
expect(wrapper.find(Foo)).to.have.lengthOf(1);
```

Component Display Name:
```jsx
const wrapper = shallow(<MyComponent />);
expect(wrapper.find('Foo')).to.have.lengthOf(1);
```

Object Property Selector:
```jsx
const wrapper = shallow(<MyComponent />);
expect(wrapper.find({ prop: 'value' })).to.have.lengthOf(1);
```


#### Related Methods

- [`.findWhere(predicate) => ShallowWrapper`](findWhere.md)
