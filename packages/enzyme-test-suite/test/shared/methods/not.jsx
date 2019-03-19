import React from 'react';
import { expect } from 'chai';

export default function describeNot({
  Wrap,
}) {
  describe('.not(selector)', () => {
    it('filters to things not matching a selector', () => {
      const wrapper = Wrap((
        <div>
          <div className="foo bar baz" />
          <div className="foo" />
          <div className="bar baz" />
          <div className="baz" />
          <div className="foo bar" />
        </div>
      ));

      expect(wrapper.find('.foo').not('.bar')).to.have.lengthOf(1);
      expect(wrapper.find('.baz').not('.foo')).to.have.lengthOf(2);
      expect(wrapper.find('.foo').not('div')).to.have.lengthOf(0);
    });
  });
}
