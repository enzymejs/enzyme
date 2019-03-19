import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon-sandbox';

import {
  describeIf,
  itIf,
} from '../../_helpers';
import { is } from '../../_helpers/version';

// some React versions pass undefined as an argument of setState callback.
const CALLING_SETSTATE_CALLBACK_WITH_UNDEFINED = is('^15.5');

export default function describeSetState({
  Wrap,
  WrapperName,
  isShallow,
}) {
  describe('.setState(newState[, callback])', () => {
    class HasIDState extends React.Component {
      constructor(props) {
        super(props);
        this.state = { id: 'foo' };
      }

      componentDidUpdate() {}

      setBadState() {
        this.setState({}, 1);
      }

      render() {
        const { id } = this.state;
        return (
          <div className={id} />
        );
      }
    }

    class HasMountedState extends React.Component {
      constructor(props) {
        super(props);
        this.state = { mounted: false };
      }

      componentDidMount() {
        this.setState({ mounted: true });
      }

      render() {
        const { mounted } = this.state;
        return <div>{mounted ? 'a' : 'b'}</div>;
      }
    }

    class RendersNull extends React.Component {
      render() {
        return null;
      }
    }

    it('throws on a non-function callback', () => {
      const wrapper = Wrap(<RendersNull />);

      expect(() => wrapper.setState({}, undefined)).to.throw();
      expect(() => wrapper.setState({}, null)).to.throw();
      expect(() => wrapper.setState({}, false)).to.throw();
      expect(() => wrapper.setState({}, true)).to.throw();
      expect(() => wrapper.setState({}, [])).to.throw();
      expect(() => wrapper.setState({}, {})).to.throw();
    });

    it('sets the state of the root node', () => {
      const wrapper = Wrap(<HasIDState />);
      expect(wrapper.find('.foo')).to.have.lengthOf(1);
      wrapper.setState({ id: 'bar' });
      expect(wrapper.find('.bar')).to.have.lengthOf(1);
    });

    it('allows setState inside of componentDidMount', () => {
      const wrapper = Wrap(<HasMountedState />);
      expect(wrapper.find('div').text()).to.equal('a');
    });

    it('calls the callback when setState has completed', () => {
      const wrapper = Wrap(<HasIDState />);
      expect(wrapper.state()).to.eql({ id: 'foo' });
      return new Promise((resolve) => {
        wrapper.setState({ id: 'bar' }, function callback(...args) {
          expect(wrapper.state()).to.eql({ id: 'bar' });
          expect(this).to.equal(wrapper.instance());
          expect(this.state).to.eql({ id: 'bar' });
          expect(wrapper.find('div').prop('className')).to.equal('bar');
          expect(args).to.eql(CALLING_SETSTATE_CALLBACK_WITH_UNDEFINED ? [undefined] : []);
          resolve();
        });
      });
    });

    it('prevents the update if nextState is null or undefined', () => {
      const wrapper = Wrap(<HasIDState />);
      const spy = sinon.spy(wrapper.instance(), 'componentDidUpdate');
      const callback = sinon.spy();
      wrapper.setState(() => ({ id: 'bar' }), callback);
      expect(spy).to.have.property('callCount', 1);
      expect(callback).to.have.property('callCount', 1);

      wrapper.setState(() => null, callback);
      expect(spy).to.have.property('callCount', is('>= 16') ? 1 : 2);
      expect(callback).to.have.property('callCount', 2);

      wrapper.setState(() => undefined, callback);
      expect(spy).to.have.property('callCount', is('>= 16') ? 1 : 3);
      expect(callback).to.have.property('callCount', 3);
    });

    itIf(is('>= 16'), 'prevents an infinite loop if nextState is null or undefined from setState in CDU', () => {
      let payload;
      const stub = sinon.stub(HasIDState.prototype, 'componentDidUpdate')
        .callsFake(function componentDidUpdate() { this.setState(() => payload); });

      const wrapper = Wrap(<HasIDState />);

      wrapper.setState(() => ({ id: 'bar' }));
      expect(stub).to.have.property('callCount', 1);

      payload = null;
      wrapper.setState(() => ({ id: 'bar' }));
      expect(stub).to.have.property('callCount', 2);
    });

    describe('does not call componentWillReceiveProps after setState is called', () => {
      it('does not call componentWillReceiveProps upon rerender', () => {
        class A extends React.Component {
          constructor(props) {
            super(props);

            this.state = { a: 0 };
          }

          componentWillReceiveProps() {
            this.setState({ a: 1 });
          }

          render() {
            const { a } = this.state;
            return (<div>{a}</div>);
          }
        }
        const spy = sinon.spy(A.prototype, 'componentWillReceiveProps');

        const wrapper = Wrap(<A />, { disableLifecycleMethods: true });

        wrapper.setState({ a: 2 });
        expect(wrapper.state('a')).to.equal(2);

        expect(spy).to.have.property('callCount', 0);
        wrapper.setProps({});
        expect(spy).to.have.property('callCount', 1);
        expect(wrapper.state('a')).to.equal(1);

        return new Promise((resolve) => {
          wrapper.setState({ a: 3 }, resolve);
        }).then(() => {
          expect(spy).to.have.property('callCount', 1);
          expect(wrapper.state('a')).to.equal(3);
        });
      });

      it('does not call componentWillReceiveProps with multiple keys in props', () => {
        class B extends React.Component {
          constructor(props) {
            super(props);
            this.state = { a: 0, b: 1 };
          }

          componentWillReceiveProps() {
            this.setState({ b: 0, a: 1 });
          }

          render() {
            const { a, b } = this.state;
            return (
              <div>
                {a + b}
              </div>
            );
          }
        }
        const spy = sinon.spy(B.prototype, 'componentWillReceiveProps');

        const wrapper = Wrap(<B />, { disableLifecycleMethods: true });

        wrapper.setState({ a: 2 });
        expect(wrapper.state('a')).to.equal(2);
        expect(wrapper.state('b')).to.equal(1);

        expect(spy).to.have.property('callCount', 0);
        wrapper.setProps({});
        expect(spy).to.have.property('callCount', 1);
        expect(wrapper.state('a')).to.equal(1);

        return Promise.all([
          new Promise((resolve) => { wrapper.setState({ b: 5 }, resolve); }),
          new Promise((resolve) => { wrapper.setState({ a: 10 }, resolve); }),
        ]).then(() => {
          expect(spy).to.have.property('callCount', 1);
          expect(wrapper.state('b')).to.equal(5);
          expect(wrapper.state('a')).to.equal(10);
        });
      });
    });

    describeIf(is('> 0.13'), 'stateless function components (SFCs)', () => {
      it('throws when trying to access state', () => {
        const Foo = () => (
          <div>abc</div>
        );

        const wrapper = Wrap(<Foo />);

        expect(() => wrapper.state()).to.throw(
          Error,
          `${WrapperName}::state() can only be called on class components`,
        );
      });

      it('throws when trying to set state', () => {
        const Foo = () => (
          <div>abc</div>
        );

        const wrapper = Wrap(<Foo />);

        expect(() => wrapper.setState({ a: 1 })).to.throw(
          Error,
          `${WrapperName}::setState() can only be called on class components`,
        );
      });
    });

    it('throws an error when cb is not a function', () => {
      const wrapper = Wrap(<HasIDState />);
      expect(wrapper.state()).to.eql({ id: 'foo' });
      expect(() => wrapper.setState({ id: 'bar' }, 1)).to.throw(Error);
      expect(() => wrapper.instance().setBadState()).to.throw(Error);
    });

    it('does not throw with a null/undefined callback', () => {
      class Foo extends React.Component {
        constructor() {
          super();

          this.state = {};
        }

        setStateWithNullishCallback() {
          this.setState({}, null);
          this.setState({}, undefined);
        }

        render() {
          return null;
        }
      }

      const wrapper = Wrap(<Foo />);
      expect(() => wrapper.instance().setStateWithNullishCallback()).not.to.throw();
    });

    it('preserves the receiver', () => {
      class Comp extends React.Component {
        constructor(...args) {
          super(...args);

          this.state = {
            key: '',
          };

          this.instanceFunction = () => this.setState(() => ({ key: 'value' }));
        }

        componentDidMount() {
          this.instanceFunction();
        }

        render() {
          const { key } = this.state;
          // FIXME: is this right?
          return key ? null : null;
        }
      }

      expect(Wrap(<Comp />).debug()).to.equal(isShallow ? '' : '<Comp />');
    });

    describe('child components', () => {
      class Child extends React.Component {
        constructor(...args) {
          super(...args);
          this.state = { state: 'a' };
        }

        render() {
          const { prop } = this.props;
          const { state } = this.state;
          return (
            <div>
              {prop} - {state}
            </div>
          );
        }
      }

      class Parent extends React.Component {
        constructor(...args) {
          super(...args);
          this.state = { childProp: 1 };
        }

        render() {
          const { childProp } = this.state;
          return <Child prop={childProp} />;
        }
      }

      it('sets the state of a stateful root', () => {
        const wrapper = Wrap(<Parent />);

        const expectedDebug = isShallow
          ? '<Child prop={1} />'
          : `<Parent>
  <Child prop={1}>
    <div>
      1
       -${' '}
      a
    </div>
  </Child>
</Parent>`;
        expect(wrapper.debug()).to.equal(expectedDebug);

        return new Promise((resolve) => {
          wrapper.setState({ childProp: 2 }, () => {
            const expectedPostDebug = isShallow
              ? '<Child prop={2} />'
              : `<Parent>
  <Child prop={2}>
    <div>
      2
       -${' '}
      a
    </div>
  </Child>
</Parent>`;
            expect(wrapper.debug()).to.equal(expectedPostDebug);
            resolve();
          });
        });
      });

      itIf(isShallow, 'can not set the state of the stateful child of a stateful root', () => {
        const wrapper = Wrap(<Parent />);

        expect(wrapper.debug()).to.equal('<Child prop={1} />');

        const child = wrapper.find(Child);
        expect(() => child.setState({ state: 'b' })).to.throw(
          Error,
          `${WrapperName}::setState() can only be called on the root`,
        );
      });

      itIf(!isShallow, 'sets the state of the stateful child of a stateful root', () => {
        const wrapper = Wrap(<Parent />);

        expect(wrapper.text().trim()).to.equal('1 - a');

        const child = wrapper.find(Child);
        return new Promise((resolve) => {
          child.setState({ state: 'b' }, () => {
            expect(wrapper.text().trim()).to.equal('1 - b');
            resolve();
          });
        });
      });

      describeIf(is('> 0.13'), 'stateless function components (SFCs)', () => {
        function SFC(props) {
          return <Parent {...props} />;
        }

        itIf(isShallow, 'can not set the state of the stateful child of a stateless root', () => {
          const wrapper = Wrap(<SFC />);

          expect(wrapper.text().trim()).to.equal('<Parent />');

          const child = wrapper.find(Child);
          expect(() => child.setState({ state: 'b' })).to.throw(
            Error,
            `${WrapperName}::setState() can only be called on the root`,
          );
        });

        itIf(!isShallow, 'sets the state of the stateful child of a stateless root', () => {
          const wrapper = Wrap(<SFC />);

          expect(wrapper.text().trim()).to.equal('1 - a');

          const child = wrapper.find(Child);
          return new Promise((resolve) => {
            child.setState({ state: 'b' }, () => {
              expect(wrapper.text().trim()).to.equal('1 - b');
              resolve();
            });
          });
        });
      });
    });
  });
}
