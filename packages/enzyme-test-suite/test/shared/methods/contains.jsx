import React from 'react';
import { expect } from 'chai';

import {
  describeIf,
  itIf,
} from '../../_helpers';
import { is } from '../../_helpers/version';

export default function describeContains({
  Wrap,
  WrapperName,
  isMount,
}) {
  describe('.contains(node)', () => {
    it('allows matches on the root node', () => {
      const a = <div className="foo" />;
      const b = <div className="foo" />;
      const c = <div className="bar" />;
      const wrapper = Wrap(a);
      expect(wrapper.contains(b)).to.equal(true);
      expect(wrapper.contains(c)).to.equal(false);
    });

    it('allows matches on a nested node', () => {
      const wrapper = Wrap((
        <div>
          <div className="foo" />
        </div>
      ));
      const b = <div className="foo" />;
      expect(wrapper.contains(b)).to.equal(true);
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
      const b = <Foo />;
      expect(wrapper.contains(b)).to.equal(true);
    });

    it('works with strings', () => {
      const wrapper = Wrap(<div>foo</div>);

      expect(wrapper.contains('foo')).to.equal(true);
      expect(wrapper.contains('bar')).to.equal(false);
    });

    it('works with numbers', () => {
      const wrapper = Wrap(<div>{1}</div>);

      expect(wrapper.contains(1)).to.equal(true);
      expect(wrapper.contains(2)).to.equal(false);
      expect(wrapper.contains('1')).to.equal(false);
    });

    it('works with nested strings & numbers', () => {
      const wrapper = Wrap((
        <div>
          <div>
            <div>{5}</div>
          </div>
          <div>foo</div>
        </div>
      ));

      expect(wrapper.contains('foo')).to.equal(true);
      expect(wrapper.contains(<div>foo</div>)).to.equal(true);

      expect(wrapper.contains(5)).to.equal(true);
      expect(wrapper.contains(<div>{5}</div>)).to.equal(true);
    });

    it('does something with arrays of nodes', () => {
      const wrapper = Wrap((
        <div>
          <span>Hello</span>
          <div>Goodbye</div>
          <span>More</span>
        </div>
      ));
      const fails = [
        <span>wrong</span>,
        <div>Goodbye</div>,
      ];

      const passes1 = [
        <span>Hello</span>,
        <div>Goodbye</div>,
      ];
      const passes2 = [
        <div>Goodbye</div>,
        <span>More</span>,
      ];

      expect(wrapper.contains(fails)).to.equal(false);
      expect(wrapper.contains(passes1)).to.equal(true);
      expect(wrapper.contains(passes2)).to.equal(true);
    });

    // FIXME: fix on mount
    itIf(!isMount, 'throws on invalid argument', () => {
      const wrapper = Wrap(<div />);

      expect(() => wrapper.contains({})).to.throw(
        Error,
        `${WrapperName}::contains() can only be called with a ReactElement (or an array of them), a string, or a number as an argument.`,
      );
      expect(() => wrapper.contains(() => ({}))).to.throw(
        Error,
        `${WrapperName}::contains() can only be called with a ReactElement (or an array of them), a string, or a number as an argument.`,
      );
    });

    describeIf(is('> 0.13'), 'stateless function components (SFCs)', () => {
      it('matches composite components', () => {
        function Foo() {
          return <div />;
        }

        const wrapper = Wrap((
          <div>
            <Foo />
          </div>
        ));
        const b = <Foo />;
        expect(wrapper.contains(b)).to.equal(true);
      });

      it('matches composite components if rendered by function', () => {
        function Foo() {
          return <div />;
        }
        const renderStatelessComponent = () => <Foo />;
        const wrapper = Wrap((
          <div>
            {renderStatelessComponent()}
          </div>
        ));
        const b = <Foo />;
        expect(wrapper.contains(b)).to.equal(true);
      });
    });
  });
}
