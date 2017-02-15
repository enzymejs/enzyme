# `.update() => Self`

Forces a re-render. Useful to run before checking the render output if something external
may be updating the state of the component somewhere.

NOTE: can only be called on a wrapper instance that is also the root instance.


#### Returns

`ShallowWrapper`: Returns itself.



#### Example

```jsx
class ImpureRender extends React.Component {
  constructor(props) {
    super(props);
    this.count = 0;
  }
  render() {
    return <div>{this.count++}</div>
  }
}
```
```jsx
const wrapper = shallow(<ImpureRender />);
expect(wrapper.text()).to.equal("0");
wrapper.update();
expect(wrapper.text()).to.equal("1");
```
