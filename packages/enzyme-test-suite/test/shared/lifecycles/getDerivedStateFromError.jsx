import React from 'react';
import sinon from 'sinon-sandbox';
import { expect } from 'chai';

import { is } from '../../_helpers/version';
import {
  describeIf,
  itIf,
} from '../../_helpers';
import {
  Fragment,
} from '../../_helpers/react-compat';

export default function describeCDC({
  Wrap,
  isShallow,
}) {
  describeIf(is('>= 16.6'), 'getDerivedStateFromError', () => {
    const errorToThrow = new EvalError('threw an error!');
    // in React 16.0 - 16.2 and 16.9+, and some older nodes, the actual error thrown isn't reported.
    const reactError = new Error('An error was thrown inside one of your components, but React doesn\'t know what it was. This is likely due to browser flakiness. React does its best to preserve the "Pause on exceptions" behavior of the DevTools, which requires some DEV-mode only tricks. It\'s possible that these don\'t work in your browser. Try triggering the error in production mode, or switching to a modern browser. If you suspect that this is actually an issue with React, please file an issue.');
    const properErrorMessage = (error) => error instanceof Error && (
      error.message === errorToThrow.message
      || error.message === reactError.message
    );

    describe('errors inside an error boundary', () => {
      function Thrower({ throws }) {
        if (throws) {
          throw errorToThrow;
        }
        return null;
      }

      function getErrorBoundary() {
        return class ErrorBoundary extends React.Component {
          static getDerivedStateFromError() {
            return {
              throws: false,
              didThrow: true,
            };
          }

          constructor(props) {
            super(props);
            this.state = {
              throws: false,
              didThrow: false,
            };
          }

          render() {
            const {
              didThrow,
              throws,
            } = this.state;

            return (
              <div>
                <Fragment>
                  <span>
                    <Thrower throws={throws} />
                    <div>
                      {didThrow ? 'HasThrown' : 'HasNotThrown'}
                    </div>
                  </span>
                </Fragment>
              </div>
            );
          }
        };
      }

      function ErrorSFC({ component }) {
        return component();
      }

      describe('Thrower', () => {
        it('does not throw when `throws` is `false`', () => {
          expect(() => Wrap(<Thrower throws={false} />)).not.to.throw();
        });

        it('throws when `throws` is `true`', () => {
          expect(() => Wrap(<Thrower throws />)).to.throw();
          try {
            Wrap(<Thrower throws />);
            expect(true).to.equal(false, 'this line should not be reached');
          } catch (error) {
            expect(error).to.satisfy(properErrorMessage);
          }
        });
      });

      it('catches a simulated error', () => {
        const ErrorBoundary = getErrorBoundary();

        const spy = sinon.spy(ErrorBoundary, 'getDerivedStateFromError');
        const wrapper = Wrap(<ErrorBoundary />);

        expect(spy).to.have.property('callCount', 0);

        expect(() => wrapper.find(Thrower).simulateError(errorToThrow)).not.to.throw();

        expect(spy).to.have.property('callCount', 1);

        expect(spy.args).to.be.an('array').and.have.lengthOf(1);
        const [[actualError]] = spy.args;
        expect(actualError).to.equal(errorToThrow);
      });

      it('rerenders on a simulated error', () => {
        const ErrorBoundary = getErrorBoundary();

        const wrapper = Wrap(<ErrorBoundary />);

        expect(wrapper.find({ children: 'HasThrown' })).to.have.lengthOf(0);
        expect(wrapper.find({ children: 'HasNotThrown' })).to.have.lengthOf(1);

        expect(() => wrapper.find(Thrower).simulateError(errorToThrow)).not.to.throw();

        expect(wrapper.find({ children: 'HasThrown' })).to.have.lengthOf(1);
        expect(wrapper.find({ children: 'HasNotThrown' })).to.have.lengthOf(0);
      });

      itIf(isShallow, 'does not catch errors during Wrapper render', () => {
        const ErrorBoundary = getErrorBoundary();

        const spy = sinon.spy(ErrorBoundary, 'getDerivedStateFromError');
        const wrapper = Wrap(<ErrorBoundary />);

        expect(spy).to.have.property('callCount', 0);

        wrapper.setState({ throws: true });

        expect(spy).to.have.property('callCount', 0);

        const thrower = wrapper.find(Thrower);
        expect(thrower).to.have.lengthOf(1);
        expect(thrower.props()).to.have.property('throws', true);

        expect(() => thrower.dive()).to.throw(errorToThrow);

        expect(spy).to.have.property('callCount', 0);

        expect(wrapper.find({ children: 'HasThrown' })).to.have.lengthOf(0);
        expect(wrapper.find({ children: 'HasNotThrown' })).to.have.lengthOf(1);
      });

      describeIf(!isShallow, 'descendant components', () => {
        it('rerenders on a simulated error with an SFC root', () => {
          const ErrorBoundary = getErrorBoundary();

          const wrapper = Wrap(<ErrorSFC component={() => <ErrorBoundary />} />);

          expect(wrapper.find({ children: 'HasThrown' })).to.have.lengthOf(0);
          expect(wrapper.find({ children: 'HasNotThrown' })).to.have.lengthOf(1);

          expect(() => wrapper.find(Thrower).simulateError(errorToThrow)).not.to.throw();

          expect(wrapper.find({ children: 'HasThrown' })).to.have.lengthOf(1);
          expect(wrapper.find({ children: 'HasNotThrown' })).to.have.lengthOf(0);
        });

        it('catches errors during render', () => {
          const ErrorBoundary = getErrorBoundary();

          const spy = sinon.spy(ErrorBoundary, 'getDerivedStateFromError');
          const wrapper = Wrap(<ErrorBoundary />);

          expect(spy).to.have.property('callCount', 0);

          wrapper.setState({ throws: true });

          expect(spy).to.have.property('callCount', 1);

          expect(spy.args).to.be.an('array').and.have.lengthOf(1);
          const [[actualError]] = spy.args;
          expect(actualError).to.satisfy(properErrorMessage);
        });

        it('works when the root is an SFC', () => {
          const ErrorBoundary = getErrorBoundary();

          const spy = sinon.spy(ErrorBoundary, 'getDerivedStateFromError');
          const wrapper = Wrap(<ErrorSFC component={() => <ErrorBoundary />} />);

          expect(spy).to.have.property('callCount', 0);

          wrapper.find(ErrorBoundary).setState({ throws: true });

          expect(spy).to.have.property('callCount', 1);

          expect(spy.args).to.be.an('array').and.have.lengthOf(1);
          const [[actualError]] = spy.args;
          expect(actualError).to.satisfy(properErrorMessage);
        });
      });
    });
  });
}
