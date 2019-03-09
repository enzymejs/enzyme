import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon-sandbox';

export default function describeInvoke({
  Wrap,
  WrapperName,
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
  });
}
