import React from 'react';
import { expect } from 'chai';

import {
  sym,
} from 'enzyme/build/Utils';

export default function describeSingle({
  Wrap,
}) {
  describe('#single()', () => {
    it('throws if run on multiple nodes', () => {
      const wrapper = Wrap(<div><i /><i /></div>).children();
      expect(wrapper).to.have.lengthOf(2);
      expect(() => wrapper.single('name!')).to.throw(
        Error,
        'Method “name!” is meant to be run on 1 node. 2 found instead.',
      );
    });

    it('throws if run on zero nodes', () => {
      const wrapper = Wrap(<div />).children();
      expect(wrapper).to.have.lengthOf(0);
      expect(() => wrapper.single('name!')).to.throw(
        Error,
        'Method “name!” is meant to be run on 1 node. 0 found instead.',
      );
    });

    it('throws if run on zero nodes', () => {
      const wrapper = Wrap(<div />).children();
      expect(wrapper).to.have.lengthOf(0);
      expect(() => wrapper.single('name!')).to.throw(
        Error,
        'Method “name!” is meant to be run on 1 node. 0 found instead.',
      );
    });

    it('works with a name', () => {
      const wrapper = Wrap(<div />);
      wrapper.single('foo', (node) => {
        expect(node).to.equal(wrapper[sym('__node__')]);
      });
    });

    it('works without a name', () => {
      const wrapper = Wrap(<div />);
      wrapper.single((node) => {
        expect(node).to.equal(wrapper[sym('__node__')]);
      });
    });
  });
}
