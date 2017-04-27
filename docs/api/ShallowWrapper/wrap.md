# `.wrap(node) => ShallowWrapper`
Helpful utility method to create a new wrapper with the same root as the current wrapper, with any nodes passed in as the first parameter automatically wrapped.

#### Arguments


1. `node` (`ReactElement`): The node, which will be the root of your shallow wrapper


#### Returns

`ShallowWrapper`: A new wrapper that wraps the provided node.



#### Examples

```jsx
const wrapper = shallow(<MyComponent />);
const myOtherWrapper = wrapper.wrap(<MyOtherComponent />);

expect(myOtherWrapper.instance()).to.be.instanceOf(MyOtherComponent);
```

See issue https://github.com/airbnb/enzyme/issues/919 for explanations why you might need this
