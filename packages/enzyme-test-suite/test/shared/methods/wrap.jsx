import React from 'react';
import { expect } from 'chai';

import {
  itIf,
} from '../../_helpers';

export default function describeWrap({
  Wrap,
  Wrapper,
  isShallow,
  isMount,
}) {
  describe('.wrap()', () => {
    class Foo extends React.Component {
      render() {
        return (
          <div>
            <a href="#1">Hello</a>
            <a href="#2">Hello</a>
          </div>
        );
      }
    }

    it('returns itself when it is already a Wrapper', () => {
      const wrapperDiv = Wrap(<div />);
      const wrapperFoo = Wrap(<Foo />);

      expect(wrapperDiv.wrap(wrapperFoo)).to.equal(wrapperFoo);
      expect(wrapperFoo.wrap(wrapperDiv)).to.equal(wrapperDiv);
    });

    itIf(isShallow, 'wraps when it is not already a Wrapper', () => {
      const wrapper = Wrap(<Foo />);
      const el = wrapper.find('a').at(1);
      const wrappedEl = wrapper.wrap(el.getElement());
      expect(wrappedEl).to.be.instanceOf(Wrapper);
      expect(wrappedEl.props()).to.eql(el.props());

      expect(wrappedEl.shallow().debug()).to.equal(el.debug());
    });

    itIf(isMount, 'wraps when it is not already a Wrapper', () => {
      const wrapper = Wrap(<Foo />);
      const el = wrapper.find('a').at(1);
      const wrappedEl = wrapper.wrap(el.getElement());
      expect(wrappedEl).to.be.instanceOf(Wrapper);
      expect(wrappedEl.props()).to.eql(el.props());

      // FIXME: enable this instead of that:
      // expect(wrappedEl.mount().debug()).to.equal(el.debug());
      expect(wrappedEl.debug()).to.equal('<a href="#2" />');
    });
  });
}
