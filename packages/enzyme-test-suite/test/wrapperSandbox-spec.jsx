import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { ReactWrapper, configure } from 'enzyme';
import { get } from 'enzyme/build/configuration';

import {
  trackWrapper,
  unmountAllWrappers,
} from 'enzyme/build/wrapperSandbox';

const originalConfig = get();

describe('wrapperSandbox', () => {
  afterEach(() => {
    configure(originalConfig);
  });

  it('does what i expect', () => {
    const wrapper = new ReactWrapper(<p>foo</p>);
    const spy = sinon.spy();
    wrapper.unmount = spy;

    trackWrapper(wrapper);
    unmountAllWrappers();
    // default configuration is not to track wrappers
    expect(spy).to.have.property('callCount', 0);

    configure({ enableSandbox: true });
    trackWrapper(wrapper);
    unmountAllWrappers();
    // default configuration is not to track wrappers
    expect(spy).to.have.property('callCount', 1);
  });
});
