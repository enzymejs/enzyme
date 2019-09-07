import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon-sandbox';
import {
  itIf,
} from '../../_helpers';
import {
  is,
} from '../../_helpers/version';

import {
  useEffect,
  useState,
} from '../../_helpers/react-compat';

export default function describeInvoke({
  Wrap,
  WrapperName,
  isShallow,
}) {
  describe('.invoke(propName)(..args)', () => {
    class CounterButton extends React.Component {
      constructor(props) {
        super(props);
        this.state = { count: 0 };
      }

      render() {
        const { count } = this.state;
        return (
          <div>
            <button
              type="button"
              onClick={() => this.setState(({ count: oldCount }) => ({ count: oldCount + 1 }))}
            >
              {count}
            </button>
          </div>
        );
      }
    }

    class ClickableLink extends React.Component {
      render() {
        const { onClick } = this.props;
        return (
          <div>
            <a onClick={onClick}>foo</a>
          </div>
        );
      }
    }

    it('throws when pointing to a non-function prop', () => {
      const wrapper = Wrap(<div data-a={{}} />);

      expect(() => wrapper.invoke('data-a')).to.throw(
        TypeError,
        `${WrapperName}::invoke() requires the name of a prop whose value is a function`,
      );

      expect(() => wrapper.invoke('does not exist')).to.throw(
        TypeError,
        `${WrapperName}::invoke() requires the name of a prop whose value is a function`,
      );
    });

    it('can update the state value', () => {
      const wrapper = Wrap(<CounterButton />);
      expect(wrapper.state('count')).to.equal(0);
      wrapper.find('button').invoke('onClick')();
      expect(wrapper.state('count')).to.equal(1);
    });

    it('can return the handlers’ return value', () => {
      const sentinel = {};
      const spy = sinon.stub().returns(sentinel);

      const wrapper = Wrap(<ClickableLink onClick={spy} />);

      const value = wrapper.find('a').invoke('onClick')();
      expect(value).to.equal(sentinel);
      expect(spy).to.have.property('callCount', 1);
    });

    it('can pass in arguments', () => {
      const spy = sinon.spy();

      const wrapper = Wrap(<ClickableLink onClick={spy} />);

      const a = {};
      const b = {};
      wrapper.find('a').invoke('onClick')(a, b);
      expect(spy).to.have.property('callCount', 1);
      const [[arg1, arg2]] = spy.args;
      expect(arg1).to.equal(a);
      expect(arg2).to.equal(b);
    });

    // TODO: enable when the shallow renderer fixes its bug
    itIf(!isShallow && is('>= 16.8'), 'works without explicit `act` wrapper', () => {
      function App() {
        const [counter, setCounter] = useState(0);
        const [result, setResult] = useState(0);
        useEffect(
          () => setResult(counter * 2),
          [counter],
        );
        return (
          <button type="button" onClick={() => setCounter((input) => input + 1)}>{result}</button>
        );
      }
      const wrapper = Wrap(<App />);

      const expected = ['0', '2', '4', '6'];

      const actual = [wrapper.find('button').text()]
        .concat(Array.from({ length: 3 }, () => {
          wrapper.find('button').invoke('onClick')();
          wrapper.update();

          return wrapper.find('button').text();
        }));
      expect(actual).to.eql(expected);
    });
  });
}
