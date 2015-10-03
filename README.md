Catalyst
======

JavaScript Testing utility for React / Flux



Installation
============

Install catalyst from NPM into your project

```bash
npm install airbnb-catalyst --save-dev
```

If you plan on using `mount`, it requires jsdom. Jsdom requires node 4. As a result, if you want to use `mount`, you will
need to make sure node 4 or iojs is on your machine.

If you need to switch between different versions of node, you can use a CLI tool called `nvm` to quickly
switch between them.

To install NVM:

```bash
brew install nvm
nvm install 4.1.1
```

Now your machine will be running Node 4. You can use the `nvm use` command to switch between the two 
environments:

```bash
nvm use 0.12.7
```

```bash
nvm use 4.1.1
```



Basic Usage
===========

## Shallow Rendering

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

## JsDom Full Rendering

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


## Static Rendered Markup

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
