import React from 'react';
import { expect } from 'chai';

import {
  describeIf,
  itIf,
} from '../../_helpers';
import { is } from '../../_helpers/version';

export default function describeProp({
  Wrap,
  WrapRendered,
  isMount,
}) {
  describe('.prop(name)', () => {
    it('returns the prop value for [name]', () => {
      const fn = () => {};
      const wrapper = Wrap((
        <div id="fooId" className="bax" onClick={fn}>
          <div className="baz" />
          <div className="foo" />
        </div>
      ));

      expect(wrapper.prop('className')).to.equal('bax');
      expect(wrapper.prop('onClick')).to.equal(fn);
      expect(wrapper.prop('id')).to.equal('fooId');
    });

    it('is allowed to be used on an inner node', () => {
      const fn = () => {};
      const wrapper = Wrap((
        <div className="bax">
          <div className="baz" onClick={fn} />
          <div className="foo" id="fooId" />
        </div>
      ));

      expect(wrapper.find('.baz').prop('onClick')).to.equal(fn);
      expect(wrapper.find('.foo').prop('id')).to.equal('fooId');
    });

    class Foo extends React.Component {
      render() {
        const { bar, foo } = this.props;
        return (
          <div className={bar} id={foo} />
        );
      }
    }

    itIf(isMount, 'called on root should return props of root node', () => {
      const wrapper = Wrap(<Foo foo="hi" bar="bye" />);

      expect(wrapper.prop('foo')).to.equal('hi');
      expect(wrapper.prop('bar')).to.equal('bye');
      expect(wrapper.prop('className')).to.equal(undefined);
      expect(wrapper.prop('id')).to.equal(undefined);
    });

    it('returns prop value of root rendered node', () => {
      const wrapper = WrapRendered(<Foo foo="hi" bar="bye" />);

      expect(wrapper.prop('className')).to.equal('bye');
      expect(wrapper.prop('id')).to.equal('hi');
      expect(wrapper.prop('foo')).to.equal(undefined);
      expect(wrapper.prop('bar')).to.equal(undefined);
    });

    describeIf(is('> 0.13'), 'stateless function components (SFCs)', () => {
      const FooSFC = ({ bar, foo }) => (
        <div className={bar} id={foo} />
      );

      itIf(isMount, 'called on root should return props of root node', () => {
        const wrapper = Wrap(<FooSFC foo="hi" bar="bye" />);

        expect(wrapper.prop('foo')).to.equal('hi');
        expect(wrapper.prop('bar')).to.equal('bye');
        expect(wrapper.prop('className')).to.equal(undefined);
        expect(wrapper.prop('id')).to.equal(undefined);
      });

      it('returns props of root rendered node', () => {
        const wrapper = WrapRendered(<FooSFC foo="hi" bar="bye" />);

        expect(wrapper.prop('className')).to.equal('bye');
        expect(wrapper.prop('id')).to.equal('hi');
        expect(wrapper.prop('foo')).to.equal(undefined);
        expect(wrapper.prop('bar')).to.equal(undefined);
      });
    });
  });
}
