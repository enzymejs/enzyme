import React from 'react';
import PropTypes from 'prop-types';
import { expect } from 'chai';
import sinon from 'sinon-sandbox';

import {
  sym,
} from 'enzyme/build/Utils';

import {
  describeIf,
  itIf,
} from '../../_helpers';
import { is } from '../../_helpers/version';

export default function describeSetProps({
  Wrap,
  WrapperName,
  isShallow,
}) {
  describe('.setProps(newProps[, callback)', () => {
    class RendersNull extends React.Component {
      render() {
        return null;
      }
    }

    class Foo extends React.Component {
      render() {
        const { id, foo } = this.props;
        return (
          <div className={id}>
            {foo}
          </div>
        );
      }
    }

    function FooSFC({ id, foo }) {
      return (
        <div className={id}>
          {foo}
        </div>
      );
    }

    class RendersFoo extends React.Component {
      render() {
        return (
          <main>
            <Foo {...this.props} />
          </main>
        );
      }
    }

    it('throws on a non-function callback', () => {
      const wrapper = Wrap(<RendersNull />);

      expect(() => wrapper.setProps({}, undefined)).to.throw();
      expect(() => wrapper.setProps({}, null)).to.throw();
      expect(() => wrapper.setProps({}, false)).to.throw();
      expect(() => wrapper.setProps({}, true)).to.throw();
      expect(() => wrapper.setProps({}, [])).to.throw();
      expect(() => wrapper.setProps({}, {})).to.throw();
    });

    it('throws when not called on the root', () => {
      const wrapper = Wrap(<RendersFoo id="a" foo="b" />);
      const child = wrapper.find(Foo);
      expect(child).to.have.lengthOf(1);
      expect(() => child.setProps({})).to.throw(
        Error,
        `${WrapperName}::setProps() can only be called on the root`,
      );
    });

    it('sets props for a component multiple times', () => {
      const wrapper = Wrap(<Foo id="foo" />);
      expect(wrapper.find('.foo')).to.have.lengthOf(1);
      wrapper.setProps({ id: 'bar', foo: 'bla' });
      expect(wrapper.find('.bar')).to.have.lengthOf(1);
    });

    describe('merging props', () => {
      it('merges, not replaces, props when rerendering', () => {
        const wrapper = Wrap(<Foo id="foo" foo="bar" />);
        const rendered = () => (isShallow ? wrapper : wrapper.children());

        const expectedPreDebug = isShallow
          ? `
<div className="foo">
  bar
</div>
        `.trim()
          : `
<Foo id="foo" foo="bar">
  <div className="foo">
    bar
  </div>
</Foo>
        `.trim();
        expect(wrapper.debug()).to.equal(expectedPreDebug);
        expect(rendered().props()).to.eql({
          className: 'foo',
          children: 'bar',
        });
        expect(wrapper.instance().props).to.eql({
          id: 'foo',
          foo: 'bar',
        });

        wrapper.setProps({ id: 'bar' });

        const expectedPostDebug = isShallow
          ? `
<div className="bar">
  bar
</div>
        `.trim()
          : `
<Foo id="bar" foo="bar">
  <div className="bar">
    bar
  </div>
</Foo>
        `.trim();
        expect(wrapper.debug()).to.equal(expectedPostDebug);
        expect(rendered().props()).to.eql({
          className: 'bar',
          children: 'bar',
        });
        expect(wrapper.instance().props).to.eql({
          id: 'bar',
          foo: 'bar',
        });
      });

      itIf(is('> 0.13'), 'merges, not replaces, props on SFCs', () => {
        const wrapper = Wrap(<FooSFC id="foo" foo="bar" />);
        const rendered = () => (isShallow ? wrapper : wrapper.children());

        const expectedPreDebug = isShallow
          ? `
<div className="foo">
  bar
</div>
        `.trim()
          : `
<FooSFC id="foo" foo="bar">
  <div className="foo">
    bar
  </div>
</FooSFC>
        `.trim();
        expect(wrapper.debug()).to.equal(expectedPreDebug);
        expect(rendered().props()).to.eql({
          className: 'foo',
          children: 'bar',
        });
        if (is('< 16')) {
          expect(wrapper.instance().props).to.eql({
            id: 'foo',
            foo: 'bar',
          });
        }

        wrapper.setProps({ id: 'bar' });

        const expectedPostDebug = isShallow
          ? `
<div className="bar">
  bar
</div>
        `.trim()
          : `
<FooSFC id="bar" foo="bar">
  <div className="bar">
    bar
  </div>
</FooSFC>
        `.trim();
        expect(wrapper.debug()).to.equal(expectedPostDebug);
        expect(rendered().props()).to.eql({
          className: 'bar',
          children: 'bar',
        });
        if (is('< 16')) {
          expect(wrapper.instance().props).to.eql({
            id: 'bar',
            foo: 'bar',
          });
        }
      });

      it('merges, not replaces, props when no rerender is needed', () => {
        class FooNoUpdate extends React.Component {
          shouldComponentUpdate() {
            return false;
          }

          render() {
            const { id, foo } = this.props;
            return (
              <div className={id}>
                {foo}
              </div>
            );
          }
        }
        const wrapper = Wrap(<FooNoUpdate id="foo" foo="bar" />);
        const rendered = () => (isShallow ? wrapper : wrapper.children());

        const expectedPreDebug = isShallow
          ? `
<div className="foo">
  bar
</div>
          `.trim()
          : `
<FooNoUpdate id="foo" foo="bar">
  <div className="foo">
    bar
  </div>
</FooNoUpdate>
          `.trim();
        expect(wrapper.debug()).to.equal(expectedPreDebug);
        expect(rendered().props()).to.eql({
          className: 'foo',
          children: 'bar',
        });
        expect(wrapper.instance().props).to.eql({
          id: 'foo',
          foo: 'bar',
        });

        wrapper.setProps({ id: 'foo' });

        expect(wrapper.debug()).to.equal(expectedPreDebug);
        expect(rendered().props()).to.eql({
          className: 'foo',
          children: 'bar',
        });
        expect(wrapper.instance().props).to.eql({
          id: 'foo',
          foo: 'bar',
        });
      });
    });

    it('calls componentWillReceiveProps for new renders', () => {
      const stateValue = {};

      class FooWithLifecycles extends React.Component {
        constructor(props) {
          super(props);
          this.state = { stateValue };
        }

        componentWillReceiveProps() {}

        UNSAFE_componentWillReceiveProps() {} // eslint-disable-line camelcase

        render() {
          const { id } = this.props;
          const { stateValue: val } = this.state;
          return (
            <div className={id}>
              {String(val)}
            </div>
          );
        }
      }
      FooWithLifecycles.contextTypes = {
        foo() { return null; },
      };
      const cWRP = sinon.stub(FooWithLifecycles.prototype, 'componentWillReceiveProps');
      // eslint-disable-next-line camelcase
      const U_cWRP = sinon.stub(FooWithLifecycles.prototype, 'UNSAFE_componentWillReceiveProps');

      const nextProps = { id: 'bar', foo: 'bla' };
      const context = { foo: 'bar' };
      const wrapper = Wrap(<FooWithLifecycles id="foo" />, { context });

      expect(cWRP).to.have.property('callCount', 0);
      expect(U_cWRP).to.have.property('callCount', 0);

      wrapper.setProps(nextProps);

      expect(cWRP).to.have.property('callCount', 1);
      expect(cWRP.calledWith(nextProps, context)).to.equal(true);

      if (is('>= 16.3')) {
        expect(U_cWRP).to.have.property('callCount', 1);
        expect(U_cWRP.calledWith(nextProps, context)).to.equal(true);
      }
    });

    it('merges newProps with oldProps', () => {
      class RendersBar extends React.Component {
        render() {
          return (
            <Bar {...this.props} />
          );
        }
      }
      class Bar extends React.Component {
        render() {
          return (
            <div />
          );
        }
      }

      const wrapper = Wrap(<RendersBar a="a" b="b" />);
      expect(wrapper.props().a).to.equal('a');
      expect(wrapper.props().b).to.equal('b');

      wrapper.setProps({ b: 'c', d: 'e' });
      expect(wrapper.props().a).to.equal('a');
      expect(wrapper.props().b).to.equal('c');
      expect(wrapper.props().d).to.equal('e');
    });

    it('passes in old context', () => {
      class HasContextX extends React.Component {
        render() {
          const { x } = this.context;
          return (
            <div>{x}</div>
          );
        }
      }
      HasContextX.contextTypes = { x: PropTypes.string };

      const context = { x: 'yolo' };
      const wrapper = Wrap(<HasContextX x={5} />, { context });
      expect(wrapper.first('div').text()).to.equal('yolo');

      wrapper.setProps({ x: 5 }); // Just force a re-render
      expect(wrapper.first('div').text()).to.equal('yolo');
    });

    it('uses defaultProps if new props includes undefined values', () => {
      const initialState = { a: 42 };
      const context = { b: 7 };
      class HasInitialState extends React.Component {
        constructor(...args) {
          super(...args);
          this.state = initialState;
        }

        componentWillReceiveProps() {}

        render() {
          const { className } = this.props;
          return <div className={className} />;
        }
      }

      const cWRP = sinon.stub(HasInitialState.prototype, 'componentWillReceiveProps');

      HasInitialState.defaultProps = {
        className: 'default-class',
      };
      HasInitialState.contextTypes = {
        b: PropTypes.number,
      };

      const wrapper = Wrap(<HasInitialState className="original" />, { context });

      // Set undefined in order to use defaultProps if any
      wrapper.setProps({ className: undefined });

      expect(cWRP).to.have.property('callCount', 1);
      const [args] = cWRP.args;
      expect(args).to.eql([
        { className: HasInitialState.defaultProps.className },
        context,
      ]);
    });

    it('throws if an exception occurs during render', () => {
      let error;
      class Trainwreck extends React.Component {
        render() {
          const { user } = this.props;
          try {
            return (
              <div>
                {user.name.givenName}
              </div>
            );
          } catch (e) {
            error = e;
            throw e;
          }
        }
      }

      const validUser = {
        name: {
          givenName: 'Brian',
        },
      };

      const wrapper = Wrap(<Trainwreck user={validUser} />);

      expect(() => wrapper.setProps({ user: { name: {} } })).not.to.throw();
      expect(() => wrapper.setProps({ user: {} })).to.throw(error);
    });

    it('calls the callback when setProps has completed', () => {
      const wrapper = Wrap(<Foo id="foo" />);
      expect(wrapper.find('.foo')).to.have.lengthOf(1);

      wrapper[sym('__renderer__')].batchedUpdates(() => {
        wrapper.setProps({ id: 'bar', foo: 'bla' }, () => {
          expect(wrapper.find('.bar')).to.have.lengthOf(1);
        });
      });
      expect(wrapper.find('.foo')).to.have.lengthOf(0);
    });

    it('calls componentWillReceiveProps, shouldComponentUpdate, componentWillUpdate, and componentDidUpdate with merged newProps', () => {
      const spy = sinon.spy();

      class HasLifecycleSpies extends React.Component {
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
          return (<div />);
        }
      }

      const wrapper = Wrap(<HasLifecycleSpies a="a" b="b" />);

      wrapper.setProps({ b: 'c', d: 'e' });

      expect(spy.args).to.deep.equal([
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
        [
          'componentDidUpdate',
          { a: 'a', b: 'b' },
          { a: 'a', b: 'c', d: 'e' },
        ],
      ]);
    });

    describe('setProps does not call componentDidUpdate twice', () => {
      it('when setState is called in cWRP', () => {
        class Dummy extends React.Component {
          constructor(...args) {
            super(...args);

            this.state = {
              someState: '',
            };
          }

          componentWillReceiveProps({ myProp: someState }) {
            this.setState({ someState });
          }

          componentDidUpdate() {}

          render() {
            const { myProp } = this.props;
            const { someState } = this.state;
            return (
              <div>
                myProp: {myProp}
                someState: {someState}
              </div>
            );
          }
        }

        const spy = sinon.spy(Dummy.prototype, 'componentDidUpdate');
        const wrapper = Wrap(<Dummy />);
        expect(spy).to.have.property('callCount', 0);
        return new Promise((resolve) => {
          wrapper.setProps({ myProp: 'Prop Value' }, resolve);
        }).then(() => {
          expect(spy).to.have.property('callCount', 1);
        });
      });
    });

    describeIf(is('> 0.13'), 'stateless function components (SFCs)', () => {
      it('sets props for a component multiple times', () => {
        const wrapper = Wrap(<FooSFC id="foo" />);
        expect(wrapper.find('.foo')).to.have.lengthOf(1);
        wrapper.setProps({ id: 'bar', foo: 'bla' });
        expect(wrapper.find('.bar')).to.have.lengthOf(1);
      });

      it('merges newProps with oldProps', () => {
        const RendersBarSFC = props => (
          <BarSFC {...props} />
        );
        const BarSFC = () => (
          <div />
        );

        const wrapper = Wrap(<RendersBarSFC a="a" b="b" />);
        expect(wrapper.props().a).to.equal('a');
        expect(wrapper.props().b).to.equal('b');

        wrapper.setProps({ b: 'c', d: 'e' });
        expect(wrapper.props().a).to.equal('a');
        expect(wrapper.props().b).to.equal('c');
        expect(wrapper.props().d).to.equal('e');
      });

      it('passes in old context', () => {
        const HasContextXSFC = (props, { x }) => (
          <div>{x}</div>
        );
        HasContextXSFC.contextTypes = { x: PropTypes.string };

        const context = { x: 'yolo' };
        const wrapper = Wrap(<HasContextXSFC x={5} />, { context });
        expect(wrapper.first('div').text()).to.equal('yolo');

        wrapper.setProps({ x: 5 }); // Just force a re-render
        expect(wrapper.first('div').text()).to.equal('yolo');
      });

      it('throws if an exception occurs during render', () => {
        let error;
        const Trainwreck = ({ user }) => {
          try {
            return (
              <div>
                {user.name.givenName}
              </div>
            );
          } catch (e) {
            error = e;
            throw e;
          }
        };

        const validUser = {
          name: {
            givenName: 'Brian',
          },
        };

        const wrapper = Wrap(<Trainwreck user={validUser} />);

        expect(() => wrapper.setProps({ user: { name: {} } })).not.to.throw();
        expect(() => wrapper.setProps({ user: {} })).to.throw(error);
      });
    });
  });
}
