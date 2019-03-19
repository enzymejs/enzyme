import React from 'react';
import { expect } from 'chai';

import {
  describeIf,
} from '../../_helpers';
import { is } from '../../_helpers/version';

export default function describeEquals({
  Wrap,
  WrapRendered,
}) {
  describe('.equals(node)', () => {
    it('allows matches on the root node', () => {
      const a = <div className="foo" />;
      const b = <div className="foo" />;
      const c = <div className="bar" />;

      expect(Wrap(a).equals(b)).to.equal(true);
      expect(Wrap(a).equals(c)).to.equal(false);
    });

    it('does NOT allow matches on a nested node', () => {
      const wrapper = Wrap((
        <div>
          <div className="foo" />
        </div>
      ));
      const b = <div className="foo" />;
      expect(wrapper.equals(b)).to.equal(false);
    });

    it('matches composite components', () => {
      class Foo extends React.Component {
        render() { return <div />; }
      }
      const wrapper = Wrap((
        <div>
          <Foo />
        </div>
      ));
      const b = <div><Foo /></div>;
      expect(wrapper.equals(b)).to.equal(true);
    });

    it('does not expand `node` content', () => {
      class Bar extends React.Component {
        render() { return <div />; }
      }

      class Foo extends React.Component {
        render() { return <Bar />; }
      }

      const wrapper = WrapRendered(<Foo />);
      expect(wrapper.equals(<Bar />)).to.equal(true);
      expect(wrapper.equals(<Foo />)).to.equal(false);
    });

    describeIf(is('> 0.13'), 'stateless function components (SFCs)', () => {
      it('matches composite SFCs', () => {
        const Foo = () => (
          <div />
        );

        const wrapper = Wrap((
          <div>
            <Foo />
          </div>
        ));
        const b = <div><Foo /></div>;
        expect(wrapper.equals(b)).to.equal(true);
      });

      it('does not expand `node` content', () => {
        const Bar = () => (
          <div />
        );

        const Foo = () => (
          <Bar />
        );

        const wrapper = WrapRendered(<Foo />);
        expect(wrapper.equals(<Bar />)).to.equal(true);
        expect(wrapper.equals(<Foo />)).to.equal(false);
      });
    });

    it('flattens arrays of children to compare', () => {
      class TwoChildren extends React.Component {
        render() {
          return (
            <div className="parent-component-class">
              <div key="a" className="asd" />
              <div key="b" className="fgh" />
            </div>
          );
        }
      }

      class TwoChildrenOneArrayed extends React.Component {
        render() {
          return (
            <div className="parent-component-class">
              <div key="a" className="asd" />
              {[<div key="b" className="fgh" />]}
            </div>
          );
        }
      }
      const twoChildren = WrapRendered(<TwoChildren />);
      const twoChildrenOneArrayed = WrapRendered(<TwoChildrenOneArrayed />);

      expect(twoChildren.equals(twoChildrenOneArrayed.getElement())).to.equal(true);
      expect(twoChildrenOneArrayed.equals(twoChildren.getElement())).to.equal(true);
    });
  });
}
