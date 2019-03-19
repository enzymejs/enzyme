import React from 'react';
import { expect } from 'chai';

import {
  itIf,
} from '../../_helpers';

import {
  createClass,
} from '../../_helpers/react-compat';

export default function describeParent({
  Wrap,
  isShallow,
}) {
  describe('.parent()', () => {
    it('returns only the immediate parent of the node', () => {
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

    it('works when the sibling node has children', () => {
      const wrapper = Wrap((
        <div className="bax">
          <div className="foo">
            <div className="bar">
              <div className="baz" />
              <div>
                <div />
              </div>
            </div>
          </div>
        </div>
      ));

      expect(wrapper.find('.baz').parent().hasClass('bar')).to.equal(true);
    });

    it('works for multiple nodes', () => {
      const wrapper = Wrap((
        <div>
          <div className="foo">
            <div className="baz" />
          </div>
          <div className="bar">
            <div className="baz" />
          </div>
          <div className="bax">
            <div className="baz" />
          </div>
        </div>
      ));

      const parents = wrapper.find('.baz').parent();
      expect(parents).to.have.lengthOf(3);
      expect(parents.at(0).hasClass('foo')).to.equal(true);
      expect(parents.at(1).hasClass('bar')).to.equal(true);
      expect(parents.at(2).hasClass('bax')).to.equal(true);
    });

    itIf(isShallow, 'works with component', () => {
      const Foo = createClass({
        render() {
          return <div className="bar" />;
        },
      });
      const wrapper = Wrap(<Foo />);
      expect(wrapper.find('.bar')).to.have.lengthOf(1);
      expect(wrapper.find('.bar').parent()).to.have.lengthOf(0);
      expect(wrapper.parent()).to.have.lengthOf(0);
    });

    itIf(!isShallow, 'works with component', () => {
      const Foo = createClass({
        render() {
          return <div className="bar" />;
        },
      });
      const wrapper = Wrap(<Foo />);
      expect(wrapper.find('.bar')).to.have.lengthOf(1);
      expect(wrapper.find('.bar').parent()).to.have.lengthOf(1);
      expect(wrapper.parent()).to.have.lengthOf(0);
    });
  });
}
