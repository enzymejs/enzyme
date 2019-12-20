import React from 'react';
import { expect } from 'chai';

import {
  describeIf,
  itIf,
} from '../../_helpers';
import { is } from '../../_helpers/version';

export default function describeHasClass({
  Wrap,
  WrapRendered,
  isShallow,
  isMount,
}) {
  describe('.hasClass(className)', () => {
    function FooSFC() {
      return <div className="foo bar baz some-long-string FoOo" />;
    }
    class Foo extends React.Component {
      render() {
        return FooSFC();
      }
    }
    class Bar extends React.Component {
      render() {
        return <Foo className="isFoo" />;
      }
    }
    class RendersNull extends React.Component {
      render() {
        return null;
      }
    }

    context('when using a DOM component', () => {
      it('returns whether or not node has a certain class', () => {
        const wrapper = Wrap(<div className="foo bar baz some-long-string FoOo" />);

        expect(wrapper.hasClass('foo')).to.equal(true);
        expect(wrapper.hasClass('bar')).to.equal(true);
        expect(wrapper.hasClass('baz')).to.equal(true);
        expect(wrapper.hasClass('some-long-string')).to.equal(true);
        expect(wrapper.hasClass('FoOo')).to.equal(true);
        expect(wrapper.hasClass('doesnt-exist')).to.equal(false);
      });
    });

    describeIf(is('> 0.13'), 'with stateless function components (SFCs)', () => {
      it('returns whether or not rendered node has a certain class', () => {
        const wrapper = WrapRendered(<FooSFC className="root" />);

        expect(wrapper.hasClass('root')).to.equal(false);
        expect(wrapper.hasClass('foo')).to.equal(true);
        expect(wrapper.hasClass('bar')).to.equal(true);
        expect(wrapper.hasClass('baz')).to.equal(true);
        expect(wrapper.hasClass('some-long-string')).to.equal(true);
        expect(wrapper.hasClass('FoOo')).to.equal(true);
        expect(wrapper.hasClass('doesnt-exist')).to.equal(false);
      });

      itIf(isMount, 'returns whether or not root node has a certain class', () => {
        const wrapper = Wrap(<FooSFC className="root" />);

        expect(wrapper.hasClass('root')).to.equal(true);
        expect(wrapper.hasClass('foo')).to.equal(false);
        expect(wrapper.hasClass('bar')).to.equal(false);
        expect(wrapper.hasClass('baz')).to.equal(false);
        expect(wrapper.hasClass('some-long-string')).to.equal(false);
        expect(wrapper.hasClass('FoOo')).to.equal(false);
        expect(wrapper.hasClass('doesnt-exist')).to.equal(false);
      });
    });

    context('when using a Composite class component', () => {
      it('returns whether or not rendered node has a certain class', () => {
        const wrapper = WrapRendered(<Foo className="root" />);

        expect(wrapper.hasClass('root')).to.equal(false);
        expect(wrapper.hasClass('foo')).to.equal(true);
        expect(wrapper.hasClass('bar')).to.equal(true);
        expect(wrapper.hasClass('baz')).to.equal(true);
        expect(wrapper.hasClass('some-long-string')).to.equal(true);
        expect(wrapper.hasClass('FoOo')).to.equal(true);
        expect(wrapper.hasClass('doesnt-exist')).to.equal(false);
      });

      itIf(isMount, 'returns whether or not root node has a certain class', () => {
        const wrapper = Wrap(<Foo className="root" />);

        expect(wrapper.hasClass('root')).to.equal(true);
        expect(wrapper.hasClass('foo')).to.equal(false);
        expect(wrapper.hasClass('bar')).to.equal(false);
        expect(wrapper.hasClass('baz')).to.equal(false);
        expect(wrapper.hasClass('some-long-string')).to.equal(false);
        expect(wrapper.hasClass('FoOo')).to.equal(false);
        expect(wrapper.hasClass('doesnt-exist')).to.equal(false);
      });
    });

    context('when using nested composite components', () => {
      it('returns whether or not node has a certain class', () => {
        const wrapper = WrapRendered(<Bar className="root" />);

        expect(wrapper.hasClass('root')).to.equal(false);
        expect(wrapper.hasClass('isFoo')).to.equal(true);
      });

      itIf(!isShallow, 'returns whether or not nested node has a certain class', () => {
        const wrapper = WrapRendered(<Bar className="root" />);

        expect(wrapper.hasClass('root')).to.equal(false);
        expect(wrapper.hasClass('isFoo')).to.equal(true);

        expect(wrapper.children().hasClass('foo')).to.equal(true);
        expect(wrapper.children().hasClass('bar')).to.equal(true);
        expect(wrapper.children().hasClass('baz')).to.equal(true);
        expect(wrapper.children().hasClass('some-long-string')).to.equal(true);
        expect(wrapper.children().hasClass('FoOo')).to.equal(true);
        expect(wrapper.children().hasClass('doesnt-exist')).to.equal(false);
      });

      itIf(isMount, 'returns whether or not root node has a certain class', () => {
        const wrapper = Wrap(<Bar className="root" />);

        expect(wrapper.hasClass('root')).to.equal(true);
        expect(wrapper.hasClass('foo')).to.equal(false);
        expect(wrapper.hasClass('bar')).to.equal(false);
        expect(wrapper.hasClass('baz')).to.equal(false);
        expect(wrapper.hasClass('some-long-string')).to.equal(false);
        expect(wrapper.hasClass('FoOo')).to.equal(false);
        expect(wrapper.hasClass('doesnt-exist')).to.equal(false);
      });
    });

    context('when using a Composite component that renders null', () => {
      it('returns whether or not node has a certain class', () => {
        const wrapper = Wrap(<RendersNull />);

        expect(wrapper.hasClass('foo')).to.equal(false);
      });
    });

    it('works with a non-string `className` prop', () => {
      class SpreadsProps extends React.Component {
        render() {
          return <div {...this.props} />;
        }
      }
      const obj = { classA: true, classB: false };
      const wrapper = Wrap(<SpreadsProps className={obj} />);
      expect(wrapper.hasClass('foo')).to.equal(false);
      expect(wrapper.hasClass('classA')).to.equal(false);
      expect(wrapper.hasClass('classB')).to.equal(false);
      expect(wrapper.hasClass(String(obj))).to.equal(true);
    });

    it('allows hyphens', () => {
      const wrapper = Wrap(<div className="foo-bar" />);
      expect(wrapper.hasClass('foo-bar')).to.equal(true);
    });

    it('works if className has a function in toString property', () => {
      function classes() {}
      classes.toString = () => 'foo-bar';
      const wrapper = Wrap(<div className={classes} />);
      expect(wrapper.hasClass('foo-bar')).to.equal(true);
    });

    it('works if searching with a RegExp', () => {
      const wrapper = Wrap(<div className="ComponentName-classname-123" />);
      expect(wrapper.hasClass(/(ComponentName)-(classname)-(\d+)/)).to.equal(true);
      expect(wrapper.hasClass(/(ComponentName)-(other)-(\d+)/)).to.equal(false);
    });
  });
}
