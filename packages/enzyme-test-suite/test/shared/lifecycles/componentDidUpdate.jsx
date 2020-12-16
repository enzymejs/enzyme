import React from 'react';
import sinon from 'sinon-sandbox';
import { expect } from 'chai';
import isEqual from 'lodash.isequal';

import {
  PureComponent,
} from '../../_helpers/react-compat';
import {
  describeIf,
} from '../../_helpers';
import {
  is,
} from '../../_helpers/version';

export default function describeCDU({
  Wrap,
  isShallow,
}) {
  describe('componentDidUpdate()', () => {
    it('calls `componentDidUpdate` when component’s `setState` is called', () => {
      const spy = sinon.spy();

      class Foo extends React.Component {
        constructor(props) {
          super(props);
          this.state = {
            foo: 'init',
          };
        }

        componentDidUpdate() {
          spy('componentDidUpdate');
        }

        onChange() {
          // enzyme can't handle the update because `this` is a ReactComponent instance,
          // not a ShallowWrapper instance.
          this.setState({ foo: 'onChange update' });
        }

        render() {
          spy('render');
          const { foo } = this.state;
          return <div>{foo}</div>;
        }
      }

      const wrapper = Wrap(<Foo />);
      spy.resetHistory();

      wrapper.setState({ foo: 'wrapper setState update' });
      expect(wrapper.state('foo')).to.equal('wrapper setState update');
      expect(spy.args).to.eql([
        ['render'],
        ['componentDidUpdate'],
      ]);
      spy.resetHistory();

      wrapper.instance().onChange();
      expect(wrapper.state('foo')).to.equal('onChange update');
      expect(spy.args).to.eql([
        ['render'],
        ['componentDidUpdate'],
      ]);
    });

    it('calls `componentDidUpdate` when component’s `setState` is called through a bound method', () => {
      const spy = sinon.spy();

      class Foo extends React.Component {
        constructor(props) {
          super(props);
          this.state = {
            foo: 'init',
          };
          this.onChange = this.onChange.bind(this);
        }

        componentDidUpdate() {
          spy('componentDidUpdate');
        }

        onChange() {
          // enzyme can't handle the update because `this` is a ReactComponent instance,
          // not a ShallowWrapper instance.
          this.setState({ foo: 'onChange update' });
        }

        render() {
          spy('render');
          const { foo } = this.state;
          return (
            <div>
              {foo}
              <button type="button" onClick={this.onChange}>click</button>
            </div>
          );
        }
      }

      const wrapper = Wrap(<Foo />);
      spy.resetHistory();

      wrapper.find('button').prop('onClick')();
      expect(wrapper.state('foo')).to.equal('onChange update');
      expect(spy.args).to.eql([
        ['render'],
        ['componentDidUpdate'],
      ]);
    });

    it('calls `componentDidUpdate` when component’s `setState` is called', () => {
      const spy = sinon.spy();

      class Foo extends React.Component {
        constructor(props) {
          super(props);
          this.state = {
            foo: 'init',
          };
          this.update = () => this.setState({ foo: 'update' });
        }

        componentDidMount() {
          spy('componentDidMount');
          this.update();
        }

        componentDidUpdate() {
          spy('componentDidUpdate');
        }

        render() {
          spy('render');
          const { foo } = this.state;
          return <div>{foo}</div>;
        }
      }

      const wrapper = Wrap(<Foo />);
      expect(wrapper.state('foo')).to.equal('update');

      expect(spy.args).to.eql([
        ['render'],
        ['componentDidMount'],
        ['render'],
        ['componentDidUpdate'],
      ]);
    });

    describeIf(is('>= 15.3'), 'PureComponent', () => {
      let spy;
      beforeEach(() => {
        spy = sinon.spy();
        spy(1);
      });

      it('does not update when state and props did not change', () => {
        class Foo extends PureComponent {
          constructor(props) {
            super(props);
            this.state = {
              foo: 'init',
            };
          }

          componentDidUpdate() {
            spy('componentDidUpdate');
          }

          render() {
            spy('render');
            const { foo } = this.state;
            return <div>{foo}</div>;
          }
        }

        const wrapper = Wrap(<Foo id={1} />);
        spy(1);
        expect(spy.args).to.deep.equal([
          [1],
          ['render'],
          [1],
        ]);
        spy.resetHistory();
        spy(2);

        wrapper.setState({ foo: 'update' });
        spy(2);
        expect(spy.args).to.deep.equal([
          [2],
          ['render'],
          ['componentDidUpdate'],
          [2],
        ]);
        spy.resetHistory();
        spy(3);

        wrapper.setState({ foo: 'update' });
        spy(3);
        expect(spy.args).to.deep.equal([
          [3],
          [3],
        ]);
        spy.resetHistory();
        spy(4);

        wrapper.setProps({ id: 2 });
        spy(4);
        expect(spy.args).to.deep.equal([
          [4],
          ['render'],
          ['componentDidUpdate'],
          [4],
        ]);
        spy.resetHistory();
        spy(5);

        wrapper.setProps({ id: 2 });
        spy(5);
        expect(spy.args).to.deep.equal([
          [5],
          [5],
        ]);
      });

      class Test extends PureComponent {
        constructor(...args) {
          super(...args);

          this.state = { a: { b: { c: 1 } } };
        }

        componentDidUpdate() {
          spy('componentDidUpdate');
          const { onUpdate } = this.props;
          onUpdate();
        }

        setDeepEqualState() {
          this.setState({ a: { b: { c: 1 } } });
        }

        setDeepDifferentState() {
          this.setState({ a: { b: { c: 2 } } });
        }

        render() {
          spy('render');
          const { a: { b: { c } } } = this.state;
          return <div>{c}</div>;
        }
      }

      it('rerenders on setState when new state is !==, but deeply equal to existing state', () => {
        const updateSpy = sinon.spy();
        const wrapper = Wrap(<Test onUpdate={updateSpy} />);
        wrapper.instance().setDeepEqualState();
        expect(updateSpy).to.have.property('callCount', 1);
      });

      it('rerenders when setState is called with an object that doesnt have deep equality', () => {
        const updateSpy = sinon.spy();
        const wrapper = Wrap(<Test onUpdate={updateSpy} />);
        wrapper.instance().setDeepDifferentState();
        expect(updateSpy).to.have.property('callCount', 1);
      });

      it('does not infinitely loop when a PureComponent fires a noop setState in cDU', () => {
        class Example extends PureComponent {
          constructor(props) {
            super(props);

            this.renders = 0;
            this.state = {
              a: false,
              b: false,
            };
          }

          componentDidMount() {
            spy('componentDidMount');
            this.setState({ b: false });
          }

          componentDidUpdate() {
            spy('componentDidUpdate');
            this.setState({ b: false }); // eslint-disable-line react/no-did-update-set-state
          }

          render() {
            spy('render');
            this.renders += 1;
            const { a, b } = this.state;
            return <div>{`${a} ${b} ${this.renders}`}</div>;
          }
        }

        const wrapper = Wrap(<Example />);
        expect(wrapper.debug()).to.equal(isShallow
          ? `<div>
  false false 1
</div>`
          : `<Example>
  <div>
    false false 1
  </div>
</Example>`);
      });
    });

    describe('Own PureComponent implementation', () => {
      it('does not update when state and props did not change', () => {
        const spy = sinon.spy();
        spy(1);
        class Foo extends React.Component {
          constructor(props) {
            super(props);
            this.state = {
              foo: 'init',
            };
          }

          shouldComponentUpdate(nextProps, nextState) {
            spy('shouldComponentUpdate');
            return !isEqual(this.props, nextProps) || !isEqual(this.state, nextState);
          }

          componentDidUpdate() {
            spy('componentDidUpdate');
          }

          render() {
            spy('render');
            const { foo } = this.state;
            return <div>{foo}</div>;
          }
        }

        const wrapper = Wrap(<Foo id={1} />);
        spy(1);
        expect(spy.args).to.deep.equal([
          [1],
          ['render'],
          [1],
        ]);
        spy.resetHistory();
        spy(2);

        wrapper.setState({ foo: 'update' });
        spy(2);
        expect(spy.args).to.deep.equal([
          [2],
          ['shouldComponentUpdate'],
          ['render'],
          ['componentDidUpdate'],
          [2],
        ]);
        spy.resetHistory();
        spy(3);

        wrapper.setState({ foo: 'update' });
        spy(3);
        expect(spy.args).to.deep.equal([
          [3],
          ['shouldComponentUpdate'],
          [3],
        ]);
        spy.resetHistory();
        spy(4);

        wrapper.setProps({ id: 2 });
        spy(4);
        expect(spy.args).to.deep.equal([
          [4],
          ['shouldComponentUpdate'],
          ['render'],
          ['componentDidUpdate'],
          [4],
        ]);
        spy.resetHistory();
        spy(5);

        wrapper.setProps({ id: 2 });
        spy(5);
        expect(spy.args).to.deep.equal([
          [5],
          ['shouldComponentUpdate'],
          [5],
        ]);
      });
    });
  });
}
