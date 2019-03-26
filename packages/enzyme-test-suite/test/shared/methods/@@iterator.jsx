import React from 'react';
import { expect } from 'chai';

import {
  ITERATOR_SYMBOL,
} from 'enzyme/build/Utils';

import {
  describeIf,
} from '../../_helpers';

export default function describeIterator({
  Wrap,
}) {
  describeIf(!!ITERATOR_SYMBOL, '@@iterator', () => {
    it('is iterable', () => {
      class Foo extends React.Component {
        render() {
          return (
            <div>
              <a href="#1">Hello</a>
              <a href="#2">Hello</a>
              <a href="#3">Hello</a>
              <a href="#4">Hello</a>
            </div>
          );
        }
      }
      const wrapper = Wrap(<Foo />);
      const [a, b, c, d, ...e] = wrapper.find('a');
      const a1 = wrapper.find('a').get(0);
      const b1 = wrapper.find('a').get(1);
      const c1 = wrapper.find('a').get(2);
      const d1 = wrapper.find('a').get(3);
      expect(a1).to.deep.equal(a);
      expect(b1).to.deep.equal(b);
      expect(c1).to.deep.equal(c);
      expect(d1).to.deep.equal(d);
      expect(e).to.eql([]);
    });

    it('returns an iterable iterator', () => {
      class Foo extends React.Component {
        render() {
          return (
            <div>
              <a href="#1">Hello</a>
              <a href="#2">Hello</a>
              <a href="#3">Hello</a>
              <a href="#4">Hello</a>
            </div>
          );
        }
      }
      const wrapper = Wrap(<Foo />);

      const iter = wrapper[ITERATOR_SYMBOL]();
      expect(iter).to.have.property(ITERATOR_SYMBOL).and.be.a('function');
      expect(iter[ITERATOR_SYMBOL]()).to.equal(iter);
    });
  });
}
