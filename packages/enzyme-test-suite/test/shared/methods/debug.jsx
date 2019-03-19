import React from 'react';
import { expect } from 'chai';

import { debugNodes } from 'enzyme/build/Debug';

import {
  itIf,
} from '../../_helpers';
import { is } from '../../_helpers/version';

import {
  createClass,
} from '../../_helpers/react-compat';

export default function describeDebug({
  Wrap,
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
  });
}
