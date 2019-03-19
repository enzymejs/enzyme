import React from 'react';
import { expect } from 'chai';

export default function describeEvery({
  Wrap,
}) {
  describe('.every(selector)', () => {
    it('returns if every node matches a selector', () => {
      const wrapper = Wrap((
        <div>
          <div className="foo qoo" />
          <div className="foo boo" />
          <div className="foo hoo" />
        </div>
      ));
      expect(wrapper.find('.foo').every('.foo')).to.equal(true);
      expect(wrapper.find('.foo').every('.qoo')).to.equal(false);
      expect(wrapper.find('.foo').every('.bar')).to.equal(false);
    });
  });
}
