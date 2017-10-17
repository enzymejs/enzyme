import React from 'react';
import Enzyme, { shallow, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { expect } from 'chai';
import Foo from '../src/Foo';

Enzyme.configure({ adapter: new Adapter() });

describe('A suite', () => {
  it('contains spec with an expectation', () => {
    expect(shallow(<Foo />).contains(<div className="foo" />)).to.equal(true);
  });

  it('contains spec with an expectation', () => {
    expect(shallow(<Foo />).is('.foo')).to.equal(true);
  });

  it('contains spec with an expectation', () => {
    expect(mount(<Foo />).find('.foo').length).to.equal(1);
  });
});
