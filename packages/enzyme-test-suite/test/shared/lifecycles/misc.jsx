import React from 'react';
import sinon from 'sinon-sandbox';
import { expect } from 'chai';
import PropTypes from 'prop-types';

import {
  describeIf,
  itIf,
  argSpy,
  expectArgs,
} from '../../_helpers';
import {
  PureComponent,
} from '../../_helpers/react-compat';
import {
  is,
  BATCHING,
} from '../../_helpers/version';

export default function describeMisc({
  Wrap,
  isShallow,
}) {
  describe('miscellaneous lifecycle combos', () => {
    let spy;

    beforeEach(() => {
      spy = argSpy();
    });

    describeIf(is('>= 16.3'), 'setProps calls `componentDidUpdate` when `getDerivedStateFromProps` is defined', () => {
      class DummyComp extends PureComponent {
        constructor(...args) {
          super(...args);
          this.state = { state: -1 };
        }

        static getDerivedStateFromProps(props, state) {
          const { changeState, counter } = props;
          spy('getDerivedStateFromProps', { props, state });
          return changeState ? { state: counter * 10 } : null;
        }

        componentDidUpdate() {
          spy('componentDidUpdate');
        }

        render() {
          spy('render');
          const { counter } = this.props;
          const { state } = this.state;
          return (
            <p>
              {counter}
              {state}
            </p>
          );
        }
      }

      it('with no state changes, calls both methods with a sync and async setProps', () => {
        const wrapper = Wrap(<DummyComp changeState={false} counter={0} />);

        expect(wrapper.state()).to.eql({ state: -1 });
        expectArgs(spy, 1, [
          [
            'getDerivedStateFromProps',
            {
              props: {
                changeState: false,
                counter: 0,
              },
              state: {
                state: -1,
              },
            },
          ],
          ['render'],
        ]);

        wrapper.setProps({ counter: 1 });

        expect(wrapper.state()).to.eql({ state: -1 });
        expectArgs(spy, 2, [
          [
            'getDerivedStateFromProps',
            {
              props: {
                changeState: false,
                counter: 1,
              },
              state: {
                state: -1,
              },
            },
          ],
          ['render'],
          ['componentDidUpdate'],
        ]);

        return new Promise((resolve) => {
          wrapper.setProps({ counter: 2 }, resolve);
        }).then(() => {
          expectArgs(spy, 3, [
            [
              'getDerivedStateFromProps',
              {
                props: {
                  changeState: false,
                  counter: 2,
                },
                state: {
                  state: -1,
                },
              },
            ],
            ['render'],
            ['componentDidUpdate'],
          ]);
          expect(wrapper.state()).to.eql({ state: -1 });
        });
      });

      it('with a state changes, calls both methods with a sync and async setProps', () => {
        const wrapper = Wrap(<DummyComp changeState counter={0} />);

        expectArgs(spy, 1, [
          [
            'getDerivedStateFromProps',
            {
              props: {
                changeState: true,
                counter: 0,
              },
              state: {
                state: -1,
              },
            },
          ],
          ['render'],
        ]);
        expect(wrapper.state()).to.eql({ state: 0 });

        wrapper.setProps({ counter: 1 });

        expectArgs(spy, 2, [
          [
            'getDerivedStateFromProps',
            {
              props: {
                changeState: true,
                counter: 1,
              },
              state: {
                state: 0,
              },
            },
          ],
          ['render'],
          ['componentDidUpdate'],
        ]);
        expect(wrapper.state()).to.eql({ state: 10 });

        return new Promise((resolve) => {
          wrapper.setProps({ counter: 2 }, resolve);
        }).then(() => {
          expect(wrapper.state()).to.eql({ state: 20 });
          expectArgs(spy, 3, [
            [
              'getDerivedStateFromProps',
              {
                props: {
                  changeState: true,
                  counter: 2,
                },
                state: {
                  state: 10,
                },
              },
            ],
            ['render'],
            ['componentDidUpdate'],
          ]);
        });
      });
    });

    it('calls `componentDidUpdate` when component’s `setState` is called through a bound method', () => {
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
      wrapper.find('button').prop('onClick')();
      expect(wrapper.state('foo')).to.equal('onChange update');
      expectArgs(spy, 1, [
        ['render'],
        ['render'],
        ['componentDidUpdate'],
      ]);
    });

    it('calls `componentDidUpdate` when component’s `setState` is called by componentDidMount', () => {
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
      expectArgs(spy, 1, [
        ['render'],
        ['componentDidMount'],
        ['render'],
        ['componentDidUpdate'],
      ]);
    });

    it('calls `componentDidUpdate` when component’s `setState` is called directly', () => {
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
          this.setState({ foo: 'onChange update' });
        }

        render() {
          spy('render');
          const { foo } = this.state;
          return <div>{foo}</div>;
        }
      }

      const wrapper = Wrap(<Foo />);
      expectArgs(spy, 1, [
        ['render'],
      ]);

      wrapper.setState({ foo: 'wrapper setState update' });
      expect(wrapper.state('foo')).to.equal('wrapper setState update');
      expectArgs(spy, 2, [
        ['render'],
        ['componentDidUpdate'],
      ]);

      wrapper.instance().onChange();
      expect(wrapper.state('foo')).to.equal('onChange update');

      expectArgs(spy, 3, [
        ['render'],
        ['componentDidUpdate'],
      ]);
    });

    it('does not call `componentDidMount` twice when a child component is created', () => {
      class Foo extends React.Component {
        constructor(props) {
          super(props);
          this.state = {
            foo: 'init',
          };
        }

        componentDidMount() {
          spy('componentDidMount');
        }

        render() {
          spy('render');
          const { foo } = this.state;
          return (
            <div>
              <button type="button" onClick={() => this.setState({ foo: 'update2' })}>
                click
              </button>
              {foo}
            </div>
          );
        }
      }

      const wrapper = Wrap(<Foo />);
      expectArgs(spy, 1, [
        ['render'],
        ['componentDidMount'],
      ]);

      wrapper.find('button').prop('onClick')();
      expectArgs(spy, 2, [
        ['render'],
      ]);
    });

    describeIf(is('>= 16.6'), 'getDerivedStateFromError and componentDidCatch combined', () => {
      const errorToThrow = new EvalError('threw an error!');
      // in React 16.0 - 16.2 and 16.9+, and some older nodes, the actual error thrown isn't reported.
      const reactError = new Error('An error was thrown inside one of your components, but React doesn\'t know what it was. This is likely due to browser flakiness. React does its best to preserve the "Pause on exceptions" behavior of the DevTools, which requires some DEV-mode only tricks. It\'s possible that these don\'t work in your browser. Try triggering the error in production mode, or switching to a modern browser. If you suspect that this is actually an issue with React, please file an issue.');
      const properErrorMessage = (error) => error instanceof Error && (
        error.message === errorToThrow.message
        || error.message === reactError.message
      );
      const expectedInfo = {
        componentStack: `
    in Thrower (created by ErrorBoundary)
    in div (created by ErrorBoundary)
    in ErrorBoundary (created by WrapperComponent)
    in WrapperComponent`,
      };

      function Thrower({ throws }) {
        if (throws) {
          throw errorToThrow;
        }
        return null;
      }

      describe('errors inside error boundary when getDerivedStateFromProps returns update', () => {
        let lifecycleSpy;
        let stateSpy;

        beforeEach(() => {
          lifecycleSpy = sinon.spy();
          stateSpy = sinon.spy();
        });

        class ErrorBoundary extends React.Component {
          static getDerivedStateFromError(error) {
            lifecycleSpy('getDerivedStateFromError', error);
            return {
              didThrow: true,
              throws: false,
            };
          }

          constructor(props) {
            super(props);
            this.state = {
              didThrow: false,
              throws: false,
            };

            lifecycleSpy('constructor');
          }

          componentDidCatch(error, info) {
            lifecycleSpy('componentDidCatch', error, info);
            stateSpy({ ...this.state });
          }

          render() {
            lifecycleSpy('render');

            const {
              throws,
            } = this.state;

            return (
              <div>
                <Thrower throws={throws} />
              </div>
            );
          }
        }

        itIf(isShallow, 'does not catch errors during shallow render', () => {
          const wrapper = Wrap(<ErrorBoundary />);

          expect(lifecycleSpy.args).to.deep.equal([
            ['constructor'],
            ['render'],
          ]);
          lifecycleSpy.resetHistory();

          expect(stateSpy.args).to.deep.equal([]);

          wrapper.setState({ throws: true });

          const thrower = wrapper.find(Thrower);
          expect(thrower).to.have.lengthOf(1);
          expect(thrower.props()).to.have.property('throws', true);

          expect(() => thrower.dive()).to.throw(errorToThrow);

          expect(lifecycleSpy.args).to.deep.equal([
            ['render'],
          ]);
          expect(stateSpy.args).to.deep.equal([]);
        });

        it('calls getDerivedStateFromError first and then componentDidCatch for simulated error', () => {
          const wrapper = Wrap(<ErrorBoundary />);

          expect(lifecycleSpy.args).to.deep.equal([
            ['constructor'],
            ['render'],
          ]);
          lifecycleSpy.resetHistory();

          expect(stateSpy.args).to.deep.equal([]);

          expect(() => wrapper.find(Thrower).simulateError(errorToThrow)).not.to.throw();

          expect(lifecycleSpy.args).to.deep.equal([
            ['getDerivedStateFromError', errorToThrow],
            ['render'],
            ['componentDidCatch', errorToThrow, expectedInfo],
          ]);

          expect(stateSpy.args).to.deep.equal([
            [{
              throws: false,
              didThrow: true,
            }],
          ]);
        });

        itIf(!isShallow, 'calls getDerivedStateFromError first and then componentDidCatch', () => {
          const wrapper = Wrap(<ErrorBoundary />);

          expect(lifecycleSpy.args).to.deep.equal([
            ['constructor'],
            ['render'],
          ]);
          lifecycleSpy.resetHistory();

          expect(stateSpy.args).to.deep.equal([]);

          wrapper.setState({ throws: true });

          expect(lifecycleSpy).to.have.property('callCount', 4);
          const [first, second, third, fourth] = lifecycleSpy.args;
          expect(first).to.deep.equal(['render']);
          expect(second).to.satisfy(([name, error, ...rest]) => name === 'getDerivedStateFromError'
            && properErrorMessage(error)
            && rest.length === 0);
          expect(third).to.deep.equal(['render']);
          const [name, error, info] = fourth;
          expect(name).to.equal('componentDidCatch');
          expect(error).to.satisfy(properErrorMessage);
          expect(info).to.deep.equal(expectedInfo);

          expect(stateSpy.args).to.deep.equal([
            [{
              throws: false,
              didThrow: true,
            }],
          ]);
        });
      });

      describe('errors inside error boundary when getDerivedStateFromError does not return update', () => {
        class ErrorBoundary extends React.Component {
          static getDerivedStateFromError(error) {
            spy('getDerivedStateFromError', error);
            return null;
          }

          constructor(props) {
            super(props);
            this.state = {
              didThrow: false,
              throws: false,
            };

            spy('constructor');
          }

          componentDidCatch(error, info) {
            spy('componentDidCatch', error, info);

            this.setState({
              didThrow: true,
              throws: false,
            });
          }

          render() {
            spy('render');

            const {
              didThrow,
              throws,
            } = this.state;

            return (
              <div>
                <Thrower throws={throws} />
                <div>
                  {didThrow ? 'HasThrown' : 'HasNotThrown'}
                </div>
              </div>
            );
          }
        }

        itIf(isShallow, 'does not catch errors during shallow render', () => {
          const wrapper = Wrap(<ErrorBoundary />);

          expectArgs(spy, 1, [
            ['constructor'],
            ['render'],
          ]);

          wrapper.setState({ throws: true });

          const thrower = wrapper.find(Thrower);
          expect(thrower).to.have.lengthOf(1);
          expect(thrower.props()).to.have.property('throws', true);

          expect(() => thrower.dive()).to.throw(errorToThrow);

          expectArgs(spy, 2, [
            ['render'],
          ]);
        });

        itIf(!isShallow, 'renders again without calling componentDidCatch and then fails', () => {
          const wrapper = Wrap(<ErrorBoundary />);

          expectArgs(spy, 1, [
            ['constructor'],
            ['render'],
          ]);
          spy.resetHistory();

          try {
            wrapper.setState({ throws: true });
            expect('should never get here').to.equal(false);
          } catch (e) {
            expect(e).to.satisfy(properErrorMessage);
          }

          expect(spy).to.have.property('callCount', 3);
          const [first, second, third] = spy.args;
          expect(first).to.deep.equal(['render']);
          expect(second).to.satisfy(([name, arg, ...rest]) => (
            name === 'getDerivedStateFromError'
            && properErrorMessage(arg)
            && rest.length === 0
          ));
          expect(third).to.deep.equal(['render']);
        });

        it('rerenders on a simulated error', () => {
          const wrapper = Wrap(<ErrorBoundary />);

          expectArgs(spy, 1, [
            ['constructor'],
            ['render'],
          ]);

          const thrower = wrapper.find(Thrower);

          expect(() => thrower.simulateError(errorToThrow)).not.to.throw(errorToThrow);

          expectArgs(spy, 2, [
            ['getDerivedStateFromError', errorToThrow],
            ['componentDidCatch', errorToThrow, expectedInfo],
            ['render'],
          ]);
        });

        it('renders again on simulated error', () => {
          const wrapper = Wrap(<ErrorBoundary />);

          expectArgs(spy, 1, [
            ['constructor'],
            ['render'],
          ]);

          expect(() => wrapper.find(Thrower).simulateError(errorToThrow)).not.to.throw();

          expectArgs(spy, 2, [
            ['getDerivedStateFromError', errorToThrow],
            ['componentDidCatch', errorToThrow, expectedInfo],
            ['render'],
          ]);
        });
      });
    });

    context('mounting phase', () => {
      it('calls componentWillMount and componentDidMount', () => {
        class Foo extends React.Component {
          componentWillMount() {
            spy('componentWillMount');
          }

          componentDidMount() {
            spy('componentDidMount');
          }

          render() {
            spy('render');
            return <div>foo</div>;
          }
        }

        Wrap(<Foo />);

        expectArgs(spy, 1, [
          ['componentWillMount'],
          ['render'],
          ['componentDidMount'],
        ]);
      });

      itIf(!isShallow || BATCHING, 'is batching updates', () => {
        class Foo extends React.Component {
          constructor(props) {
            super(props);
            this.state = {
              count: 0,
            };
          }

          componentWillMount() {
            spy('componentWillMount');
            /* eslint-disable react/destructuring-assignment */
            this.setState({ count: this.state.count + 1 });
            this.setState({ count: this.state.count + 1 });
            /* eslint-enable react/destructuring-assignment */
          }

          componentDidMount() {
            spy('componentDidMount');
            /* eslint-disable react/destructuring-assignment */
            this.setState({ count: this.state.count + 1 });
            this.setState({ count: this.state.count + 1 });
            /* eslint-enable react/destructuring-assignment */
          }

          render() {
            spy('render');
            const { count } = this.state;
            return <div>{count}</div>;
          }
        }
        const result = Wrap(<Foo />);
        expect(result.state('count')).to.equal(2);
        expectArgs(spy, 1, [
          ['componentWillMount'],
          ['render'],
          ['componentDidMount'],
          ['render'],
        ]);
      });
    });

    context('updating props', () => {
      it('calls shouldComponentUpdate, componentWillUpdate, and componentDidUpdate', () => {
        class Foo extends React.Component {
          constructor(...args) {
            super(...args);
            this.state = {
              foo: 'state',
            };
          }

          componentWillReceiveProps(nextProps, nextContext) {
            spy('componentWillReceiveProps', this.props, nextProps, nextContext);
          }

          shouldComponentUpdate(nextProps, nextState, nextContext) {
            spy('shouldComponentUpdate', this.props, nextProps, this.state, nextState, nextContext);
            return true;
          }

          componentWillUpdate(nextProps, nextState, nextContext) {
            spy('componentWillUpdate', this.props, nextProps, this.state, nextState, nextContext);
          }

          componentDidUpdate(prevProps, prevState, prevContext) {
            spy('componentDidUpdate', prevProps, this.props, prevState, this.state, prevContext);
          }

          render() {
            spy('render');
            const { foo } = this.state;
            return <div>{foo}</div>;
          }
        }
        Foo.contextTypes = {
          foo: PropTypes.string,
        };

        const wrapper = Wrap(
          <Foo foo="bar" />,
          {
            context: { foo: 'context' },
          },
        );
        expectArgs(spy, 1, [
          ['render'],
        ]);

        wrapper.setProps({ foo: 'baz' });
        wrapper.setProps({ foo: 'bax' });
        expectArgs(spy, 2, [
          [
            'componentWillReceiveProps',
            { foo: 'bar' }, { foo: 'baz' },
            { foo: 'context' }, // this will be fixed
          ],
          [
            'shouldComponentUpdate',
            { foo: 'bar' }, { foo: 'baz' },
            { foo: 'state' }, { foo: 'state' },
            { foo: 'context' },
          ],
          [
            'componentWillUpdate',
            { foo: 'bar' }, { foo: 'baz' },
            { foo: 'state' }, { foo: 'state' },
            { foo: 'context' },
          ],
          ['render'],
          [
            'componentDidUpdate',
            { foo: 'bar' }, { foo: 'baz' },
            { foo: 'state' }, { foo: 'state' },
            is('>= 16') ? undefined : { foo: 'context' },
          ],
          [
            'componentWillReceiveProps',
            { foo: 'baz' }, { foo: 'bax' },
            { foo: 'context' },
          ],
          [
            'shouldComponentUpdate',
            { foo: 'baz' }, { foo: 'bax' },
            { foo: 'state' }, { foo: 'state' },
            { foo: 'context' },
          ],
          [
            'componentWillUpdate',
            { foo: 'baz' }, { foo: 'bax' },
            { foo: 'state' }, { foo: 'state' },
            { foo: 'context' },
          ],
          ['render'],
          [
            'componentDidUpdate',
            { foo: 'baz' }, { foo: 'bax' },
            { foo: 'state' }, { foo: 'state' },
            is('>= 16') ? undefined : { foo: 'context' },
          ],
        ]);
      });

      it('calls componentWillReceiveProps, shouldComponentUpdate, componentWillUpdate and componentDidUpdate with merged props', () => {
        class Foo extends React.Component {
          componentWillReceiveProps(nextProps) {
            spy('componentWillReceiveProps', this.props, nextProps);
          }

          shouldComponentUpdate(nextProps) {
            spy('shouldComponentUpdate', this.props, nextProps);
            return true;
          }

          componentWillUpdate(nextProps) {
            spy('componentWillUpdate', this.props, nextProps);
          }

          componentDidUpdate(prevProps) {
            spy('componentDidUpdate', prevProps, this.props);
          }

          render() {
            spy('render');
            return (<div />);
          }
        }

        const wrapper = Wrap(<Foo a="a" b="b" />);
        expectArgs(spy, 1, [
          ['render'],
        ]);

        wrapper.setProps({ b: 'c', d: 'e' });
        expectArgs(spy, 2, [
          [
            'componentWillReceiveProps',
            { a: 'a', b: 'b' },
            { a: 'a', b: 'c', d: 'e' },
          ],
          [
            'shouldComponentUpdate',
            { a: 'a', b: 'b' },
            { a: 'a', b: 'c', d: 'e' },
          ],
          [
            'componentWillUpdate',
            { a: 'a', b: 'b' },
            { a: 'a', b: 'c', d: 'e' },
          ],
          ['render'],
          [
            'componentDidUpdate',
            { a: 'a', b: 'b' },
            { a: 'a', b: 'c', d: 'e' },
          ],
        ]);
      });

      it('cancels rendering when Component returns false in shouldComponentUpdate', () => {
        class Foo extends React.Component {
          componentWillReceiveProps() {
            spy('componentWillReceiveProps');
          }

          shouldComponentUpdate() {
            spy('shouldComponentUpdate');
            return false;
          }

          componentWillUpdate() {
            spy('componentWillUpdate');
          }

          componentDidUpdate() {
            spy('componentDidUpdate');
          }

          render() {
            spy('render');
            return <div>foo</div>;
          }
        }

        const wrapper = Wrap(<Foo foo="bar" />);
        expect(wrapper.instance().props.foo).to.equal('bar');
        expectArgs(spy, 1, [
          ['render'],
        ]);

        wrapper.setProps({ foo: 'baz' });
        expect(wrapper.instance().props.foo).to.equal('baz');
        expectArgs(spy, 2, [
          ['componentWillReceiveProps'],
          ['shouldComponentUpdate'],
        ]);

        wrapper.setProps({ foo: 'bax' });
        expect(wrapper.instance().props.foo).to.equal('bax');
        expectArgs(spy, 3, [
          ['componentWillReceiveProps'],
          ['shouldComponentUpdate'],
        ]);
      });

      itIf(!isShallow || BATCHING, 'does not provoke another renders to call setState in componentWillReceiveProps', () => {
        class Foo extends React.Component {
          constructor(props) {
            super(props);
            this.state = {
              count: 0,
            };
          }

          componentWillReceiveProps() {
            spy('componentWillReceiveProps');
            /* eslint-disable react/destructuring-assignment */
            this.setState({ count: this.state.count + 1 });
            this.setState({ count: this.state.count + 1 });
            /* eslint-enable react/destructuring-assignment */
          }

          render() {
            spy('render');
            const { foo } = this.props;
            return <div>{foo}</div>;
          }
        }
        const result = Wrap(<Foo />);
        expectArgs(spy, 1, [
          ['render'],
        ]);

        result.setProps({ name: 'bar' });

        expect(result.state('count')).to.equal(1);
        expectArgs(spy, 2, [
          ['componentWillReceiveProps'],
          ['render'],
        ]);
      });

      itIf(!isShallow || BATCHING, 'provokes another render to call setState twice in componentWillUpdate', () => {
        class Foo extends React.Component {
          constructor(props) {
            super(props);
            this.updated = false;
            this.state = {
              count: 0,
            };
          }

          componentWillUpdate() {
            spy('componentWillUpdate');
            if (!this.updated) {
              this.updated = true;
              /* eslint-disable react/destructuring-assignment */
              this.setState({ count: this.state.count + 1 });
              this.setState({ count: this.state.count + 1 });
              /* eslint-enable react/destructuring-assignment */
            }
          }

          render() {
            spy('render');
            const { foo } = this.props;
            return <div>{foo}</div>;
          }
        }
        const result = Wrap(<Foo />);
        expectArgs(spy, 1, [
          ['render'],
        ]);

        result.setProps({ name: 'bar' });

        expect(result.state('count')).to.equal(1);
        expectArgs(spy, 2, [
          ['componentWillUpdate'],
          ['render'],
          ['componentWillUpdate'],
          ['render'],
        ]);
      });

      itIf(!isShallow || BATCHING, 'provokes another render to call setState twice in componentDidUpdate', () => {
        class Foo extends React.Component {
          constructor(props) {
            super(props);
            this.updated = false;
            this.state = {
              count: 0,
            };
          }

          componentDidUpdate() {
            spy('componentDidUpdate');
            if (!this.updated) {
              this.updated = true;
              /* eslint-disable react/no-did-update-set-state, react/destructuring-assignment */
              this.setState({ count: this.state.count + 1 });
              this.setState({ count: this.state.count + 1 });
              /* eslint-enable react/no-did-update-set-state, react/destructuring-assignment */
            }
          }

          render() {
            spy('render');
            const { foo } = this.props;
            return <div>{foo}</div>;
          }
        }
        const result = Wrap(<Foo />);
        expectArgs(spy, 1, [
          ['render'],
        ]);

        result.setProps({ name: 'bar' });

        expect(result.state('count')).to.equal(1);
        expectArgs(spy, 2, [
          ['render'],
          ['componentDidUpdate'],
          ['render'],
          ['componentDidUpdate'],
        ]);
      });
    });

    context('updating state', () => {
      it('calls shouldComponentUpdate, componentWillUpdate, and componentDidUpdate', () => {
        class Foo extends React.Component {
          constructor(...args) {
            super(...args);
            this.state = {
              foo: 'bar',
            };
          }

          shouldComponentUpdate(nextProps, nextState, nextContext) {
            spy('shouldComponentUpdate', this.props, nextProps, this.state, nextState, nextContext);
            return true;
          }

          componentWillUpdate(nextProps, nextState, nextContext) {
            spy('componentWillUpdate', this.props, nextProps, this.state, nextState, nextContext);
          }

          componentDidUpdate(prevProps, prevState, prevContext) {
            spy('componentDidUpdate', prevProps, this.props, prevState, this.state, prevContext);
          }

          render() {
            spy('render');
            const { foo } = this.state;
            return <div>{foo}</div>;
          }
        }
        Foo.contextTypes = {
          foo: PropTypes.string,
        };

        const wrapper = Wrap(
          <Foo foo="props" />,
          {
            context: { foo: 'context' },
          },
        );
        expectArgs(spy, 1, [
          ['render'],
        ]);

        wrapper.setState({ foo: 'baz' });
        expectArgs(spy, 2, [
          [
            'shouldComponentUpdate',
            { foo: 'props' }, { foo: 'props' },
            { foo: 'bar' }, { foo: 'baz' },
            { foo: 'context' },
          ],
          [
            'componentWillUpdate',
            { foo: 'props' }, { foo: 'props' },
            { foo: 'bar' }, { foo: 'baz' },
            { foo: 'context' },
          ],
          ['render'],
          [
            'componentDidUpdate',
            { foo: 'props' }, { foo: 'props' },
            { foo: 'bar' }, { foo: 'baz' },
            is('>= 16') ? undefined : { foo: 'context' },
          ],
        ]);
      });

      it('cancels rendering when Component returns false in shouldComponentUpdate', () => {
        class Foo extends React.Component {
          constructor(props) {
            super(props);
            this.state = {
              foo: 'bar',
            };
          }

          shouldComponentUpdate() {
            spy('shouldComponentUpdate');
            return false;
          }

          componentWillUpdate() {
            spy('componentWillUpdate');
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
        expect(wrapper.instance().state.foo).to.equal('bar');
        expectArgs(spy, 1, [
          ['render'],
        ]);

        wrapper.setState({ foo: 'baz' });
        expect(wrapper.instance().state.foo).to.equal('baz');
        expectArgs(spy, 2, [
          ['shouldComponentUpdate'],
        ]);
      });

      itIf(!isShallow || BATCHING, 'provokes another render to call setState twice in componentWillUpdate', () => {
        class Foo extends React.Component {
          constructor(props) {
            super(props);
            this.updated = false;
            this.state = {
              name: 'foo',
              count: 0,
            };
          }

          componentWillUpdate() {
            spy('componentWillUpdate');
            if (!this.updated) {
              this.updated = true;
              /* eslint-disable react/destructuring-assignment */
              this.setState({ count: this.state.count + 1 });
              this.setState({ count: this.state.count + 1 });
              /* eslint-enable react/destructuring-assignment */
            }
          }

          render() {
            spy('render');
            const { name } = this.state;
            return <div>{name}</div>;
          }
        }
        const result = Wrap(<Foo />);
        expectArgs(spy, 1, [
          ['render'],
        ]);

        result.setState({ name: 'bar' });
        expect(result.state('count')).to.equal(1);
        expectArgs(spy, 2, [
          ['componentWillUpdate'],
          ['render'],
          ['componentWillUpdate'],
          ['render'],
        ]);
      });

      itIf(!isShallow || BATCHING, 'provokes another render to call setState twice in componentDidUpdate', () => {
        class Foo extends React.Component {
          constructor(props) {
            super(props);
            this.updated = false;
            this.state = {
              name: 'foo',
              count: 0,
            };
          }

          componentDidUpdate() {
            spy('componentDidUpdate');
            if (!this.updated) {
              this.updated = true;
              /* eslint-disable react/no-did-update-set-state, react/destructuring-assignment */
              this.setState({ count: this.state.count + 1 });
              this.setState({ count: this.state.count + 1 });
              /* eslint-enable react/no-did-update-set-state, react/destructuring-assignment */
            }
          }

          render() {
            spy('render');
            const { name } = this.state;
            return <div>{name}</div>;
          }
        }
        const result = Wrap(<Foo />);
        expectArgs(spy, 1, [
          ['render'],
        ]);

        result.setState({ name: 'bar' });
        expect(result.state('count')).to.equal(1);
        expectArgs(spy, 2, [
          ['render'],
          ['componentDidUpdate'],
          ['render'],
          ['componentDidUpdate'],
        ]);
      });
    });

    context('updating context', () => {
      it('calls shouldComponentUpdate, componentWillUpdate and componentDidUpdate', () => {
        class Foo extends React.Component {
          constructor(...args) {
            super(...args);
            this.state = {
              foo: 'state',
            };
          }

          shouldComponentUpdate(nextProps, nextState, nextContext) {
            spy('shouldComponentUpdate', this.props, nextProps, this.state, nextState, nextContext);
            return true;
          }

          componentWillUpdate(nextProps, nextState, nextContext) {
            spy('componentWillUpdate', this.props, nextProps, this.state, nextState, nextContext);
          }

          componentDidUpdate(prevProps, prevState, prevContext) {
            spy('componentDidUpdate', prevProps, this.props, prevState, this.state, prevContext);
          }

          render() {
            spy('render');
            const { foo } = this.state;
            return <div>{foo}</div>;
          }
        }
        Foo.contextTypes = {
          foo: PropTypes.string,
        };
        const wrapper = Wrap(
          <Foo foo="props" />,
          {
            context: { foo: 'bar' },
          },
        );
        expect(wrapper.instance().context.foo).to.equal('bar');
        expectArgs(spy, 1, [
          ['render'],
        ]);

        wrapper.setContext({ foo: 'baz' });
        expect(wrapper.instance().context.foo).to.equal('baz');
        expectArgs(spy, 2, [
          [
            'shouldComponentUpdate',
            { foo: 'props' }, { foo: 'props' },
            { foo: 'state' }, { foo: 'state' },
            { foo: 'baz' },
          ],
          [
            'componentWillUpdate',
            { foo: 'props' }, { foo: 'props' },
            { foo: 'state' }, { foo: 'state' },
            { foo: 'baz' },
          ],
          ['render'],
          [
            'componentDidUpdate',
            { foo: 'props' }, { foo: 'props' },
            { foo: 'state' }, { foo: 'state' },
            is('>= 16') ? undefined : { foo: 'bar' },
          ],
        ]);
      });

      it('cancels rendering when Component returns false in shouldComponentUpdate', () => {
        class Foo extends React.Component {
          shouldComponentUpdate() {
            spy('shouldComponentUpdate');
            return false;
          }

          componentWillUpdate() {
            spy('componentWillUpdate');
          }

          componentDidUpdate() {
            spy('componentDidUpdate');
          }

          render() {
            spy('render');
            return <div>foo</div>;
          }
        }
        Foo.contextTypes = {
          foo: PropTypes.string,
        };
        const wrapper = Wrap(
          <Foo />,
          {
            context: { foo: 'bar' },
          },
        );
        expectArgs(spy, 1, [
          ['render'],
        ]);

        wrapper.setContext({ foo: 'baz' });

        expectArgs(spy, 2, [
          ['shouldComponentUpdate'],
        ]);
      });

      itIf(!isShallow || BATCHING, 'provokes another render to call setState twice in componentWillUpdate', () => {
        class Foo extends React.Component {
          constructor(props) {
            super(props);
            this.updated = false;
            this.state = {
              count: 0,
            };
          }

          componentWillUpdate() {
            spy('componentWillUpdate');
            if (!this.updated) {
              this.updated = true;
              /* eslint-disable react/destructuring-assignment */
              this.setState({ count: this.state.count + 1 });
              this.setState({ count: this.state.count + 1 });
              /* eslint-enable react/destructuring-assignment */
            }
          }

          render() {
            spy('render');
            const { name } = this.state;
            return <div>{name}</div>;
          }
        }
        const result = Wrap(
          <Foo />,
          {
            context: { foo: 'bar' },
          },
        );
        expectArgs(spy, 1, [
          ['render'],
        ]);

        result.setContext({ foo: 'baz' });
        expect(result.state('count')).to.equal(1);
        expectArgs(spy, 2, [
          ['componentWillUpdate'],
          ['render'],
          ['componentWillUpdate'],
          ['render'],
        ]);
      });

      itIf(!isShallow || BATCHING, 'provokes an another render to call setState twice in componentDidUpdate', () => {
        class Foo extends React.Component {
          constructor(props) {
            super(props);
            this.updated = false;
            this.state = {
              count: 0,
            };
          }

          componentDidUpdate() {
            spy('componentDidUpdate');
            if (!this.updated) {
              this.updated = true;
              /* eslint-disable react/no-did-update-set-state, react/destructuring-assignment */
              this.setState({ count: this.state.count + 1 });
              this.setState({ count: this.state.count + 1 });
              /* eslint-enable react/no-did-update-set-state, react/destructuring-assignment */
            }
          }

          render() {
            spy('render');
            const { name } = this.state;
            return <div>{name}</div>;
          }
        }
        const result = Wrap(
          <Foo />,
          {
            context: { foo: 'bar' },
          },
        );
        expectArgs(spy, 1, [
          ['render'],
        ]);

        result.setContext({ foo: 'baz' });
        expect(result.state('count')).to.equal(1);
        expectArgs(spy, 2, [
          ['render'],
          ['componentDidUpdate'],
          ['render'],
          ['componentDidUpdate'],
        ]);
      });
    });
  });
}
