import React from 'react';
import { expect } from 'chai';

import {
  describeIf,
} from '../../_helpers';
import { is } from '../../_helpers/version';

import {
  memo,
  forwardRef,
} from '../../_helpers/react-compat';

export default function describeIs({
  Wrap,
  WrapRendered,
}) {
  describe('.is(selector)', () => {
    it('returns true when selector matches current element', () => {
      const wrapper = Wrap(<div className="foo bar baz" />);
      expect(wrapper.is('.foo')).to.equal(true);
    });

    it('allows for compound selectors', () => {
      const wrapper = Wrap(<div className="foo bar baz" />);
      expect(wrapper.is('.foo.bar')).to.equal(true);
    });

    it('ignores insignificant whitespace', () => {
      const className = `
      foo
      `;
      const wrapper = Wrap(<div className={className} />);
      expect(wrapper.is('.foo')).to.equal(true);
    });

    it('handles all significant whitespace', () => {
      const className = `foo

      bar
      baz`;
      const wrapper = Wrap(<div className={className} />);
      expect(wrapper.is('.foo.bar.baz')).to.equal(true);
    });

    it('returns false when selector does not match', () => {
      const wrapper = Wrap(<div className="bar baz" />);
      expect(wrapper.is('.foo')).to.equal(false);
    });

    class RendersDiv extends React.Component {
      render() {
        return <div />;
      }
    }
    const Memoized = memo && memo(RendersDiv);
    const ForwardRef = forwardRef && forwardRef(() => <RendersDiv />);
    const MemoForwardRef = memo && memo(() => <ForwardRef />);

    class RendersChildren extends React.Component {
      render() {
        const { children } = this.props;
        return children;
      }
    }

    it('recognizes nonmemoized', () => {
      const wrapper = WrapRendered(<RendersChildren><RendersDiv /></RendersChildren>);
      expect(wrapper.is(RendersDiv)).to.equal(true);
    });

    describeIf(is('>= 16.3'), 'forwardRef', () => {
      it('recognizes forwardRef', () => {
        const wrapper = WrapRendered(<RendersChildren><ForwardRef /></RendersChildren>);
        expect(wrapper.is(ForwardRef)).to.equal(true);
      });
    });

    describeIf(is('>= 16.6'), 'React.memo', () => {
      it('recognizes memoized and inner', () => {
        const wrapper = WrapRendered(<RendersChildren><Memoized /></RendersChildren>);
        expect(wrapper.is(Memoized)).to.equal(true);
        // expect(wrapper.is(RendersDiv)).to.equal(true);
      });

      it('recognizes memoized forwardRef and inner', () => {
        const wrapper = WrapRendered(<RendersChildren><MemoForwardRef /></RendersChildren>);
        expect(wrapper.is(MemoForwardRef)).to.equal(true);
      });
    });
  });
}
