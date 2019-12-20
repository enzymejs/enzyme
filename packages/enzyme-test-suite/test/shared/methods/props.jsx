import React from 'react';
import { expect } from 'chai';

import {
  delay,
  describeIf,
  itIf,
} from '../../_helpers';
import sloppyReturnThis from '../../_helpers/untranspiledSloppyReturnThis';
import { is } from '../../_helpers/version';

export default function describeProps({
  Wrap,
  WrapRendered,
  isMount,
}) {
  describe('.props()', () => {
    it('returns the props object', () => {
      const fn = () => ({});
      const wrapper = Wrap((
        <div id="fooId" className="bax" onClick={fn}>
          <div className="baz" />
          <div className="foo" />
        </div>
      ));

      expect(wrapper.props().className).to.equal('bax');
      expect(wrapper.props().onClick).to.equal(fn);
      expect(wrapper.props().id).to.equal('fooId');
    });

    it('is allowed to be used on an inner node', () => {
      const fn = () => ({});
      const wrapper = Wrap((
        <div className="bax">
          <div className="baz" onClick={fn} />
          <div className="foo" id="fooId" />
        </div>
      ));

      expect(wrapper.find('.baz').props().onClick).to.equal(fn);
      expect(wrapper.find('.foo').props().id).to.equal('fooId');
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

      expect(wrapper.props()).to.eql({ bar: 'bye', foo: 'hi' });
    });

    it('returns props of root rendered node', () => {
      const wrapper = WrapRendered(<Foo foo="hi" bar="bye" />);

      expect(wrapper.props()).to.eql({ className: 'bye', id: 'hi' });
    });

    describeIf(is('> 0.13'), 'stateless function components (SFCs)', () => {
      const FooSFC = ({ bar, foo }) => (
        <div className={bar} id={foo} />
      );

      itIf(isMount, 'called on root should return props of root node', () => {
        const wrapper = Wrap(<FooSFC foo="hi" bar="bye" />);

        expect(wrapper.props()).to.eql({ bar: 'bye', foo: 'hi' });
      });

      it('returns props of root rendered node', () => {
        const wrapper = WrapRendered(<FooSFC foo="hi" bar="bye" />);

        expect(wrapper.props()).to.eql({ className: 'bye', id: 'hi' });
      });

      const SloppyReceiver = sloppyReturnThis((
        receiver,
        props = { NO_PROPS: true },
        context,
      ) => (
        <div
          data-is-global={receiver === global}
          data-is-undefined={typeof receiver === 'undefined'}
          {...props}
          {...context}
        />
      ));

      const StrictReceiver = function SFC(
        props = { NO_PROPS: true },
        context,
      ) {
        return (
          <div
            data-is-global={this === global}
            data-is-undefined={typeof this === 'undefined'}
            {...props}
            {...context}
          />
        );
      };

      it('does not provide a `this` to a sloppy-mode SFC', () => {
        const wrapper = WrapRendered(<SloppyReceiver />);
        expect(wrapper.props()).to.be.an('object').that.has.all.keys({
          'data-is-global': true,
          'data-is-undefined': false,
        });
      });

      it('does not provide a `this` to a strict-mode SFC', () => {
        const wrapper = WrapRendered(<StrictReceiver />);
        expect(wrapper.props()).to.be.an('object').that.has.all.keys({
          'data-is-global': false,
          'data-is-undefined': true,
        });
      });
    });

    describe('props in async handler', () => {
      class TestComponent extends React.Component {
        constructor(props) {
          super(props);
          this.state = { counter: 1 };
          this.handleClick = this.handleClick.bind(this);
        }

        handleClick() {
          return delay(100).then(() => new Promise((resolve) => {
            this.setState({ counter: 2 }, () => {
              resolve();
            });
          }));
        }

        render() {
          const { counter } = this.state;
          return (
            <div id="parentDiv" onClick={this.handleClick}>
              <TestSubComponent id="childDiv" counter={counter} />
            </div>
          );
        }
      }

      class TestSubComponent extends React.Component {
        render() {
          const { counter } = this.props;
          return <div>{counter}</div>;
        }
      }

      it('child component props should update after call to setState in async handler', () => {
        const wrapper = Wrap(<TestComponent />);
        expect(wrapper.find(TestSubComponent).props()).to.eql({ id: 'childDiv', counter: 1 });
        const promise = wrapper.find('#parentDiv').props().onClick();
        expect(wrapper.find(TestSubComponent).props()).to.eql({ id: 'childDiv', counter: 1 });
        return promise.then(() => {
          wrapper.update();
          expect(wrapper.find(TestSubComponent).props()).to.eql({ id: 'childDiv', counter: 2 });
        });
      });
    });
  });
}
