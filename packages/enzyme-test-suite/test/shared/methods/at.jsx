import React from 'react';
import { expect } from 'chai';

export default function describeAt({
  Wrap,
}) {
  describe('.at(index)', () => {
    it('gets a wrapper of the node at the specified index', () => {
      const wrapper = Wrap((
        <div>
          <div className="bar foo" />
          <div className="bar bax" />
          <div className="bar bux" />
          <div className="bar baz" />
        </div>
      ));
      const bar = wrapper.find('.bar');
      expect(bar.at(0).hasClass('foo')).to.equal(true);
      expect(bar.at(1).hasClass('bax')).to.equal(true);
      expect(bar.at(2).hasClass('bux')).to.equal(true);
      expect(bar.at(3).hasClass('baz')).to.equal(true);
    });

    it('`.at()` does not affect the results of `.exists()`', () => {
      const wrapper = Wrap((
        <div>
          <div className="foo" />
        </div>
      ));
      const bar = wrapper.find('.bar');
      expect(bar.exists()).to.equal(false);
      expect(bar.at(0).exists()).to.equal(false);

      const foo = wrapper.find('.foo');
      expect(foo.exists()).to.equal(true);
      expect(foo.at(0).exists()).to.equal(true);
    });
  });
}
