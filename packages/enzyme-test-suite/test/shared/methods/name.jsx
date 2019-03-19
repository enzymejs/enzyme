import React from 'react';
import { expect } from 'chai';
import wrap from 'mocha-wrap';
import sinon from 'sinon-sandbox';

import getAdapter from 'enzyme/build/getAdapter';

import {
  describeIf,
} from '../../_helpers';
import { is } from '../../_helpers/version';

import {
  createClass,
} from '../../_helpers/react-compat';

export default function describeName({
  Wrap,
  WrapRendered,
}) {
  wrap()
    .withOverride(() => getAdapter(), 'displayNameOfNode', () => undefined)
    .describe('.name()', () => {
      describe('node with displayName', () => {
        it('returns the displayName of the node', () => {
          class Foo extends React.Component {
            render() { return <div />; }
          }

          class FooWrapper extends React.Component {
            render() { return <Foo />; }
          }

          Foo.displayName = 'CustomWrapper';

          const wrapper = WrapRendered(<FooWrapper />);
          expect(wrapper.name()).to.equal('CustomWrapper');
        });

        describeIf(is('> 0.13'), 'stateless function components (SFCs)', () => {
          it('returns the name of the node', () => {
            function SFC() {
              return <div />;
            }
            const SFCWrapper = () => <SFC />;

            SFC.displayName = 'CustomWrapper';

            const wrapper = WrapRendered(<SFCWrapper />);
            expect(wrapper.name()).to.equal('CustomWrapper');
          });
        });

        describe('createClass', () => {
          it('returns the name of the node', () => {
            const Foo = createClass({
              displayName: 'CustomWrapper',
              render() {
                return <div />;
              },
            });
            const FooWrapper = createClass({
              render() {
                return <Foo />;
              },
            });

            const wrapper = WrapRendered(<FooWrapper />);
            expect(wrapper.name()).to.equal('CustomWrapper');
          });
        });

        wrap()
          .withOverride(() => getAdapter(), 'displayNameOfNode', () => sinon.stub())
          .describe('adapter has `displayNameOfNode`', () => {
            it('delegates to the adapter’s `displayNameOfNode`', () => {
              class Foo extends React.Component {
                render() { return <div />; }
              }
              const stub = getAdapter().displayNameOfNode;
              const sentinel = {};
              stub.returns(sentinel);

              const wrapper = Wrap(<Foo />);

              expect(wrapper.name()).to.equal(sentinel);

              expect(stub).to.have.property('callCount', 1);
              const { args } = stub.firstCall;
              expect(args).to.eql([wrapper.getNodeInternal()]);
            });
          });
      });

      describe('node without displayName', () => {
        it('returns the name of the node', () => {
          class Foo extends React.Component {
            render() { return <div />; }
          }

          class FooWrapper extends React.Component {
            render() { return <Foo />; }
          }

          const wrapper = WrapRendered(<FooWrapper />);
          expect(wrapper.name()).to.equal('Foo');
        });

        describeIf(is('> 0.13'), 'stateless function components (SFCs)', () => {
          it('returns the name of the node', () => {
            function SFC() {
              return <div />;
            }
            const SFCWrapper = () => <SFC />;

            const wrapper = WrapRendered(<SFCWrapper />);
            expect(wrapper.name()).to.equal('SFC');
          });
        });
      });

      describe('DOM node', () => {
        it('returns the name of the node', () => {
          const wrapper = Wrap(<div />);
          expect(wrapper.name()).to.equal('div');
        });
      });
    });
}
