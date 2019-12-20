import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon-sandbox';

export default function describeTap({
  Wrap,
}) {
  describe('.tap()', () => {
    it('calls the passed function with current Wrapper and returns itself', () => {
      const spy = sinon.spy();
      const wrapper = Wrap((
        <ul>
          <li>xxx</li>
          <li>yyy</li>
          <li>zzz</li>
        </ul>
      )).find('li');
      const result = wrapper.tap(spy);
      expect(spy.calledWith(wrapper)).to.equal(true);
      expect(result).to.equal(wrapper);
    });
  });
}
