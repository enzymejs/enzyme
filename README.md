Reagent
=======

[![npm Version](https://img.shields.io/npm/v/reagent.svg)](https://www.npmjs.com/package/reagent) [![License](https://img.shields.io/npm/l/reagent.svg)](https://www.npmjs.com/package/reagent) [![Build Status](https://travis-ci.org/airbnb/reagent.svg)](https://travis-ci.org/airbnb/reagent) [![Coverage Status](https://coveralls.io/repos/airbnb/reagent/badge.svg?branch=master&service=github)](https://coveralls.io/github/airbnb/reagent?branch=master)

Reagent is a JavaScript Testing utility for React that makes it easier to assert, manipulate,
and traverse your React Components' output.

Reagent's API is meant to be intuitive and flexible by mimicking jQuery's API for DOM manipulation
and traversal.

Reagent is unopinionated regarding which test runner or assertion library you use, and should be
compatible with all major test runners and assertion libraries out there. The documentation and
examples for reagent use [mocha](https://mochajs.org/) and [chai](http://chaijs.com/), but you
should be able to extrapolate to your framework of choice.



### [Installation](/docs/installation/README.md)

To get started with reagent, you can simply install it with npm:

```bash
npm i --save-dev reagent
```

Reagent is currently compatible with both `React 0.14.x` and `React 0.13.x`. In order to achieve
this compatibility, some dependencies cannot be explicitly listed in our `package.json`.

If you are using `React 0.14`, in addition to `reagent`, you will have to ensure that you also
have the following npm modules installed if they were not already:

```bash
npm i --save-dev react-addons-test-utils
npm i --save-dev react-dom
```


Basic Usage
===========

## [Shallow Rendering](/docs/api/shallow.md)

```jsx
import { shallow } from 'reagent';

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
    wrapper.find('button').simulate('click');
    expect(onButtonClick.calledOnce).to.be.true;
  });

});
```

Read the full [API Documentation](/docs/api/shallow.md)



## [JSDOM Full Rendering](/docs/api/mount.md)

```jsx
import {
  describeWithDOM,
  mount,
  spyLifecycle,
} from 'reagent';

describeWithDOM('<Foo />', () => {

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
    wrapper.find('button').simulate('click');
    expect(onButtonClick.calledOnce).to.be.true;
  });

});
```

Read the full [API Documentation](/docs/api/mount.md)


## [Static Rendered Markup](/docs/api/render.md)

```jsx
import { render } from 'reagent';

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

Read the full [API Documentation](/docs/api/render.md)


### [Future](/docs/future.md)

### [Contributing](/CONTRIBUTING.md)

### License

[MIT](/LICENSE.md)

