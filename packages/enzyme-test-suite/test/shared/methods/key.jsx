import React from 'react';
import { expect } from 'chai';

export default function describeKey({
  Wrap,
}) {
  describe('.key()', () => {
    it('returns the key of the node', () => {
      const wrapper = Wrap((
        <ul>
          {['foo', 'bar', ''].map((s) => <li key={s}>{s}</li>)}
        </ul>
      )).find('li');
      expect(wrapper.at(0).key()).to.equal('foo');
      expect(wrapper.at(1).key()).to.equal('bar');
      expect(wrapper.at(2).key()).to.equal('');
    });

    it('returns null when no key is specified', () => {
      const wrapper = Wrap((
        <ul>
          <li>foo</li>
        </ul>
      )).find('li');
      expect(wrapper.key()).to.equal(null);
    });
  });
}
