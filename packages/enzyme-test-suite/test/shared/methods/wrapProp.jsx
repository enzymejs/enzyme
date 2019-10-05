import React from 'react';
import { expect } from 'chai';
import wrap from 'mocha-wrap';

import getAdapter from 'enzyme/build/getAdapter';

export default function describeWrapProp({
  Wrap,
  WrapRendered,
  WrapperName,
  isShallow,
}) {
  wrap()
    .withConsoleThrows()
    .describe('.wrapProp()', () => {
      class Inner extends React.Component {
        render() {
          return <div className="inner" />;
        }
      }
      class Outer extends React.Component {
        render() {
          return <div />;
        }
      }
      class Container extends React.Component {
        render() {
          const node = this.props.replace || <Inner />;
          return <Outer node={node} />;
        }
      }

      it('returns a wrapper around the node provided by the given prop', () => {
        const wrapper = Wrap(<Container />);
        const wrappedPropWrapper = wrapper.find(Outer).wrapProp('node');
        expect(wrappedPropWrapper.find('div').equals(<div className="inner" />)).to.equal(true);
        if (isShallow) expect(wrappedPropWrapper.equals(<div className="inner" />)).to.equal(true);
      });

      it('throws on a non-string prop name', () => {
        const wrapper = Wrap(<Container />);
        expect(() => wrapper.find(Outer).wrapProp([])).to.throw(
          TypeError,
          `${WrapperName}::wrapProp(): \`propName\` must be a string`,
        );
      });

      it('throws on a missing prop', () => {
        const wrapper = Wrap(<Container />);
        expect(() => wrapper.find(Outer).wrapProp('missing')).to.throw(
          Error,
          `${WrapperName}::wrapProp(): no prop called "missing" found`,
        );
      });

      it('throws on an invalid element prop value', () => {
        const wrapper = Wrap(<Container replace={() => <div />} />);
        expect(() => wrapper.find(Outer).wrapProp('node')).to.throw(
          TypeError,
          `${WrapperName}::wrapProp(): prop "node" does not contain a valid element`,
        );
      });

      wrap()
        .withOverride(() => getAdapter(), 'wrap', () => undefined)
        .it('throws with a react adapter that lacks a `.wrap`', () => {
          const wrapper = Wrap(<Container />);
          expect(() => wrapper.find(Outer).wrapProp('foo')).to.throw(RangeError);
        });
    });
}
