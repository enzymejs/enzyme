import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon-sandbox';

import {
  itIf,
} from '../../_helpers';

export default function describeUnmount({
  isShallow,
  Wrap,
  WrapRendered,
}) {
  describe('.unmount()', () => {
    class WillUnmount extends React.Component {
      componentWillUnmount() {}

      render() {
        const { id } = this.props;
        return (
          <div className={id}>
            <span>
              {id}
            </span>
          </div>
        );
      }
    }

    it('calls componentWillUnmount()', () => {
      const spy = sinon.spy(WillUnmount.prototype, 'componentWillUnmount');
      const wrapper = Wrap(<WillUnmount id="foo" />);
      expect(spy).to.have.property('callCount', 0);

      wrapper.unmount();

      expect(spy).to.have.property('callCount', 1);
      const [args] = spy.args;
      expect(args).to.eql([]);
    });

    itIf(!isShallow, 'throws on non-root', () => {
      const wrapper = WrapRendered(<WillUnmount id="foo" />);
      const span = wrapper.find('span');
      expect(span).to.have.lengthOf(1);
      expect(() => span.unmount()).to.throw(Error);
    });
  });
}
