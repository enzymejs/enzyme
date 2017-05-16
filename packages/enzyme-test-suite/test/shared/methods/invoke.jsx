import React from 'react';
import PropTypes from 'prop-types';
import { expect } from 'chai';
import wrap from 'mocha-wrap';
import sinon from 'sinon-sandbox';
import { Portal } from 'react-is';

import { render } from 'enzyme';
import getAdapter from 'enzyme/build/getAdapter';
import {
  ITERATOR_SYMBOL,
  sym,
} from 'enzyme/build/Utils';

import {
  describeIf,
  itIf,
} from '../../_helpers';
import realArrowFunction from '../../_helpers/realArrowFunction';
import { getElementPropSelector, getWrapperPropSelector } from '../../_helpers/selectors';
import {
  is,
  REACT16,
} from '../../_helpers/version';

import {
  createClass,
  createPortal,
  createRef,
  Fragment,
} from '../../_helpers/react-compat';

export default function describeInvoke({
  Wrap,
  WrapRendered,
  Wrapper,
  WrapperName,
  isShallow,
  isMount,
  makeDOMElement,
}) {
  describe('.invoke(eventName, ..args)', () => {
    it('should return the handlers return value', () => {
      const spy = sinon.stub().returns(123);
      class Foo extends React.Component {
        render() {
          return (<a onClick={spy}>foo</a>);
        }
      }

      const wrapper = shallow(<Foo />);
      const value = wrapper.invoke('click');

      expect(value).to.equal(123);
      expect(spy).to.have.property('callCount', 1);
    });

    it('should invoke event handlers without propagation', () => {
      class Foo extends React.Component {
        constructor(props) {
          super(props);
          this.state = { count: 0 };
          this.incrementCount = this.incrementCount.bind(this);
        }

        incrementCount() {
          this.setState({ count: this.state.count + 1 });
        }

        render() {
          const { count } = this.state;
          return (
            <div onClick={this.incrementCount}>
              <a
                className={`clicks-${count}`}
                onClick={this.incrementCount}
              >
                foo
              </a>
            </div>
          );
        }
      }

      const wrapper = shallow(<Foo />);

      expect(wrapper.find('.clicks-0').length).to.equal(1);
      wrapper.find('a').invoke('click');
      expect(wrapper.find('.clicks-1').length).to.equal(1);
    });

    it('should pass in arguments', () => {
      const spy = sinon.spy();
      class Foo extends React.Component {
        render() {
          return (
            <a onClick={spy}>foo</a>
          );
        }
      }

      const wrapper = shallow(<Foo />);
      const a = {};
      const b = {};

      wrapper.invoke('click', a, b);
      expect(spy.args[0][0]).to.equal(a);
      expect(spy.args[0][1]).to.equal(b);
    });

    describeIf(is('> 0.13'), 'stateless function components (SFCs)', () => {
      it('should invoke event handlers', () => {
        const spy = sinon.spy();
        const Foo = ({ onClick }) => (
          <div onClick={onClick}>
            <a onClick={onClick}>foo</a>
          </div>
        );

        const wrapper = shallow(<Foo onClick={spy} />);

        expect(spy).to.have.property('callCount', 0);
        wrapper.find('a').invoke('click');
        expect(spy).to.have.property('callCount', 1);
     });


      it('should pass in arguments', () => {
        const spy = sinon.spy();
        const Foo = () => (
          <a onClick={spy}>foo</a>
        );

        const wrapper = shallow(<Foo />);
        const a = {};
        const b = {};

        wrapper.invoke('click', a, b);
        const [[arg1, arg2]] = spy.args;
        expect(arg1).to.equal(a);
        expect(arg2).to.equal(b);
      });
    });

    describe('Normalizing JS event names', () => {
      it('should convert lowercase events to React camelcase', () => {
        const spy = sinon.spy();
        const clickSpy = sinon.spy();
        class SpiesOnClicks extends React.Component {
          render() {
            return (<a onClick={clickSpy} onDoubleClick={spy}>foo</a>);
          }
        }

        const wrapper = shallow(<SpiesOnClicks />);

        wrapper.invoke('dblclick');
        expect(spy).to.have.property('callCount', 1);

        wrapper.invoke('click');
        expect(clickSpy).to.have.property('callCount', 1);
     });

      describeIf(is('> 0.13'), 'normalizing mouseenter', () => {
        it('should convert lowercase events to React camelcase', () => {
          const spy = sinon.spy();
          class Foo extends React.Component {
            render() {
              return (<a onMouseEnter={spy}>foo</a>);
            }
          }

          const wrapper = shallow(<Foo />);

          wrapper.invoke('mouseenter');
          expect(spy).to.have.property('callCount', 1);
        });

        it('should convert lowercase events to React camelcase in stateless components', () => {
          const spy = sinon.spy();
          const Foo = () => (
            <a onMouseEnter={spy}>foo</a>
          );

          const wrapper = shallow(<Foo />);

          wrapper.invoke('mouseenter');
          expect(spy).to.have.property('callCount', 1);
        });
      });
    });

    it('should batch updates', () => {
      let renderCount = 0;
      class Foo extends React.Component {
        constructor(props) {
          super(props);
          this.state = {
            count: 0,
          };
          this.onClick = this.onClick.bind(this);
        }

        onClick() {
          this.setState({ count: this.state.count + 1 });
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

      const wrapper = shallow(<Foo />);
      wrapper.invoke('click');
      expect(wrapper.text()).to.equal('1');
      expect(renderCount).to.equal(2);
    });
  });
}
