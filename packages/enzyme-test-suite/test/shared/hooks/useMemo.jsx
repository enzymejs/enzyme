import React from 'react';
import { expect } from 'chai';

import {
  describeIf,
} from '../../_helpers';

import {
  useMemo,
} from '../../_helpers/react-compat';

export default function describeUseMemo({
  hasHooks,
  Wrap,
}) {
  describeIf(hasHooks, 'hooks: useMemo', () => {
    function RendersNull() {
      return null;
    }

    it('get same value when using `useMemo` and rerender with same prop in dependencies', () => {
      function ComponentUsingMemoHook(props) {
        const { count } = props;
        const memoized = useMemo(() => ({ result: count * 2 }), [count]);
        return (
          <RendersNull memoized={memoized} />
        );
      }
      const wrapper = Wrap(<ComponentUsingMemoHook count={1} />);
      const initialValue = wrapper.find(RendersNull).prop('memoized');
      wrapper.setProps({ unRelatedProp: '123' });
      const nextValue = wrapper.find(RendersNull).prop('memoized');
      expect(initialValue).to.equal(nextValue);
    });

    it('get different value when using `useMemo` and rerender with different prop in dependencies', () => {
      function ComponentUsingMemoHook(props) {
        const { count, relatedProp } = props;
        const memoized = useMemo(() => ({ result: count * 2 }), [count, relatedProp]);
        return (
          <RendersNull memoized={memoized} relatedProp={relatedProp} />
        );
      }
      const wrapper = Wrap(<ComponentUsingMemoHook relatedProp="456" count={1} />);
      const initialValue = wrapper.find(RendersNull).prop('memoized');
      wrapper.setProps({ relatedProp: '123' });
      const nextValue = wrapper.find(RendersNull).prop('memoized');
      expect(initialValue).not.to.equal(nextValue);
    });
  });
}
