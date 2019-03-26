import React from 'react';
import { expect } from 'chai';
import wrap from 'mocha-wrap';
import sinon from 'sinon-sandbox';

import getAdapter from 'enzyme/build/getAdapter';

import {
  describeIf,
} from '../../_helpers';
import { is } from '../../_helpers/version';

export default function describeRenderProp({
  Wrap,
  WrapRendered,
  WrapperName,
}) {
  wrap()
    .withConsoleThrows()
    .describe('.renderProp()', () => {
      class Foo extends React.Component {
        render() {
          return <div className="in-foo" />;
        }
      }
      class Bar extends React.Component {
        render() {
          const { render: r } = this.props;
          return <div className="in-bar">{typeof r === 'function' && r()}</div>;
        }
      }
      class RendersBar extends React.Component {
        render() {
          return <Bar {...this.props} />;
        }
      }

      it('returns a wrapper around the node returned from the render prop', () => {
        const wrapperA = Wrap(<div><Bar render={() => <div><Foo /></div>} /></div>);
        const renderPropWrapperA = wrapperA.find(Bar).renderProp('render')();
        expect(renderPropWrapperA.find(Foo)).to.have.lengthOf(1);

        const wrapperB = Wrap(<div><Bar render={() => <Foo />} /></div>);
        const renderPropWrapperB = wrapperB.find(Bar).renderProp('render')();
        expect(renderPropWrapperB.find(Foo)).to.have.lengthOf(1);

        const stub = sinon.stub().returns(<div />);
        const wrapperC = Wrap(<div><Bar render={stub} /></div>);
        stub.resetHistory();
        wrapperC.find(Bar).renderProp('render')('one', 'two');
        expect(stub.args).to.deep.equal([['one', 'two']]);
      });

      it('throws on a non-string prop name', () => {
        const wrapper = Wrap(<RendersBar render={() => {}} />);
        expect(() => wrapper.renderProp()).to.throw(
          TypeError,
          `${WrapperName}::renderProp(): \`propName\` must be a string`,
        );
      });

      it('throws on a missing prop', () => {
        const wrapper = Wrap(<RendersBar render={() => {}} />);
        expect(() => wrapper.renderProp('nope')).to.throw(
          Error,
          `${WrapperName}::renderProp(): no prop called “nope“ found`,
        );
      });

      it('throws on a non-function render prop value', () => {
        const wrapper = Wrap(<RendersBar render={{}} />);
        expect(() => wrapper.renderProp('render')).to.throw(
          TypeError,
          `${WrapperName}::renderProp(): expected prop “render“ to contain a function, but it holds “object“`,
        );
      });

      it('throws on host elements', () => {
        class Div extends React.Component {
          render() {
            const { children } = this.props;
            return <div>{children}</div>;
          }
        }

        const wrapper = WrapRendered(<Div />);
        expect(wrapper.is('div')).to.equal(true);
        expect(() => wrapper.renderProp('foo')).to.throw();
      });

      wrap()
        .withOverride(() => getAdapter(), 'wrap', () => undefined)
        .it('throws with a react adapter that lacks a `.wrap`', () => {
          const wrapper = Wrap(<div><Bar render={() => <div><Foo /></div>} /></div>);
          expect(() => wrapper.find(Bar).renderProp('render')).to.throw(RangeError);
        });

      describeIf(is('>= 16'), 'allows non-nodes', () => {
        function MyComponent({ val }) {
          return <ComponentWithRenderProp val={val} r={x => x} />;
        }

        function ComponentWithRenderProp({ val, r }) {
          return r(val);
        }

        it('works with strings', () => {
          const wrapper = Wrap(<MyComponent val="foo" />);

          wrapper.find(ComponentWithRenderProp).renderProp('r')('foo');

          wrapper.find(ComponentWithRenderProp).renderProp('r')('');
        });

        it('works with numbers', () => {
          const wrapper = Wrap(<MyComponent val={42} />);

          wrapper.find(ComponentWithRenderProp).renderProp('r')(42);

          wrapper.find(ComponentWithRenderProp).renderProp('r')(0);

          wrapper.find(ComponentWithRenderProp).renderProp('r')(NaN);
        });

        it('works with null', () => {
          const wrapper = Wrap(<MyComponent val={null} />);

          wrapper.find(ComponentWithRenderProp).renderProp('r')(null);
        });

        // FIXME: figure out how to test this reliably
        it.skip('throws with undefined', () => {
          const wrapper = Wrap(<MyComponent val="" />);

          expect(() => wrapper.find(ComponentWithRenderProp).renderProp('r')(undefined)).to.throw();
        });

        it('works with arrays', () => {
          const wrapper = Wrap(<MyComponent val={[]} />);

          wrapper.find(ComponentWithRenderProp).renderProp('r')([]);

          wrapper.find(ComponentWithRenderProp).renderProp('r')(['a']);

          wrapper.find(ComponentWithRenderProp).renderProp('r')([Infinity]);
        });

        it('works with false', () => {
          const wrapper = Wrap(<MyComponent val={false} />);

          wrapper.find(ComponentWithRenderProp).renderProp('r')(false);
        });

        it('throws with true', () => {
          const wrapper = Wrap(<MyComponent val={false} />);

          expect(() => wrapper.find(ComponentWithRenderProp).renderProp('r')(true).Wrap()).to.throw();
        });
      });
    });
}
