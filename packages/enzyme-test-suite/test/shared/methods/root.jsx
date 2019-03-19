import React from 'react';
import { expect } from 'chai';

import {
  itIf,
} from '../../_helpers';

export default function describeRoot({
  Wrap,
  isMount,
}) {
  describe('.root()', () => {
    class Fixture extends React.Component {
      render() {
        return <div><span /><span /></div>;
      }
    }

    itIf(isMount, 'returns the root component instance', () => {
      const wrapper = Wrap(<Fixture />);
      const root = wrapper.root();
      expect(root.is(Fixture)).to.equal(true);
      expect(root.childAt(0).children().debug()).to.equal('<span />\n\n\n<span />');

      expect(wrapper.find('span').root()).to.equal(root);
    });

    itIf(!isMount, 'returns the root rendered node', () => {
      const wrapper = Wrap(<Fixture />);
      const root = wrapper.root();
      expect(root.is('div')).to.equal(true);
      expect(root.children().debug()).to.equal('<span />\n\n\n<span />');

      expect(wrapper.find('span').root()).to.equal(root);
    });

    it('returns the root wrapper from a child', () => {
      const wrapper = Wrap(<Fixture />);
      const root = wrapper.root();
      expect(wrapper.find('span').root()).to.equal(root);
    });
  });
}
