import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon-sandbox';

export default function describeUnmount({
  Wrap,
}) {
  describe('.unmount()', () => {
    class WillUnmount extends React.Component {
      componentWillUnmount() {}

      render() {
        const { id } = this.props;
        return (
          <div className={id}>
            {id}
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
  });
}
