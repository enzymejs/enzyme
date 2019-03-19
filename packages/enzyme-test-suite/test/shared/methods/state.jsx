import React from 'react';
import { expect } from 'chai';

import {
  describeIf,
  itIf,
} from '../../_helpers';
import { is } from '../../_helpers/version';

import {
  createPortal,
} from '../../_helpers/react-compat';

export default function describeState({
  Wrap,
  WrapperName,
  isShallow,
  makeDOMElement,
}) {
  describe('.state([name])', () => {
    class HasFooState extends React.Component {
      constructor(props) {
        super(props);
        this.state = { foo: 'foo' };
      }

      render() {
        const { foo } = this.state;
        return <div>{foo}</div>;
      }
    }

    it('returns the state object', () => {
      const wrapper = Wrap(<HasFooState />);
      expect(wrapper.state()).to.eql({ foo: 'foo' });
    });

    it('returns the current state after state transitions', () => {
      const wrapper = Wrap(<HasFooState />);
      wrapper.setState({ foo: 'bar' });
      expect(wrapper.state()).to.eql({ foo: 'bar' });
    });

    it('allows a state property name be passed in as an argument', () => {
      const wrapper = Wrap(<HasFooState />);
      expect(wrapper.state('foo')).to.equal('foo');
    });

    it('throws on host nodes', () => {
      const wrapper = Wrap(<div><span /></div>);

      expect(() => wrapper.state()).to.throw(Error, `${WrapperName}::state() can only be called on class components`);
    });

    itIf(is('>= 16'), 'throws on Portals', () => {
      const containerDiv = makeDOMElement();
      const portal = createPortal(
        <div />,
        containerDiv,
      );

      const wrapper = Wrap(<div>{portal}</div>);
      expect(() => wrapper.state()).to.throw(Error, `${WrapperName}::state() can only be called on class components`);
    });

    describeIf(is('> 0.13'), 'stateless function components (SFCs)', () => {
      it('throws on SFCs', () => {
        function FooSFC() {
          return <div />;
        }

        const wrapper = Wrap(<FooSFC />);
        expect(() => wrapper.state()).to.throw(Error, `${WrapperName}::state() can only be called on class components`);
      });
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

      it('gets the state of a stateful parent', () => {
        const wrapper = Wrap(<Parent />);

        expect(wrapper.state()).to.eql({ childProp: 1 });
      });

      itIf(isShallow, 'can not get the state of the stateful child of a stateful root', () => {
        const wrapper = Wrap(<Parent />);

        const child = wrapper.find(Child);
        expect(() => child.state()).to.throw(Error, `${WrapperName}::state() can only be called on the root`);
      });

      itIf(!isShallow, 'gets the state of the stateful child of a stateful root', () => {
        const wrapper = Wrap(<Parent />);

        const child = wrapper.find(Child);
        expect(child.state()).to.eql({ state: 'a' });
      });

      describeIf(is('> 0.13'), 'stateless function components (SFCs)', () => {
        function StatelessParent(props) {
          return <Child {...props} />;
        }

        itIf(isShallow, 'can not get the state of the stateful child of a stateless root', () => {
          const wrapper = Wrap(<StatelessParent />);

          const child = wrapper.find(Child);
          expect(() => child.state()).to.throw(Error, `${WrapperName}::state() can only be called on the root`);
        });

        itIf(!isShallow, 'gets the state of the stateful child of a stateless root', () => {
          const wrapper = Wrap(<StatelessParent />);

          const child = wrapper.find(Child);
          expect(child.state()).to.eql({ state: 'a' });
        });
      });
    });
  });
}
