import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon-sandbox';

import {
  describeIf,
} from '../../_helpers';

import {
  useEffect,
  useState,
} from '../../_helpers/react-compat';

export default function describeCustomHooks({
  hasHooks,
  Wrap,
  isShallow,
}) {
  describeIf(hasHooks, 'hooks: custom', () => {
    describe('custom hook : useCounter', () => {
      function useCounter({ initialCount = 0, step = 1 } = {}) {
        const [count, setCount] = useState(initialCount);
        const increment = () => setCount((c) => c + step);
        const decrement = () => setCount((c) => c - step);
        return { count, increment, decrement };
      }
      // testing custom hooks with renderProps
      // may be we can think of adding in utils
      // will be repeated
      const Counter = ({ children, ...rest }) => children(useCounter(rest));

      function setup(props) {
        const returnVal = {};
        Wrap(
          <Counter {...props}>
            {(val) => {
              Object.assign(returnVal, val);
              return null;
            }}
          </Counter>,
        );
        return returnVal;
      }

      it('useCounter', () => {
        const counterData = setup();
        counterData.increment();
        expect(counterData).to.have.property('count', 1);
        counterData.decrement();
        expect(counterData).to.have.property('count', 0);
      });

      it('useCounter with initialCount', () => {
        const counterData = setup({ initialCount: 2 });
        counterData.increment();
        expect(counterData).to.have.property('count', 3);
        counterData.decrement();
        expect(counterData).to.have.property('count', 2);
      });

      it('useCounter with step', () => {
        const counterData = setup({ step: 2 });
        counterData.increment();
        expect(counterData).to.have.property('count', 2);
        counterData.decrement();
        expect(counterData).to.have.property('count', 0);
      });

      it('useCounter with step and initialCount', () => {
        const counterData = setup({ step: 2, initialCount: 5 });
        counterData.increment();
        expect(counterData).to.have.property('count', 7);
        counterData.decrement();
        expect(counterData).to.have.property('count', 5);
      });
    });

    // todo: enable shallow when useEffect works in the shallow renderer. see https://github.com/facebook/react/issues/15275
    describeIf(!isShallow, 'custom hook: formInput invoke props', () => {
      function useFormInput(initialValue = '') {
        const [value, setValue] = useState(initialValue);

        return {
          value,
          onChange(e) {
            setValue(e.target.value);
          },
        };
      }

      function Input(props) {
        return (
          <div>
            <input {...props} />
          </div>
        );
      }

      function ControlledInputWithEnhancedInput({ searchSomething }) {
        const search = useFormInput();

        useEffect(
          () => {
            searchSomething(search.value);
          },
          [search.value],
        );

        return <Input {...search} />;
      }

      function ControlledInputWithNativeInput({ searchSomething }) {
        const search = useFormInput();

        useEffect(
          () => {
            searchSomething(search.value);
          },
          [search.value],
        );

        return <input {...search} />;
      }

      it('work with native input', () => {
        const spy = sinon.spy();
        const wrapper = Wrap(<ControlledInputWithNativeInput searchSomething={spy} />);
        wrapper.find('input').invoke('onChange')({ target: { value: 'foo' } });

        expect(spy.withArgs('foo')).to.have.property('callCount', 1);
      });

      it('work with custom wrapped Input', () => {
        const spy = sinon.spy();
        const wrapper = Wrap(<ControlledInputWithEnhancedInput searchSomething={spy} />);
        const input = wrapper.find('Input');
        input.invoke('onChange')({ target: { value: 'foo' } });
        expect(spy.withArgs('foo')).to.have.property('callCount', 1);
      });

      it('work with custom wrapped input', () => {
        const spy = sinon.spy();
        const wrapper = Wrap(<ControlledInputWithEnhancedInput searchSomething={spy} />);
        const input = wrapper.find('input');
        input.invoke('onChange')({ target: { value: 'foo' } });
        expect(spy.withArgs('foo')).to.have.property('callCount', 1);
      });
    });
  });
}
