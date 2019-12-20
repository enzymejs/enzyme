import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon-sandbox';

export default function describeFilterWhere({
  Wrap,
  Wrapper,
}) {
  describe('.filterWhere(predicate)', () => {
    it('filters only the nodes of the wrapper', () => {
      const wrapper = Wrap((
        <div>
          <div className="foo bar" />
          <div className="foo baz" />
          <div className="foo bux" />
        </div>
      ));

      const stub = sinon.stub();
      stub.onCall(0).returns(false);
      stub.onCall(1).returns(true);
      stub.onCall(2).returns(false);

      const baz = wrapper.find('.foo').filterWhere(stub);
      expect(baz).to.have.lengthOf(1);
      expect(baz.hasClass('baz')).to.equal(true);
    });

    it('calls the predicate with the wrapped node as the first argument', () => {
      const wrapper = Wrap((
        <div>
          <div className="foo bar" />
          <div className="foo baz" />
          <div className="foo bux" />
        </div>
      ));

      const stub = sinon.stub();
      stub.returns(true);
      const spy = sinon.spy(stub);
      wrapper.find('.foo').filterWhere(spy);
      expect(spy).to.have.property('callCount', 3);
      expect(spy.args[0][0]).to.be.instanceOf(Wrapper);
      expect(spy.args[1][0]).to.be.instanceOf(Wrapper);
      expect(spy.args[2][0]).to.be.instanceOf(Wrapper);
      expect(spy.args[0][0].hasClass('bar')).to.equal(true);
      expect(spy.args[1][0].hasClass('baz')).to.equal(true);
      expect(spy.args[2][0].hasClass('bux')).to.equal(true);
    });
  });
}
