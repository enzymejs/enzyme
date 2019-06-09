import React from 'react';
import { expect } from 'chai';

import {
  describeIf,
  itIf,
} from '../../_helpers';

import {
  useEffect,
  useState,
} from '../../_helpers/react-compat';

export default function describeUseEffect({
  hasHooks,
  Wrap,
  isShallow,
}) {
  describeIf(hasHooks, 'hooks: useEffect', () => {
    const timeout = 100;
    function ComponentUsingEffectHook() {
      const [ctr, setCtr] = useState(0);
      useEffect(() => {
        setCtr(1);
        setTimeout(() => {
          setCtr(2);
        }, timeout);
      }, []);
      return (
        <div>
          {ctr}
        </div>
      );
    }

    // TODO: enable when the shallow renderer fixes its bug
    itIf(!isShallow, 'works with `useEffect`', (done) => {
      const wrapper = Wrap(<ComponentUsingEffectHook />);

      expect(wrapper.debug()).to.equal(
        isShallow
          ? `<div>
  1
</div>`
          : `<ComponentUsingEffectHook>
  <div>
    1
  </div>
</ComponentUsingEffectHook>`,
      );

      setTimeout(() => {
        wrapper.update();
        expect(wrapper.debug()).to.equal(
          isShallow
            ? `<div>
  2
</div>`
            : `<ComponentUsingEffectHook>
  <div>
    2
  </div>
</ComponentUsingEffectHook>`,
        );
        done();
      }, timeout + 1);
    });
  });
}
