# `.update() => Self`

Syncs the enzyme component tree snapshot with the react component tree. Useful to run before checking the render output if something external
may be updating the state of the component somewhere.

NOTE: can only be called on a wrapper instance that is also the root instance.

NOTE: this does not force a re-render. Use `wrapper.setProps({})` to force a re-render.


#### Returns

`ReactWrapper`: Returns itself.



#### Example

```jsx
class ImpureRender extends React.Component {
  constructor(props) {
    super(props);
    this.count = 0;
  }

  render() {
    this.count += 1;
    return <div>{this.count}</div>;
  }
}
```
```jsx
const wrapper = mount(<ImpureRender />);
expect(wrapper.text()).to.equal('0');
wrapper.update();
expect(wrapper.text()).to.equal('1');
```
