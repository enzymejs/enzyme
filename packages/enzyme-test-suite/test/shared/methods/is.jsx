import React from 'react';
import { expect } from 'chai';

export default function describeIs({
  Wrap,
}) {
  describe('.is(selector)', () => {
    it('returns true when selector matches current element', () => {
      const wrapper = Wrap(<div className="foo bar baz" />);
      expect(wrapper.is('.foo')).to.equal(true);
    });

    it('allows for compound selectors', () => {
      const wrapper = Wrap(<div className="foo bar baz" />);
      expect(wrapper.is('.foo.bar')).to.equal(true);
    });

    it('ignores insignificant whitespace', () => {
      const className = `
      foo
      `;
      const wrapper = Wrap(<div className={className} />);
      expect(wrapper.is('.foo')).to.equal(true);
    });

    it('handles all significant whitespace', () => {
      const className = `foo

      bar
      baz`;
      const wrapper = Wrap(<div className={className} />);
      expect(wrapper.is('.foo.bar.baz')).to.equal(true);
    });

    it('returns false when selector does not match', () => {
      const wrapper = Wrap(<div className="bar baz" />);
      expect(wrapper.is('.foo')).to.equal(false);
    });
  });
}
