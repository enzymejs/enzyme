Catalyst
======

Catalyst is a JavaScript Testing utility for React

### [Installation](/docs/installation/README.md)

### [API Reference](/docs/api/README.md)

Basic Usage
===========

## [Shallow Rendering](/docs/api/shallow.md)

```javascript
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

## [JSDOM Full Rendering](/docs/api/mount.md)

```javascript
import {
  describeWithDom,
  mount,
  spyLifecycle,
} from 'airbnb-catalyst';

describeWithDom('<Foo />', () => {

  it('calls componentDidMount', () => {
    spyLifecycle(Foo);
    const wrapper = mount(<Foo />);
    expect(Foo.prototype.componentDidMount.calledOnce).to.be.true;
  });

  it('allows us to set props', () => {
    const wrapper = mount(<Foo bar="baz" />);
    expect(wrapper.props().bar).to.equal("baz");
    wrapper.setProps({ bar: "foo" });
    expect(wrapper.props().bar).to.equal("foo");
  });

  it('simulates click events', () => {
    const onButtonClick = sinon.spy();
    const wrapper = mount(
      <Foo onButtonClick={onButtonClick} />
    );
    wrapper.find('button').click();
    expect(onButtonClick.calledOnce).to.be.true;
  });

});
```


## [Static Rendered Markup](/docs/api/render.md)

```javascript
import { render } from 'airbnb-catalyst';

describe('<Foo />', () => {

  it('renders three `.foo-bar`s', () => {
    const wrapper = render(<Foo />);
    expect(wrapper.find('.foo-bar').length).to.equal(3);
  });

  it('rendered the title', () => {
    const wrapper = render(<Foo title="unique" />);
    expect(wrapper.text()).to.contain("unique");
  });

});
```

### [Future](/docs/future.md)

### [Contributing](/CONTRIBUTING.md)

### License

MIT

