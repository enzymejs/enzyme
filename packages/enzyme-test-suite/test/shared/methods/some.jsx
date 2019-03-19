import React from 'react';
import { expect } from 'chai';

export default function describeSome({
  Wrap,
  WrapperName,
}) {
  describe('.some(selector)', () => {
    it('returns if a node matches a selector', () => {
      const wrapper = Wrap((
        <div>
          <div className="foo qoo" />
          <div className="foo boo" />
          <div className="foo hoo" />
        </div>
      ));
      const foo = wrapper.find('.foo');
      expect(foo.some('.qoo')).to.equal(true);
      expect(foo.some('.foo')).to.equal(true);
      expect(foo.some('.bar')).to.equal(false);
    });

    it('throws if called on root', () => {
      const wrapper = Wrap((
        <div>
          <div className="foo" />
        </div>
      ));
      expect(() => wrapper.some('.foo')).to.throw(
        Error,
        `${WrapperName}::some() can not be called on the root`,
      );
    });
  });
}
