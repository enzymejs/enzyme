import React from 'react';
import { expect } from 'chai';

import { debugNodes } from 'enzyme/build/Debug';

import {
  describeIf,
  itIf,
} from '../../_helpers';
import { is } from '../../_helpers/version';

import {
  createClass,
  memo,
} from '../../_helpers/react-compat';

export default function describeDebug({
  Wrap,
  WrapRendered,
  isShallow,
}) {
  describe('.debug()', () => {
    context('passes through to the debugNodes function', () => {
      it('with wrapping an HTML element', () => {
        const wrapper = Wrap(<div />);

        expect(wrapper.debug()).to.equal('<div />');
        expect(wrapper.debug()).to.equal(debugNodes(wrapper.getNodesInternal()));
      });

      it('with wrapping a createClass component', () => {
        const Foo = createClass({
          displayName: 'Bar',
          render() { return <div />; },
        });
        const wrapper = Wrap(<Foo />);

        const expectedDebug = isShallow
          ? '<div />'
          : `<Bar>
  <div />
</Bar>`;
        expect(wrapper.debug()).to.equal(expectedDebug);
        expect(wrapper.debug()).to.equal(debugNodes(wrapper.getNodesInternal()));
      });

      it('with wrapping a class component', () => {
        class Foo extends React.Component {
          render() {
            return <div />;
          }
        }
        const wrapper = Wrap(<Foo />);

        const expectedDebug = isShallow
          ? '<div />'
          : `<Foo>
  <div />
</Foo>`;
        expect(wrapper.debug()).to.equal(expectedDebug);
        expect(wrapper.debug()).to.equal(debugNodes(wrapper.getNodesInternal()));
      });

      itIf(is('> 0.13'), 'with wrapping a stateless function component (SFC)', () => {
        const wrapper = Wrap(<div />);

        expect(wrapper.debug()).to.equal('<div />');
        expect(wrapper.debug()).to.equal(debugNodes(wrapper.getNodesInternal()));
      });
    });

    describeIf(is('>= 16.6'), 'React.memo', () => {
      function Add({ a, b, c }) {
        return <div>{String(a)}|{String(b)}|{String(c)}</div>;
      }
      Add.defaultProps = {
        b: 2,
        c: 3,
      };
      const MemoAdd = memo && memo(Add);

      it('applies defaultProps to the component', () => {
        const wrapper = WrapRendered(<Add />);
        expect(wrapper.debug()).to.equal(`<div>
  undefined
  |
  2
  |
  3
</div>`);
      });

      it('applies defaultProps to the memoized component', () => {
        const wrapper = WrapRendered(<MemoAdd />);
        expect(wrapper.debug()).to.equal(`<div>
  undefined
  |
  2
  |
  3
</div>`);
      });

      it('applies defaultProps to the memoized component and does not override real props', () => {
        const wrapper = WrapRendered(<MemoAdd a={10} b={20} />);
        expect(wrapper.debug()).to.equal(`<div>
  10
  |
  20
  |
  3
</div>`);
      });
    });
  });
}
