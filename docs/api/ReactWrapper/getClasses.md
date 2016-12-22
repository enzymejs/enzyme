# `.getClasses() => Array<String>`

Returns an array containing all the classes for the current node. This can be used in a similar
fashion as [`.hasClass`](hasClass.md), but can return more interesting information in certain
test runners on failure, since it will include all class names, and not just a boolean.


#### Returns

`Array<String>`: an array containing all the classes for the current node.


#### Example

```jsx
const wrapper = mount(<MyComponent />);
expect(wrapper.find('.main-navigation-link').getClasses()).to.include('active');
```
