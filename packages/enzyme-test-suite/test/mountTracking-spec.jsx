import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { ReactWrapper, configure } from 'enzyme';
import { get } from 'enzyme/build/configuration';

import {
  trackMountedWrapper,
  unmountAllWrappers,
} from 'enzyme/build/mountTracking';

const originalConfig = get();

describe('mountTracking', () => {
  afterEach(() => {
    configure(originalConfig);
  });

  it('does what i expect', () => {
    const wrapper = new ReactWrapper(<p>foo</p>);
    const spy = sinon.spy();
    wrapper.unmount = spy;

    trackMountedWrapper(wrapper);
    unmountAllWrappers();
    // default configuration is not to track wrappers
    expect(spy).to.have.property('callCount', 0);

    configure({ enableMountTracking: true });
    trackMountedWrapper(wrapper);
    unmountAllWrappers();
    // default configuration is not to track wrappers
    expect(spy).to.have.property('callCount', 1);
  });
});
