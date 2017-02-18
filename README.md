Enzyme
=======

[![Join the chat at https://gitter.im/airbnb/enzyme](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/airbnb/enzyme?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![npm Version](https://img.shields.io/npm/v/enzyme.svg)](https://www.npmjs.com/package/enzyme) [![License](https://img.shields.io/npm/l/enzyme.svg)](https://www.npmjs.com/package/enzyme) [![Build Status](https://travis-ci.org/airbnb/enzyme.svg)](https://travis-ci.org/airbnb/enzyme) [![Coverage Status](https://coveralls.io/repos/airbnb/enzyme/badge.svg?branch=master&service=github)](https://coveralls.io/github/airbnb/enzyme?branch=master)
[![Discord Channel](https://img.shields.io/badge/discord-testing@reactiflux-738bd7.svg?style=flat-square)](https://discord.gg/0ZcbPKXt5bY8vNTA)



Enzyme is a JavaScript Testing utility for React that makes it easier to assert, manipulate,
and traverse your React Components' output.

Enzyme's API is meant to be intuitive and flexible by mimicking jQuery's API for DOM manipulation
and traversal.

Enzyme is unopinionated regarding which test runner or assertion library you use, and should be
compatible with all major test runners and assertion libraries out there. The documentation and
examples for enzyme use [mocha](https://mochajs.org/) and [chai](http://chaijs.com/), but you
should be able to extrapolate to your framework of choice.

If you are interested in using enzyme with custom assertions and convenience functions for
testing your React components, you can consider using:
* [`chai-enzyme`](https://github.com/producthunt/chai-enzyme) with Mocha/Chai.
* [`jasmine-enzyme`](https://github.com/blainekasten/enzyme-matchers/tree/master/packages/jasmine-enzyme) with Jasmine.
* [`jest-enzyme`](https://github.com/blainekasten/enzyme-matchers/tree/master/packages/jest-enzyme) with Jest.
* [`should-enzyme`](https://github.com/rkotze/should-enzyme) for should.js.


[Using Enzyme with Mocha](/docs/guides/mocha.md)

[Using Enzyme with Karma](/docs/guides/karma.md)

[Using Enzyme with Browserify](/docs/guides/browserify.md)

[Using Enzyme with SystemJS](/docs/guides/systemjs.md)

[Using Enzyme with WebPack](/docs/guides/webpack.md)

[Using Enzyme with JSDOM](/docs/guides/jsdom.md)

[Using Enzyme with React Native](/docs/guides/react-native.md)

[Using Enzyme with Jest](/docs/guides/jest.md)

[Using Enzyme with Lab](/docs/guides/lab.md)

[Using Enzyme with Tape and AVA](/docs/guides/tape-ava.md)

### [Installation](/docs/installation/README.md)

To get started with enzyme, you can simply install it with npm:

```bash
npm i --save-dev enzyme
```

Enzyme is currently compatible with `React 15.x`, `React 0.14.x` and `React 0.13.x`. In order to
achieve this compatibility, some dependencies cannot be explicitly listed in our `package.json`.

If you are using `React 0.14` or `React 15.x`, in addition to `enzyme`, you will have to ensure that
you also have the following npm modules installed if they were not already:

```bash
npm i --save-dev react-addons-test-utils
npm i --save-dev react-dom
```


Basic Usage
===========

## [Shallow Rendering](/docs/api/shallow.md)

```javascript
import React from 'react';
import { shallow } from 'enzyme';
import sinon from 'sinon';

import MyComponent from './MyComponent';
import Foo from './Foo';

describe('<MyComponent />', () => {
  it('renders three <Foo /> components', () => {
    const wrapper = shallow(<MyComponent />);
    expect(wrapper.find(Foo)).to.have.length(3);
  });

  it('renders an `.icon-star`', () => {
    const wrapper = shallow(<MyComponent />);
    expect(wrapper.find('.icon-star')).to.have.length(1);
  });

  it('renders children when passed in', () => {
    const wrapper = shallow(
      <MyComponent>
        <div className="unique" />
      </MyComponent>
    );
    expect(wrapper.contains(<div className="unique" />)).to.equal(true);
  });

  it('simulates click events', () => {
    const onButtonClick = sinon.spy();
    const wrapper = shallow(
      <Foo onButtonClick={onButtonClick} />
    );
    wrapper.find('button').simulate('click');
    expect(onButtonClick).to.have.property('callCount', 1);
  });
});
```

Read the full [API Documentation](/docs/api/shallow.md)



## [Full DOM Rendering](/docs/api/mount.md)

```javascript
import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';

import Foo from './Foo';

describe('<Foo />', () => {
  it('allows us to set props', () => {
    const wrapper = mount(<Foo bar="baz" />);
    expect(wrapper.props().bar).to.equal('baz');
    wrapper.setProps({ bar: 'foo' });
    expect(wrapper.props().bar).to.equal('foo');
  });

  it('simulates click events', () => {
    const onButtonClick = sinon.spy();
    const wrapper = mount(
      <Foo onButtonClick={onButtonClick} />
    );
    wrapper.find('button').simulate('click');
    expect(onButtonClick).to.have.property('callCount', 1);
  });

  it('calls componentDidMount', () => {
    sinon.spy(Foo.prototype, 'componentDidMount');
    const wrapper = mount(<Foo />);
    expect(Foo.prototype.componentDidMount).to.have.property('callCount', 1);
    Foo.prototype.componentDidMount.restore();
  });
});
```

Read the full [API Documentation](/docs/api/mount.md)


## [Static Rendered Markup](/docs/api/render.md)

```javascript
import React from 'react';
import { render } from 'enzyme';

import Foo from './Foo';

describe('<Foo />', () => {
  it('renders three `.foo-bar`s', () => {
    const wrapper = render(<Foo />);
    expect(wrapper.find('.foo-bar').length).to.equal(3);
  });

  it('renders the title', () => {
    const wrapper = render(<Foo title="unique" />);
    expect(wrapper.text()).to.contain('unique');
  });
});
```

Read the full [API Documentation](/docs/api/render.md)


### Future

[Enzyme Future](/docs/future.md)


### Contributing

See the [Contributors Guide](/CONTRIBUTING.md)

### In the wild

Organizations and projects using `enzyme` can list themselves [here](INTHEWILD.md).

### License

[MIT](/LICENSE.md)
