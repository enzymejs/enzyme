import React from 'react';
import { expect } from 'chai';

export default function describeFirst({
  Wrap,
}) {
  describe('.first()', () => {
    it('returns the first node in the current set', () => {
      const wrapper = Wrap((
        <div>
          <div className="bar baz" />
          <div className="bar" />
          <div className="bar" />
          <div className="bar" />
        </div>
      ));
      expect(wrapper.find('.bar').first().hasClass('baz')).to.equal(true);
    });
  });
}
