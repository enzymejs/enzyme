import React from 'react';
import { expect } from 'chai';

import {
  describeIf,
  itIf,
} from '../../_helpers';

import {
  useState,
  useEffect,
  Fragment,
} from '../../_helpers/react-compat';

export default function describeUseState({
  hasHooks,
  Wrap,
  isShallow,
}) {
  describeIf(hasHooks, 'hooks: useState', () => {
    function FooCounter({ initialCount: initial = 0 }) {
      const [count, setCount] = useState(+initial);

      return (
        <Fragment>
          <button className="increment" type="button" onClick={() => setCount(count + 1)}>-</button>
          <span className="counter">
            {count}
          </span>
          <button className="decrement" type="button" onClick={() => setCount(count - 1)}>+</button>
        </Fragment>
      );
    }

    const initialCount = 5;

    it('initial render', () => {
      const wrapper = Wrap(<FooCounter initialCount={initialCount} />);
      expect(wrapper.find('.counter').text()).to.equal(String(initialCount));
    });

    it('lets increment', () => {
      const wrapper = Wrap(<FooCounter initialCount={initialCount} />);

      wrapper.find('.increment').props().onClick();

      expect(wrapper.find('.counter').text()).to.equal(String(initialCount + 1));
    });

    it('now decrement', () => {
      const wrapper = Wrap(<FooCounter initialCount={initialCount} />);

      wrapper.find('.decrement').props().onClick();

      expect(wrapper.find('.counter').text()).to.equal(String(initialCount - 1));
    });

    it('handles useState', () => {
      function ComponentUsingStateHook() {
        const [count] = useState(0);
        return <div>{count}</div>;
      }

      const wrapper = Wrap(<ComponentUsingStateHook />);

      expect(wrapper.find('div').length).to.equal(1);
      expect(wrapper.find('div').text()).to.equal('0');
    });

    it('handles setState returned from useState', () => {
      function ComponentUsingStateHook() {
        const [count, setCount] = useState(0);
        return <div onClick={() => setCount(count + 1)}>{count}</div>;
      }

      const wrapper = Wrap(<ComponentUsingStateHook />);
      const div = wrapper.find('div');
      const setCount = div.prop('onClick');
      setCount();
      wrapper.update();

      expect(wrapper.find('div').text()).to.equal('1');
    });

    describe('useState with willReceive prop effect / simulate getDerivedStateFromProp', () => {
      const newPropCount = 10;

      function FooCounterWithEffect({ initialCount: initial = 0 }) {
        const [count, setCount] = useState(+initial);

        useEffect(() => {
          setCount(initial);
        }, [initial]);

        return (
          <Fragment>
            <span className="counter">
              {count}
            </span>
          </Fragment>
        );
      }

      // TODO: fixme when useEffect works in the shallow renderer, see https://github.com/facebook/react/issues/15275
      itIf(!isShallow, 'initial render & new Props', () => {
        const wrapper = Wrap(<FooCounterWithEffect initialCount={initialCount} />);
        expect(wrapper.find('.counter').text()).to.equal(String(initialCount));

        wrapper.setProps({ initialCount: newPropCount });
        expect(wrapper.find('.counter').text()).to.equal(String(newPropCount));
      });
    });
  });
}
