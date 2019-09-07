import React from 'react';
import { expect } from 'chai';

import {
  describeIf,
  itIf,
} from '../../_helpers';

import {
  useCallback,
} from '../../_helpers/react-compat';

export default function describeUseCallback({
  hasHooks,
  Wrap,
  isShallow,
}) {
  describeIf(hasHooks, 'hooks: useCallback', () => {
    function RendersNull() {
      return null;
    }

    function ComponentUsingCallbackHook({ onChange }) {
      const callback = useCallback((value) => onChange(value), [onChange]);
      return (
        <RendersNull callback={callback} />
      );
    }

    function ComponentUsingCallbackHookWithRelatedProp({ onChange, relatedProp }) {
      const callback = useCallback((value) => onChange(value), [onChange, relatedProp]);
      return (
        <RendersNull callback={callback} />
      );
    }

    // TODO: fix pending https://github.com/facebook/react/issues/15774
    itIf(!isShallow, 'get same callback when using `useCallback` and rerender with same prop in dependencies', () => {
      const onChange = () => {};
      const wrapper = Wrap(<ComponentUsingCallbackHook onChange={onChange} />);
      const initialCallback = wrapper.find(RendersNull).prop('callback');

      wrapper.setProps({ unRelatedProp: '123' });

      const nextCallback = wrapper.find(RendersNull).prop('callback');
      expect(initialCallback).to.equal(nextCallback);
    });

    it('get different callback when using `useCallback` and rerender with different prop in dependencies', () => {
      const onChange = () => {};
      const wrapper = Wrap(<ComponentUsingCallbackHookWithRelatedProp onChange={onChange} relatedProp="456" />);
      const initialCallback = wrapper.find(RendersNull).prop('callback');

      wrapper.setProps({ relatedProp: '123' });

      const nextCallback = wrapper.find(RendersNull).prop('callback');
      expect(initialCallback).not.to.equal(nextCallback);
    });
  });
}
