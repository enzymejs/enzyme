import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon-sandbox';

import {
  describeIf,
  itIf,
} from '../../_helpers';
import {
  is,
  REACT16,
} from '../../_helpers/version';

import {
  memo,
  useEffect,
  useState,
} from '../../_helpers/react-compat';

export default function describeSimulate({
  Wrap,
  WrapperName,
  isShallow,
  isMount,
}) {
  // The shallow renderer in react 16 does not yet support batched updates. When it does,
  // we should be able to go un-skip all of the tests that are skipped with this flag.
  // FIXME: fix this
  const BATCHING = !isShallow || !REACT16;

  describe('.simulate(eventName, data)', () => {
    it('simulates events', () => {
      class ClickCounter extends React.Component {
        constructor(props) {
          super(props);
          this.state = { count: 0 };
          this.incrementCount = this.incrementCount.bind(this);
        }

        incrementCount() {
          this.setState(({ count }) => ({ count: count + 1 }));
        }

        render() {
          const { count } = this.state;
          return (
            <a
              data-count={count}
              onClick={this.incrementCount}
            >
              foo
            </a>
          );
        }
      }

      const wrapper = Wrap(<ClickCounter />);

      expect(wrapper.find('a').prop('data-count')).to.have.equal(0);
      wrapper.simulate('click');
      expect(wrapper.find('a').prop('data-count')).to.have.equal(1);
    });

    itIf(!isShallow, 'throws a descriptive error for invalid events', () => {
      const wrapper = Wrap(<div>foo</div>);
      expect(() => wrapper.simulate('invalidEvent')).to.throw(
        TypeError,
        `${WrapperName}::simulate() event 'invalidEvent' does not exist`,
      );
    });

    // FIXME: figure out why this hangs forever
    itIf(!isMount, 'passes in event data', () => {
      const spy = sinon.spy();
      class Clicker extends React.Component {
        render() {
          return (<a onClick={spy}>foo</a>);
        }
      }

      const wrapper = Wrap(<Clicker />);
      const a = {};
      const b = {};

      wrapper.simulate('click', a, b);
      expect(spy).to.have.property('callCount', 1);
      expect(spy.args[0][0]).to.equal(a);
      if (!isMount) {
        expect(spy.args[0][1]).to.equal(b);
      }
    });

    describeIf(is('> 0.13'), 'stateless function components (SFCs)', () => {
      const ClickerSFC = ({ onClick }) => (<a onClick={onClick}>foo</a>);

      it('simulates events', () => {
        const spy = sinon.spy();
        const wrapper = Wrap(<ClickerSFC onClick={spy} />);

        expect(spy).to.have.property('callCount', 0);
        wrapper.find('a').simulate('click');
        expect(spy).to.have.property('callCount', 1);
      });

      // FIXME: figure out why this hangs forever
      itIf(!isMount, 'passes in event data', () => {
        const spy = sinon.spy();
        const wrapper = Wrap(<ClickerSFC onClick={spy} />);
        const a = {};
        const b = {};

        wrapper.simulate('click', a, b);
        expect(spy).to.have.property('callCount', 1);
        expect(spy.args[0][0]).to.equal(a);
        if (!isMount) {
          expect(spy.args[0][1]).to.equal(b);
        }
      });
    });

    describe('Normalizing JS event names', () => {
      it('converts lowercase events to React camelcase', () => {
        const spy = sinon.spy();
        const clickSpy = sinon.spy();
        class Clicks extends React.Component {
          render() {
            return (<a onClick={clickSpy} onDoubleClick={spy}>foo</a>);
          }
        }

        const wrapper = Wrap(<Clicks />);

        wrapper.simulate('dblclick');
        expect(spy).to.have.property('callCount', 1);

        wrapper.simulate('click');
        expect(clickSpy).to.have.property('callCount', 1);
      });

      describeIf(is('> 0.13'), 'normalizing mouseenter', () => {
        it('converts lowercase events to React camelcase', () => {
          const spy = sinon.spy();
          class Mousetrap extends React.Component {
            render() {
              return (
                <a onMouseEnter={spy}>foo</a>
              );
            }
          }

          const wrapper = Wrap(<Mousetrap />);

          wrapper.simulate('mouseenter');
          expect(spy).to.have.property('callCount', 1);
        });

        it('converts lowercase events to React camelcase in SFCs', () => {
          const spy = sinon.spy();
          const MousetrapSFC = () => (
            <a onMouseEnter={spy}>foo</a>
          );

          const wrapper = Wrap(<MousetrapSFC />);

          wrapper.simulate('mouseenter');
          expect(spy).to.have.property('callCount', 1);
        });
      });

      describeIf(is('>= 15'), 'animation events', () => {
        it('converts lowercase events to React camelcase', () => {
          const spy = sinon.spy();
          class Animator extends React.Component {
            render() {
              return (
                <a onAnimationIteration={spy}>foo</a>
              );
            }
          }

          const wrapper = Wrap(<Animator />);

          wrapper.simulate('animationiteration');
          expect(spy).to.have.property('callCount', 1);
        });

        it('converts lowercase events to React camelcase in stateless components', () => {
          const spy = sinon.spy();
          const AnimatorSFC = () => (<a onAnimationIteration={spy}>foo</a>);

          const wrapper = Wrap(<AnimatorSFC />);

          wrapper.simulate('animationiteration');
          expect(spy).to.have.property('callCount', 1);
        });
      });

      describeIf(is('>= 16.4'), 'pointer events', () => {
        it('converts lowercase events to React camelcase', () => {
          const spy = sinon.spy();
          class Fingertrap extends React.Component {
            render() {
              return (<a onGotPointerCapture={spy}>foo</a>);
            }
          }

          const wrapper = Wrap(<Fingertrap />);

          wrapper.simulate('gotpointercapture');
          expect(spy).to.have.property('callCount', 1);
        });

        it('converts lowercase events to React camelcase in stateless components', () => {
          const spy = sinon.spy();
          const FingertrapSFC = () => (<a onGotPointerCapture={spy}>foo</a>);

          const wrapper = Wrap(<FingertrapSFC />);

          wrapper.simulate('gotpointercapture');
          expect(spy).to.have.property('callCount', 1);
        });
      });
    });

    itIf(BATCHING, 'has batched updates', () => {
      let renderCount = 0;
      class Multistate extends React.Component {
        constructor(props) {
          super(props);
          this.state = { count: 0 };
          this.onClick = this.onClick.bind(this);
        }

        onClick() {
          // eslint-disable-next-line react/destructuring-assignment, react/no-access-state-in-setstate
          this.setState({ count: this.state.count + 1 });
          // eslint-disable-next-line react/destructuring-assignment, react/no-access-state-in-setstate
          this.setState({ count: this.state.count + 1 });
        }

        render() {
          renderCount += 1;
          const { count } = this.state;
          return (
            <a onClick={this.onClick}>{count}</a>
          );
        }
      }

      const wrapper = Wrap(<Multistate />);
      wrapper.simulate('click');

      // TODO: figure out why this is broken in shallow rendering in react 17
      const todoShallow17 = isShallow && is('>= 17');

      expect(wrapper.text()).to.equal(todoShallow17 ? '2' : '1');
      expect(renderCount).to.equal(todoShallow17 ? 3 : 2);
    });

    it('chains', () => {
      const wrapper = Wrap(<div />);
      expect(wrapper.simulate('click')).to.equal(wrapper);
    });

    describe('works with .parent()/.parents()/.closest()', () => {
      let onClick;
      let wrapper;
      beforeEach(() => {
        onClick = sinon.stub();
        wrapper = Wrap((
          <div className="div-elem">
            <span className="parent-elem" onClick={onClick}>
              <span className="child-elem">click me</span>
            </span>
          </div>
        ));
      });

      itIf(!isShallow, 'child should fire onClick', () => {
        wrapper.find('.child-elem').simulate('click');
        expect(onClick).to.have.property('callCount', 1);
      });

      it('parents should fire onClick', () => {
        wrapper.find('.child-elem').parents('.parent-elem').simulate('click');
        expect(onClick).to.have.property('callCount', 1);
      });

      it('closest should fire onClick', () => {
        wrapper.find('.child-elem').closest('.parent-elem').simulate('click');
        expect(onClick).to.have.property('callCount', 1);
      });

      // FIXME: figure out why this breaks in `mount` with "Cannot read property '__reactInternalInstance$ukkwkcm5yvc' of null"
      itIf(!isMount, 'parent should fire onClick', () => {
        wrapper.find('.child-elem').parent().simulate('click');
        expect(onClick).to.have.property('callCount', 1);
      });
    });

    describeIf(is('>= 16.6'), 'React.memo', () => {
      itIf(isMount, 'can simulate events', () => {
        function Child({ onClick }) {
          return <button onClick={onClick} type="button" />;
        }
        const MemoizedChild = memo(Child);

        function Parent(props) {
          const { onClick } = props;

          return <MemoizedChild onClick={onClick} />;
        }

        const handleClick = sinon.spy();
        const wrapper = Wrap(<Parent onClick={handleClick} />);

        wrapper.find(MemoizedChild).props().onClick();
        expect(handleClick).to.have.property('callCount', 1);
        wrapper.find(MemoizedChild).simulate('click');
        expect(handleClick).to.have.property('callCount', 2);
        wrapper.find(MemoizedChild).props().onClick();
        expect(handleClick).to.have.property('callCount', 3);
      });
    });

    describeIf(is('>= 16.8'), 'hooks', () => {
      // TODO: fix for shallow when useEffect works for shallow
      itIf(!isShallow, 'works with `useEffect` simulated events', () => {
        const effectSpy = sinon.spy();
        function ComponentUsingEffectHook() {
          useEffect(effectSpy);
          const [counter, setCounter] = useState(0);

          return (
            <button type="button" onClick={() => setCounter(counter + 1)}>{counter}</button>
          );
        }
        const wrapper = Wrap(<ComponentUsingEffectHook />);

        const button = wrapper.find('button');
        expect(button.text()).to.equal('0');
        expect(effectSpy).to.have.property('callCount', 1);

        button.simulate('click');

        expect(button.text()).to.equal('1');
        expect(effectSpy).to.have.property('callCount', 2);
      });
    });
  });
}
