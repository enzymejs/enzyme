import React from 'react';
import { expect } from 'chai';

export default function describeSomeWhere({
  Wrap,
}) {
  describe('.someWhere(predicate)', () => {
    it('returns if a node matches a predicate', () => {
      const wrapper = Wrap((
        <div>
          <div className="foo qoo" />
          <div className="foo boo" />
          <div className="foo hoo" />
        </div>
      ));
      const foo = wrapper.find('.foo');
      expect(foo.someWhere(n => n.hasClass('qoo'))).to.equal(true);
      expect(foo.someWhere(n => n.hasClass('foo'))).to.equal(true);
      expect(foo.someWhere(n => n.hasClass('bar'))).to.equal(false);
    });
  });
}
