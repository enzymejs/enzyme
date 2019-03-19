import React from 'react';
import { expect } from 'chai';

export default function describeClosest({
  Wrap,
}) {
  describe('.closest(selector)', () => {
    it('returns the closest ancestor for a given selector', () => {
      const wrapper = Wrap((
        <div className="foo">
          <div className="foo baz">
            <div className="bax">
              <div className="bar" />
            </div>
          </div>
        </div>
      ));

      const closestFoo = wrapper.find('.bar').closest('.foo');
      expect(closestFoo).to.have.lengthOf(1);
      expect(closestFoo.hasClass('baz')).to.equal(true);
    });

    it('only ever returns a wrapper of a single node', () => {
      const wrapper = Wrap((
        <div className="bax">
          <div className="foo">
            <div className="bar">
              <div className="baz" />
            </div>
          </div>
        </div>
      ));

      expect(wrapper.find('.baz').parent().hasClass('bar')).to.equal(true);
    });

    it('returns itself if matching', () => {
      const wrapper = Wrap((
        <div className="bax">
          <div className="foo">
            <div className="baz">
              <div className="bux baz" />
            </div>
          </div>
        </div>
      ));

      expect(wrapper.find('.bux').closest('.baz').hasClass('bux')).to.equal(true);
    });

    it('does not find a nonexistent match', () => {
      const wrapper = Wrap((
        <div className="foo">
          <div className="bar" />
        </div>
      ));

      expect(wrapper.find('.fooooo')).to.have.lengthOf(0);

      const bar = wrapper.find('.bar');
      expect(bar).to.have.lengthOf(1);

      expect(bar.closest('.fooooo')).to.have.lengthOf(0);
    });
  });
}
