import React from 'react';
import { expect } from 'chai';

import {
  describeIf,
} from '../../_helpers';

import {
  useRef,
} from '../../_helpers/react-compat';

export default function describeUseRef({
  hasHooks,
  Wrap,
}) {
  describeIf(hasHooks, 'hooks: useRef', () => {
    function ComponentUsingRef() {
      const id = useRef(Math.floor(100 * Math.random()));
      return (
        <div>{id.current}</div>
      );
    }

    it('`current` should be the same between two renders', () => {
      const wrapper = Wrap(<ComponentUsingRef />);

      const childBefore = wrapper.find('div').prop('children');
      wrapper.setProps({ foo: 'bar' });
      const childAfter = wrapper.find('div').prop('children');

      expect(childBefore).to.equal(childAfter);
    });
  });
}
