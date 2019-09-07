import React from 'react';
import { expect } from 'chai';

export default function describeEveryWhere({
  Wrap,
}) {
  describe('.everyWhere(predicate)', () => {
    it('returns if every node matches a predicate', () => {
      const wrapper = Wrap((
        <div>
          <div className="foo qoo" />
          <div className="foo boo" />
          <div className="foo hoo" />
        </div>
      ));
      const foo = wrapper.find('.foo');
      expect(foo.everyWhere((n) => n.hasClass('foo'))).to.equal(true);
      expect(foo.everyWhere((n) => n.hasClass('qoo'))).to.equal(false);
      expect(foo.everyWhere((n) => n.hasClass('bar'))).to.equal(false);
    });
  });
}
