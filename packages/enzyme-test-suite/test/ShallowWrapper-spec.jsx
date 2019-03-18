import React from 'react';
import PropTypes from 'prop-types';
import { expect } from 'chai';
import sinon from 'sinon';
import wrap from 'mocha-wrap';
import isEqual from 'lodash.isequal';
import getData from 'html-element-map/getData';
import {
  shallow,
  render,
  ShallowWrapper,
} from 'enzyme';
import shallowEntry from 'enzyme/shallow';
import ShallowWrapperEntry from 'enzyme/ShallowWrapper';
import {
  ITERATOR_SYMBOL,
  withSetStateAllowed,
  sym,
} from 'enzyme/build/Utils';
import getAdapter from 'enzyme/build/getAdapter';
import {
  Portal,
} from 'react-is';

import './_helpers/setupAdapters';
import {
  createClass,
  createContext,
  createPortal,
  createRef,
  Fragment,
  forwardRef,
  memo,
  PureComponent,
  useEffect,
  useState,
} from './_helpers/react-compat';
import {
  describeIf,
  describeWithDOM,
  itIf,
  itWithData,
  generateEmptyRenderData,
} from './_helpers';
import {
  REACT16,
  is,
} from './_helpers/version';
import realArrowFunction from './_helpers/realArrowFunction';
import sloppyReturnThis from './_helpers/untranspiledSloppyReturnThis';

// The shallow renderer in react 16 does not yet support batched updates. When it does,
// we should be able to go un-skip all of the tests that are skipped with this flag.
const BATCHING = !REACT16;

// some React versions pass undefined as an argument of setState callback.
const CALLING_SETSTATE_CALLBACK_WITH_UNDEFINED = is('^15.5');

const getElementPropSelector = prop => x => x.props[prop];
const getWrapperPropSelector = prop => x => x.prop(prop);

describe('shallow', () => {
  describe('top level entry points', () => {
    expect(shallowEntry).to.equal(shallow);
    expect(ShallowWrapperEntry).to.equal(ShallowWrapper);
  });

  describe('top level wrapper', () => {
    it('does what i expect', () => {
      class Box extends React.Component {
        render() {
          return <div className="box">{this.props.children}</div>;
        }
      }
      class Foo extends React.Component {
        render() {
          return (
            <Box bam>
              <div className="div" />
            </Box>
          );
        }
      }

      const wrapper = shallow(<Foo bar />);

      expect(wrapper.type()).to.equal(Box);
      expect(wrapper.props().bam).to.equal(true);
      expect(wrapper.instance()).to.be.instanceOf(Foo);
      expect(wrapper.children().at(0).type()).to.equal('div');
      expect(wrapper.find(Box).children().props().className).to.equal('div');
      expect(wrapper.find(Box).children().at(0).props().className).to.equal('div');
      expect(wrapper.find(Box).children().props().className).to.equal('div');
      expect(wrapper.children().type()).to.equal('div');
      expect(wrapper.children().props().bam).to.equal(undefined);
    });

    it('works with numeric literals', () => {
      const wrapper = shallow(<div>{50}</div>);
      expect(wrapper.debug()).to.equal(`<div>
  50
</div>`);
    });

    describe('wrapping invalid elements', () => {
      it('throws with combined dangerouslySetInnerHTML and children on host nodes', () => {
        /* eslint react/no-danger-with-children: 0 */
        expect(() => shallow((
          <div dangerouslySetInnerHTML={{ __html: '{}' }}>child</div>
        ))).to.throw(Error, 'Can only set one of `children` or `props.dangerouslySetInnerHTML`.');
      });

      itIf(is('>= 16'), 'throws when shallow rendering Portals', () => {
        const portal = createPortal(
          <div />,
          { nodeType: 1 },
        );

        expect(() => shallow(portal)).to.throw(
          Error,
          'ShallowWrapper can only wrap valid elements',
        );
      });

      it('throws when shallow rendering plain text', () => {
        expect(() => shallow('Foo')).to.throw(
          Error,
          'ShallowWrapper can only wrap valid elements',
        );
      });

      it('throws when shallow rendering multiple elements', () => {
        expect(() => shallow([<div />])).to.throw(
          TypeError,
          'ShallowWrapper can only wrap valid elements',
        );
      });
    });

    it('shallow renders built in components', () => {
      expect(() => shallow(<div />)).not.to.throw();
    });

    it('shallow renders composite components', () => {
      class Foo extends React.Component {
        render() {
          return <div />;
        }
      }

      expect(() => shallow(<Foo />)).not.to.throw();
    });

    it('starts out with undefined state', () => {
      class Foo extends React.Component {
        render() {
          return (
            <div>
              {typeof this.state}
              {JSON.stringify(this.state)}
            </div>
          );
        }
      }

      const wrapper = shallow(<Foo />);
      expect(wrapper.state()).to.equal(null);
      expect(wrapper.debug()).to.equal(`
<div>
  object
  null
</div>
      `.trim());
      expect(() => wrapper.state('key')).to.throw('ShallowWrapper::state("key") requires that `state` not be `null` or `undefined`');
    });
  });

  describe('context', () => {
    it('can pass in context', () => {
      const SimpleComponent = createClass({
        contextTypes: {
          name: PropTypes.string,
        },
        render() {
          return <div>{this.context.name}</div>;
        },
      });

      const context = { name: 'foo' };
      const wrapper = shallow(<SimpleComponent />, { context });
      expect(wrapper.text()).to.equal('foo');
    });

    it('does not throw if context is passed in but contextTypes is missing', () => {
      const SimpleComponent = createClass({
        render() {
          return <div>{this.context.name}</div>;
        },
      });

      const context = { name: 'foo' };
      expect(() => shallow(<SimpleComponent />, { context })).to.not.throw();
    });

    it('is introspectable through context API', () => {
      const SimpleComponent = createClass({
        contextTypes: {
          name: PropTypes.string,
        },
        render() {
          return <div>{this.context.name}</div>;
        },
      });

      const context = { name: 'foo' };
      const wrapper = shallow(<SimpleComponent />, { context });

      expect(wrapper.context().name).to.equal(context.name);
      expect(wrapper.context('name')).to.equal(context.name);
    });

    itIf(is('>= 16.3'), 'finds elements through Context elements', () => {
      const { Provider, Consumer } = createContext('');

      class Consumes extends React.Component {
        render() {
          return (
            <span>
              <Consumer>{value => <span>{value}</span>}</Consumer>
            </span>
          );
        }
      }

      class Provides extends React.Component {
        render() {
          return (
            <Provider value="foo"><div><Consumes /></div></Provider>
          );
        }
      }

      expect(shallow(<Consumes />).find('span')).to.have.lengthOf(1);
      expect(shallow(<Provides />).find(Consumes)).to.have.lengthOf(1);
    });

    itIf(is('>= 16.3'), 'finds elements through forwarded refs elements', () => {
      const SomeComponent = forwardRef((props, ref) => (
        <div ref={ref}>
          <span className="child1" />
          <span className="child2" />
        </div>
      ));

      const wrapper = shallow(<SomeComponent />);

      expect(wrapper.find('.child2')).to.have.lengthOf(1);
    });

    describeIf(is('> 0.13'), 'stateless function components (SFCs)', () => {
      it('can pass in context', () => {
        const SimpleComponent = (props, context) => (
          <div>{context.name}</div>
        );
        SimpleComponent.contextTypes = { name: PropTypes.string };

        const context = { name: 'foo' };
        const wrapper = shallow(<SimpleComponent />, { context });
        expect(wrapper.text()).to.equal('foo');
      });

      it('does not throw if context is passed in but contextTypes is missing', () => {
        const SimpleComponent = (props, context) => (
          <div>{context.name}</div>
        );

        const context = { name: 'foo' };
        expect(() => shallow(<SimpleComponent />, { context })).not.to.throw();
      });

      itIf(is('< 16'), 'is introspectable through context API', () => {
        const SimpleComponent = (props, context) => (
          <div>{context.name}</div>
        );
        SimpleComponent.contextTypes = { name: PropTypes.string };

        const wrapper = shallow(<SimpleComponent />, { context });

        expect(wrapper.context().name).to.equal(context.name);
        expect(wrapper.context('name')).to.equal(context.name);
      });

      itIf(is('>= 16'), 'is not introspectable through context API', () => {
        const SimpleComponent = (props, context) => (
          <div>{context.name}</div>
        );
        SimpleComponent.contextTypes = { name: PropTypes.string };

        const wrapper = shallow(<SimpleComponent />, { context });

        expect(() => wrapper.context()).to.throw(
          Error,
          'ShallowWrapper::context() can only be called on wrapped nodes that have a non-null instance',
        );
        expect(() => wrapper.context('name')).to.throw(
          Error,
          'ShallowWrapper::context() can only be called on wrapped nodes that have a non-null instance',
        );
      });
    });

    describe('getChildContext()', () => {
      class FooProvider extends React.Component {
        getChildContext() {
          const { value } = this.props;
          return { foo: value };
        }

        render() {
          const { children } = this.props;
          return children;
        }
      }
      FooProvider.childContextTypes = {
        foo: PropTypes.string,
      };

      class BarProvider extends React.Component {
        constructor(...args) {
          super(...args);

          this.state = { value: 'love' };
        }

        getChildContext() {
          const { value } = this.state;
          return { bar: value };
        }

        render() {
          const { children } = this.props;
          return children;
        }
      }
      BarProvider.childContextTypes = {
        bar: PropTypes.string,
      };

      class FooBarBazConsumer extends React.Component {
        render() {
          return <div />;
        }
      }
      FooBarBazConsumer.contextTypes = {
        foo: PropTypes.string,
        bar: PropTypes.string,
        baz: PropTypes.string,
      };

      class TestComponent extends React.Component {
        render() {
          return (
            <FooProvider value="i">
              <BarProvider>
                <FooBarBazConsumer />
              </BarProvider>
            </FooProvider>
          );
        }
      }

      let fooProviderSpy;
      let barProviderSpy;
      beforeEach(() => {
        fooProviderSpy = sinon.spy(FooProvider.prototype, 'getChildContext');
        barProviderSpy = sinon.spy(BarProvider.prototype, 'getChildContext');
      });
      afterEach(() => {
        fooProviderSpy.restore();
        barProviderSpy.restore();
      });

      describeIf(is('<= 0.13'), 'owner-based context', () => {
        it('is not implemented', () => {
          const wrapper = shallow(<TestComponent />, { context: { baz: 'enzyme' } });

          const fooProvider = wrapper.find(FooProvider).dive();
          const barProvider = fooProvider.find(BarProvider).dive();
          const consumer = barProvider.find(FooBarBazConsumer).dive();

          const expectedContext = { baz: 'enzyme', foo: undefined, bar: undefined };
          expect(consumer.context()).to.eql(expectedContext);
        });
      });

      describeIf(is('>= 0.14'), 'parent-based context', () => {
        const adapter = getAdapter();
        const {
          createShallowRenderer: realCreateShallowRenderer,
          options: realAdapterOptions,
        } = adapter;

        wrap()
          .withOverride(() => adapter, 'options', () => {
            const {
              legacyContextMode, // omit legacyContextMode
              lifecycles: {
                getChildContext, // omit getChildContext
                ...lifecycles
              },
              ...options
            } = realAdapterOptions;

            return {
              ...options,
              lifecycles,
            };
          })
          .describe('with older adapters', () => {
            it('still supports the context option', () => {
              const wrapper = shallow(<TestComponent />, { context: { baz: 'enzyme' } });

              const fooProvider = wrapper.find(FooProvider).dive();
              const barProvider = fooProvider.find(BarProvider).dive();
              const consumer = barProvider.find(FooBarBazConsumer).dive();

              const expectedContext = { baz: 'enzyme', foo: undefined, bar: undefined };
              expect(consumer.context()).to.eql(expectedContext);
            });
          });

        it('is called on mount', () => {
          const wrapper = shallow(<TestComponent />, { context: { baz: 'enzyme' } });

          const fooProvider = wrapper.find(FooProvider).dive();
          const barProvider = fooProvider.find(BarProvider).dive();
          const consumer = barProvider.find(FooBarBazConsumer).dive();

          const expectedContext = { foo: 'i', bar: 'love', baz: 'enzyme' };
          expect(consumer.context()).to.eql(expectedContext);

          expect(fooProviderSpy).to.have.property('callCount', 1);
        });

        it('is called when the component re-renders', () => {
          const wrapper = shallow(<TestComponent />, { context: { baz: 'enzyme' } });
          const fooProvider = wrapper.find(FooProvider).dive();
          fooProvider.setProps({ value: 'we' });

          const barProvider = fooProvider.find(BarProvider).dive();
          barProvider.setState({ value: 'like' });

          const consumer = barProvider.find(FooBarBazConsumer).dive();

          expect(fooProviderSpy).to.have.property('callCount', 2);
          expect(barProviderSpy).to.have.property('callCount', 2);

          const expectedContext = { foo: 'we', bar: 'like', baz: 'enzyme' };
          expect(consumer.context()).to.eql(expectedContext);
        });

        it('does nothing if disableLifecycleMethods is true', () => {
          const wrapper = shallow(<TestComponent />, {
            context: { baz: 'enzyme' },
            disableLifecycleMethods: true,
          });
          const fooProvider = wrapper.find(FooProvider).dive();

          const consumer = () => {
            const barProvider = fooProvider.find(BarProvider).dive();
            return barProvider.find(FooBarBazConsumer).dive();
          };

          const expectedContext = { baz: 'enzyme', foo: undefined, bar: undefined };
          expect(consumer().context()).to.eql(expectedContext);

          fooProvider.setProps({ value: 'we' });
          expect(consumer().context()).to.eql(expectedContext);
        });

        it('throws like react if a child context is returned and there is no propType', () => {
          class FaultyFooProvider extends React.Component {
            getChildContext() {
              const { value } = this.props;
              return { foo: value };
            }

            render() {
              const { children } = this.props;
              return children;
            }
          }
          FaultyFooProvider.childContextTypes = {};

          expect(() => shallow((
            <FaultyFooProvider value="foo">
              <div />
            </FaultyFooProvider>
          ))).to.throw('FaultyFooProvider.getChildContext(): key "foo" is not defined in childContextTypes');
        });

        it('allows overridding context with the context option', () => {
          const wrapper = shallow(<TestComponent />);

          const fooProvider = wrapper.find(FooProvider).dive();
          const barProvider = fooProvider.find(BarProvider).dive();
          const consumer = barProvider.find(FooBarBazConsumer).dive({ context: { foo: 'you' } });

          const expectedContext = { foo: 'you', bar: undefined, baz: undefined };
          expect(consumer.context()).to.eql(expectedContext);
        });

        wrap()
          .withConsoleThrows()
          .it('warns if childContextTypes is not defined', () => {
            class FaultyFooProvider extends React.Component {
              getChildContext() {
                const { value } = this.props;
                return {
                  foo: value,
                };
              }

              render() {
                return null;
              }
            }
            expect(() => shallow((
              <FaultyFooProvider />
            ))).to.throw('FaultyFooProvider.getChildContext(): childContextTypes must be defined in order to use getChildContext().');
          });

        wrap()
          .withConsoleThrows()
          .it('checks prop types', () => {
            try {
              shallow(<FooProvider value={1612}><div /></FooProvider>);
              throw new EvalError('shallow() did not throw!');
            } catch (error) {
              expect(error.message).to.contain('`foo` of type `number` supplied to `FooProvider`, expected `string`');
              expect(error.message).to.match(/context/i);
            }
          });

        wrap()
          .withOverride(() => getAdapter(), 'createShallowRenderer', () => (...args) => {
            const renderer = realCreateShallowRenderer(...args);
            delete renderer.checkPropTypes;
            return renderer;
          })
          .it('if the adapter can‘t check propTypes, it works, but does not check prop types', () => {
            expect(() => {
              const wrapper = shallow(<TestComponent />, { context: { baz: 'enzyme' } });
              const fooProvider = wrapper.find(FooProvider).dive();
              const barProvider = fooProvider.find(BarProvider).dive();
              return barProvider.find(FooBarBazConsumer).dive();
            }).not.to.throw();
          });
      });
    });
  });

  describeIf(is('> 0.13'), 'stateless function components (SFCs)', () => {
    it('works with SFCs', () => {
      const Foo = ({ foo }) => (
        <div>
          <div className="bar">bar</div>
          <div className="qoo">{foo}</div>
        </div>
      );
      const wrapper = shallow(<Foo foo="qux" />);
      expect(wrapper.type()).to.equal('div');
      expect(wrapper.find('.bar')).to.have.lengthOf(1);
      expect(wrapper.find('.qoo').text()).to.equal('qux');
    });
  });

  describeIf(is('>= 16'), 'portals', () => {
    it('shows portals in shallow debug tree', () => {
      const Foo = () => (
        <div className="foo">
          {createPortal(
            <div className="in-portal">InPortal</div>,
            { nodeType: 1 },
          )}
        </div>
      );

      const wrapper = shallow(<Foo />);
      expect(wrapper.debug()).to.equal(`<div className="foo">
  <Portal containerInfo={{...}}>
    <div className="in-portal">
      InPortal
    </div>
  </Portal>
</div>`);
    });

    it('shows portal container in shallow debug tree', () => {
      const Foo = () => (
        <div className="foo">
          {createPortal(
            <div className="in-portal">InPortal</div>,
            { nodeType: 1 },
          )}
        </div>
      );

      const wrapper = shallow(<Foo />);
      expect(wrapper.debug({ verbose: true })).to.equal(`<div className="foo">
  <Portal containerInfo={{ nodeType: 1 }}>
    <div className="in-portal">
      InPortal
    </div>
  </Portal>
</div>`);
    });

    it('shows nested portal children in shallow debug tree', () => {
      const Bar = () => null;

      const Foo = () => (
        <div className="foo">
          {createPortal(
            <div className="in-portal">
              <div className="nested-in-portal">
                <Bar />
              </div>
            </div>,
            { nodeType: 1 },
          )}
        </div>
      );

      const wrapper = shallow(<Foo />);
      expect(wrapper.debug()).to.equal(`<div className="foo">
  <Portal containerInfo={{...}}>
    <div className="in-portal">
      <div className="nested-in-portal">
        <Bar />
      </div>
    </div>
  </Portal>
</div>`);
    });

    it('has top level portals in debug tree', () => {
      const Foo = () => (
        createPortal(
          <div className="in-portal">InPortal</div>,
          { nodeType: 1 },
        )
      );

      const wrapper = shallow(<Foo />);
      expect(wrapper.debug()).to.equal(`<Portal containerInfo={{...}}>
  <div className="in-portal">
    InPortal
  </div>
</Portal>`);
    });
  });

  describeIf(is('>= 16.8'), 'hooks', () => {
    // TODO: enable when the shallow renderer fixes its bug
    it.skip('works with `useEffect`', (done) => {
      function ComponentUsingEffectHook() {
        const [ctr, setCtr] = useState(0);
        useEffect(() => {
          setCtr(1);
          setTimeout(() => {
            setCtr(2);
          }, 1e3);
        }, []);
        return (
          <div>
            {ctr}
          </div>
        );
      }
      const wrapper = shallow(<ComponentUsingEffectHook />);

      expect(wrapper.debug()).to.equal(`<div>
  1
</div>`);

      setTimeout(() => {
        wrapper.update();
        expect(wrapper.debug()).to.equal(`<div>
  2
</div>`);
        done();
      }, 1e3);
    });
  });

  describe('.contains(node)', () => {
    it('allows matches on the root node', () => {
      const a = <div className="foo" />;
      const b = <div className="foo" />;
      const c = <div className="bar" />;
      expect(shallow(a).contains(b)).to.equal(true);
      expect(shallow(a).contains(c)).to.equal(false);
    });

    it('allows matches on a nested node', () => {
      const wrapper = shallow((
        <div>
          <div className="foo" />
        </div>
      ));
      const b = <div className="foo" />;
      expect(wrapper.contains(b)).to.equal(true);
    });

    it('matches composite components', () => {
      class Foo extends React.Component {
        render() { return <div />; }
      }
      const wrapper = shallow((
        <div>
          <Foo />
        </div>
      ));
      const b = <Foo />;
      expect(wrapper.contains(b)).to.equal(true);
    });

    it('works with strings', () => {
      const wrapper = shallow(<div>foo</div>);

      expect(wrapper.contains('foo')).to.equal(true);
      expect(wrapper.contains('bar')).to.equal(false);
    });

    it('works with numbers', () => {
      const wrapper = shallow(<div>{1}</div>);

      expect(wrapper.contains(1)).to.equal(true);
      expect(wrapper.contains(2)).to.equal(false);
      expect(wrapper.contains('1')).to.equal(false);
    });

    it('works with nested strings & numbers', () => {
      const wrapper = shallow((
        <div>
          <div>
            <div>{5}</div>
          </div>
          <div>foo</div>
        </div>
      ));

      expect(wrapper.contains('foo')).to.equal(true);
      expect(wrapper.contains(<div>foo</div>)).to.equal(true);

      expect(wrapper.contains(5)).to.equal(true);
      expect(wrapper.contains(<div>{5}</div>)).to.equal(true);
    });

    it('does something with arrays of nodes', () => {
      const wrapper = shallow((
        <div>
          <span>Hello</span>
          <div>Goodbye</div>
          <span>More</span>
        </div>
      ));
      const fails = [
        <span>wrong</span>,
        <div>Goodbye</div>,
      ];

      const passes1 = [
        <span>Hello</span>,
        <div>Goodbye</div>,
      ];
      const passes2 = [
        <div>Goodbye</div>,
        <span>More</span>,
      ];

      expect(wrapper.contains(fails)).to.equal(false);
      expect(wrapper.contains(passes1)).to.equal(true);
      expect(wrapper.contains(passes2)).to.equal(true);
    });

    it('throws on invalid argument', () => {
      const wrapper = shallow(<div />);

      expect(() => wrapper.contains({})).to.throw(
        Error,
        'ShallowWrapper::contains() can only be called with ReactElement (or array of them), string or number as argument.', // eslint-disable-line max-len
      );
      expect(() => wrapper.contains(() => ({}))).to.throw(
        Error,
        'ShallowWrapper::contains() can only be called with ReactElement (or array of them), string or number as argument.', // eslint-disable-line max-len
      );
    });

    describeIf(is('> 0.13'), 'stateless function components (SFCs)', () => {
      it('matches composite components', () => {
        function Foo() {
          return <div />;
        }

        const wrapper = shallow((
          <div>
            <Foo />
          </div>
        ));
        const b = <Foo />;
        expect(wrapper.contains(b)).to.equal(true);
      });

      it('matches composite components if rendered by function', () => {
        function Foo() {
          return <div />;
        }
        const renderStatelessComponent = () => <Foo />;
        const wrapper = shallow((
          <div>
            {renderStatelessComponent()}
          </div>
        ));
        const b = <Foo />;
        expect(wrapper.contains(b)).to.equal(true);
      });
    });
  });

  describe('.equals(node)', () => {
    it('allows matches on the root node', () => {
      const a = <div className="foo" />;
      const b = <div className="foo" />;
      const c = <div className="bar" />;

      expect(shallow(a).equals(b)).to.equal(true);
      expect(shallow(a).equals(c)).to.equal(false);
    });

    it('does NOT allow matches on a nested node', () => {
      const wrapper = shallow((
        <div>
          <div className="foo" />
        </div>
      ));
      const b = <div className="foo" />;
      expect(wrapper.equals(b)).to.equal(false);
    });

    it('matches composite components', () => {
      class Foo extends React.Component {
        render() { return <div />; }
      }
      const wrapper = shallow((
        <div>
          <Foo />
        </div>
      ));
      const b = <div><Foo /></div>;
      expect(wrapper.equals(b)).to.equal(true);
    });

    it('does not expand `node` content', () => {
      class Bar extends React.Component {
        render() { return <div />; }
      }

      class Foo extends React.Component {
        render() { return <Bar />; }
      }

      const wrapper = shallow(<Foo />);
      expect(wrapper.equals(<Bar />)).to.equal(true);
      expect(wrapper.equals(<Foo />)).to.equal(false);
    });

    describeIf(is('> 0.13'), 'stateless function components (SFCs)', () => {
      it('matches composite SFCs', () => {
        const Foo = () => (
          <div />
        );

        const wrapper = shallow((
          <div>
            <Foo />
          </div>
        ));
        const b = <div><Foo /></div>;
        expect(wrapper.equals(b)).to.equal(true);
      });

      it('does not expand `node` content', () => {
        const Bar = () => (
          <div />
        );

        const Foo = () => (
          <Bar />
        );

        const wrapper = shallow(<Foo />);
        expect(wrapper.equals(<Bar />)).to.equal(true);
        expect(wrapper.equals(<Foo />)).to.equal(false);
      });
    });

    it('flattens arrays of children to compare', () => {
      class TwoChildren extends React.Component {
        render() {
          return (
            <div className="parent-component-class">
              <div key="a" className="asd" />
              <div key="b" className="fgh" />
            </div>
          );
        }
      }

      class TwoChildrenOneArrayed extends React.Component {
        render() {
          return (
            <div className="parent-component-class">
              <div key="a" className="asd" />
              {[<div key="b" className="fgh" />]}
            </div>
          );
        }
      }
      const twoChildren = shallow(<TwoChildren />);
      const twoChildrenOneArrayed = shallow(<TwoChildrenOneArrayed />);

      expect(twoChildren.equals(twoChildrenOneArrayed.getElement())).to.equal(true);
      expect(twoChildrenOneArrayed.equals(twoChildren.getElement())).to.equal(true);
    });
  });

  describe('.hostNodes()', () => {
    it('strips out any non-hostNode', () => {
      class Foo extends React.Component {
        render() {
          return <div {...this.props} />;
        }
      }
      const wrapper = shallow((
        <div>
          <Foo className="foo" />
          <div className="foo" />
        </div>
      ));

      const foos = wrapper.find('.foo');
      expect(foos).to.have.lengthOf(2);

      const hostNodes = foos.hostNodes();
      expect(hostNodes).to.have.lengthOf(1);

      expect(hostNodes.is('div')).to.equal(true);
      expect(hostNodes.hasClass('foo')).to.equal(true);
    });
  });

  describe('.find(selector)', () => {
    it('matches the root DOM element', () => {
      const wrapper = shallow(<div id="ttt" className="ttt">hello</div>);
      expect(wrapper.find('#ttt')).to.have.lengthOf(1);
      expect(wrapper.find('.ttt')).to.have.lengthOf(1);
    });

    it('finds an element based on a class name', () => {
      const wrapper = shallow((
        <div>
          <input className="foo" />
        </div>
      ));
      expect(wrapper.find('.foo').type()).to.equal('input');
    });

    it('finds an element that has dot in attribute', () => {
      const wrapper = shallow((
        <div>
          <div data-baz="foo.bar" />
        </div>
      ));

      const elements = wrapper.find('[data-baz="foo.bar"]');
      expect(elements).to.have.lengthOf(1);
    });

    it('finds an element that with class and attribute', () => {
      const wrapper = shallow((
        <div>
          <div data-baz="bar" className="classBar" />
        </div>
      ));

      const elements = wrapper.find('.classBar[data-baz="bar"]');
      expect(elements).to.have.lengthOf(1);
    });

    it('finds an element that with multiple classes and one attribute', () => {
      const wrapper = shallow((
        <div>
          <div data-baz="bar" className="classBar classFoo" />
        </div>
      ));

      const elements = wrapper.find('.classBar.classFoo[data-baz="bar"]');
      expect(elements).to.have.lengthOf(1);
    });

    it('finds an element that with class and class with hyphen', () => {
      const wrapper = shallow((
        <div>
          <div data-baz="bar" className="classBar class-Foo" />
        </div>
      ));

      const elements = wrapper.find('.classBar.class-Foo');
      expect(elements).to.have.lengthOf(1);
    });

    it('finds an element based on a tag name and class name', () => {
      const wrapper = shallow((
        <div>
          <input className="foo" />
        </div>
      ));
      expect(wrapper.find('input.foo')).to.have.lengthOf(1);
    });

    it('finds an element based on a tag name and id', () => {
      const wrapper = shallow((
        <div>
          <input id="foo" />
        </div>
      ));
      expect(wrapper.find('input#foo')).to.have.lengthOf(1);
    });

    it('finds an element based on a tag name, id, and class name', () => {
      const wrapper = shallow((
        <div>
          <input id="foo" className="bar" />
        </div>
      ));
      expect(wrapper.find('input#foo.bar')).to.have.lengthOf(1);
    });

    it('finds an element based on a tag name', () => {
      const wrapper = shallow((
        <div>
          <input className="foo" />
          <button className="bar">Button</button>
          <textarea className="magic" />
          <select className="reality" />
        </div>
      ));
      expect(wrapper.find('input').props().className).to.equal('foo');
      expect(wrapper.find('button').props().className).to.equal('bar');
      expect(wrapper.find('textarea').props().className).to.equal('magic');
      expect(wrapper.find('select').props().className).to.equal('reality');
    });

    it('finds a component based on a constructor', () => {
      class Foo extends React.Component {
        render() { return <div />; }
      }
      const wrapper = shallow((
        <div>
          <Foo className="foo" />
        </div>
      ));
      expect(wrapper.find(Foo).type()).to.equal(Foo);
    });

    wrap()
      .withOverride(() => getAdapter(), 'isValidElementType', () => () => false)
      .it('throws when an adapter’s `isValidElementType` lies', () => {
        class Foo extends React.Component {
          render() { return <div />; }
        }
        const wrapper = shallow((
          <div>
            <Foo className="foo" />
          </div>
        ));

        expect(() => wrapper.find(Foo)).to.throw(
          TypeError,
          'Enzyme::Selector expects a string, object, or valid element type (Component Constructor)',
        );
      });

    it('finds a component based on a component display name', () => {
      class Foo extends React.Component {
        render() { return <div />; }
      }
      const wrapper = shallow((
        <div>
          <Foo className="foo" />
        </div>
      ));
      expect(wrapper.find('Foo').type()).to.equal(Foo);
    });

    it('finds multiple elements based on a class name', () => {
      const wrapper = shallow((
        <div>
          <input className="foo" />
          <button className="foo" />
        </div>
      ));
      expect(wrapper.find('.foo')).to.have.lengthOf(2);
    });

    it('finds multiple elements based on a tag name', () => {
      const wrapper = shallow((
        <div>
          <input className="foo" />
          <input />
          <button />
        </div>
      ));
      expect(wrapper.find('input')).to.have.lengthOf(2);
      expect(wrapper.find('button')).to.have.lengthOf(1);
    });

    it('works on non-single nodes', () => {
      const wrapper = shallow((
        <div className="a">
          <div className="b">
            <div className="c">Text</div>
            <div className="c">Text</div>
            <div className="c">Text</div>
          </div>
          <div className="b">
            <div className="c">Text</div>
            <div className="c">Text</div>
            <div className="c">Text</div>
          </div>
        </div>
      ));
      expect(wrapper.find('.a')).to.have.lengthOf(1);
      expect(wrapper.find('.b')).to.have.lengthOf(2);
      expect(wrapper.find('.b').find('.c')).to.have.lengthOf(6);
    });

    it('finds component based on a react prop', () => {
      const wrapper = shallow((
        <div>
          <span title="foo" />
        </div>
      ));

      expect(wrapper.find('[title="foo"]')).to.have.lengthOf(1);
      expect(wrapper.find('[title]')).to.have.lengthOf(1);
    });

    it('works with an adjacent sibling selector', () => {
      const a = 'some';
      const b = 'text';
      const wrapper = shallow((
        <div>
          <div className="row">
            {a}
            {b}
          </div>
          <div className="row">
            {a}
            {b}
          </div>
        </div>
      ));
      expect(wrapper.find('.row')).to.have.lengthOf(2);
      expect(wrapper.find('.row + .row')).to.have.lengthOf(1);
    });

    it('throws for non-numeric attribute values without quotes', () => {
      const wrapper = shallow((
        <div>
          <input type="text" />
          <input type="hidden" />
          <input type="text" />
        </div>
      ));
      expect(() => wrapper.find('[type=text]')).to.throw(
        Error,
        'Failed to parse selector: [type=text]',
      );
      expect(() => wrapper.find('[type=hidden]')).to.throw(
        Error,
        'Failed to parse selector: [type=hidden]',
      );
      expect(() => wrapper.find('[type="text"]')).to.not.throw(
        Error,
        'Failed to parse selector: [type="text"]',
      );
    });

    it('errors sensibly if any of the search props are undefined', () => {
      const wrapper = shallow((
        <div>
          <input type={undefined} />
        </div>
      ));

      expect(() => wrapper.find({ type: undefined })).to.throw(
        TypeError,
        'Enzyme::Props can’t have `undefined` values. Try using ‘findWhere()’ instead.',
      );
    });

    it('compounds tag and prop selector', () => {
      const wrapper = shallow((
        <div>
          <span preserveAspectRatio="xMaxYMax" />
        </div>
      ));

      expect(wrapper.find('span[preserveAspectRatio="xMaxYMax"]')).to.have.lengthOf(1);
      expect(wrapper.find('span[preserveAspectRatio]')).to.have.lengthOf(1);
    });

    it('supports data prop selectors', () => {
      const wrapper = shallow((
        <div>
          <span data-foo="bar" />
        </div>
      ));

      expect(wrapper.find('[data-foo="bar"]')).to.have.lengthOf(1);
      expect(wrapper.find('[data-foo]')).to.have.lengthOf(1);
    });

    it('finds components with multiple matching react props', () => {
      function noop() {}
      const wrapper = shallow((
        <div>
          <span htmlFor="foo" onChange={noop} preserveAspectRatio="xMaxYMax" />
        </div>
      ));

      expect(wrapper.find('span[htmlFor="foo"][onChange]')).to.have.lengthOf(1);
      expect(wrapper.find('span[htmlFor="foo"][preserveAspectRatio="xMaxYMax"]')).to.have.lengthOf(1);
      expect(wrapper.find('[htmlFor][preserveAspectRatio]')).to.have.lengthOf(1);
    });

    it('supports boolean and numeric values for matching props', () => {
      const wrapper = shallow((
        <div>
          <span value={1} />
          <a value={false} />
        </div>
      ));

      expect(wrapper.find('span[value=1]')).to.have.lengthOf(1);
      expect(wrapper.find('span[value=2]')).to.have.lengthOf(0);
      expect(wrapper.find('a[value=false]')).to.have.lengthOf(1);
      expect(wrapper.find('a[value=true]')).to.have.lengthOf(0);
    });

    it('does not find key or ref via property selector', () => {
      const arrayOfComponents = [<div key="1" />, <div key="2" />];

      const wrapper = shallow((
        <div>
          <div ref="foo" />
          {arrayOfComponents}
        </div>
      ));

      expect(wrapper.find('div[ref="foo"]')).to.have.lengthOf(0);
      expect(wrapper.find('div[key="1"]')).to.have.lengthOf(0);
      expect(wrapper.find('[ref]')).to.have.lengthOf(0);
      expect(wrapper.find('[key]')).to.have.lengthOf(0);
    });

    it('finds multiple elements based on a constructor', () => {
      const wrapper = shallow((
        <div>
          <input className="foo" />
          <input />
          <button />
        </div>
      ));
      expect(wrapper.find('input')).to.have.lengthOf(2);
      expect(wrapper.find('button')).to.have.lengthOf(1);
    });

    it('supports object property selectors', () => {
      const wrapper = shallow((
        <div>
          <input data-test="ref" className="foo" type="text" />
          <input data-test="ref" type="text" />
          <button data-test="ref" prop={undefined} />
          <span data-test="ref" prop={null} />
          <div data-test="ref" prop={123} />
          <input data-test="ref" prop={false} />
          <a data-test="ref" prop />
        </div>
      ));
      expect(wrapper.find({ a: 1 })).to.have.lengthOf(0);
      expect(wrapper.find({ 'data-test': 'ref' })).to.have.lengthOf(7);
      expect(wrapper.find({ className: 'foo' })).to.have.lengthOf(1);
      expect(wrapper.find({ prop: null })).to.have.lengthOf(1);
      expect(wrapper.find({ prop: 123 })).to.have.lengthOf(1);
      expect(wrapper.find({ prop: false })).to.have.lengthOf(1);
      expect(wrapper.find({ prop: true })).to.have.lengthOf(1);
    });

    it('supports complex and nested object property selectors', () => {
      const testFunction = () => ({});
      const wrapper = shallow((
        <div>
          <span more={[{ id: 1 }]} data-test="ref" prop onChange={testFunction} />
          <a more={[{ id: 1 }]} data-test="ref" />
          <div more={{ item: { id: 1 } }} data-test="ref" />
          <input style={{ height: 20 }} data-test="ref" />
        </div>
      ));
      expect(wrapper.find({ 'data-test': 'ref' })).to.have.lengthOf(4);
      expect(wrapper.find({ more: { a: 1 } })).to.have.lengthOf(0);
      expect(wrapper.find({ more: [{ id: 1 }] })).to.have.lengthOf(2);
      expect(wrapper.find({ more: { item: { id: 1 } } })).to.have.lengthOf(1);
      expect(wrapper.find({ style: { height: 20 } })).to.have.lengthOf(1);
      expect(wrapper.find({
        more: [{ id: 1 }],
        'data-test': 'ref',
        prop: true,
        onChange: testFunction,
      })).to.have.lengthOf(1);
    });

    it('throws when given empty object, null, or an array', () => {
      const wrapper = shallow((
        <div>
          <input className="foo" type="text" />
        </div>
      ));
      expect(() => wrapper.find({})).to.throw(
        TypeError,
        'Enzyme::Selector does not support an array, null, or empty object as a selector',
      );
      expect(() => wrapper.find([])).to.throw(
        TypeError,
        'Enzyme::Selector does not support an array, null, or empty object as a selector',
      );
      expect(() => wrapper.find(null)).to.throw(
        TypeError,
        'Enzyme::Selector does not support an array, null, or empty object as a selector',
      );
    });

    it('queries attributes with spaces in their values', () => {
      const wrapper = shallow((
        <div>
          <h1 data-foo="foo bar">Hello</h1>
          <h1 data-foo="bar baz quz">World</h1>
        </div>
      ));
      expect(wrapper.find('[data-foo]')).to.have.lengthOf(2);
      expect(wrapper.find('[data-foo="foo bar"]')).to.have.lengthOf(1);
      expect(wrapper.find('[data-foo="bar baz quz"]')).to.have.lengthOf(1);
      expect(wrapper.find('[data-foo="bar baz"]')).to.have.lengthOf(0);
      expect(wrapper.find('[data-foo="foo  bar"]')).to.have.lengthOf(0);
      expect(wrapper.find('[data-foo="bar  baz quz"]')).to.have.lengthOf(0);
    });

    describeIf(is('> 0.13'), 'stateless function components (SFCs)', () => {
      it('finds a component based on a constructor', () => {
        const Foo = () => (
          <div />
        );
        const wrapper = shallow((
          <div>
            <Foo className="foo" />
          </div>
        ));
        expect(wrapper.find(Foo).type()).to.equal(Foo);
      });

      it('finds a component based on a display name', () => {
        const Foo = () => (
          <div />
        );
        const wrapper = shallow((
          <div>
            <Foo className="foo" />
          </div>
        ));
        expect(wrapper.find('Foo').type()).to.equal(Foo);
      });
    });

    describe('works with attribute selectors containing #', () => {
      let wrapper;
      beforeEach(() => {
        wrapper = shallow((
          <div>
            <a id="test" href="/page">Hello</a>
            <a href="/page#anchor">World</a>
          </div>
        ));
      });

      it('works with an ID', () => {
        expect(wrapper.find('a#test')).to.have.lengthOf(1);
      });

      it('works with a normal attribute', () => {
        expect(wrapper.find('a[href="/page"]')).to.have.lengthOf(1);
      });

      it('works with an attribute with a #', () => {
        expect(wrapper.find('a[href="/page#anchor"]')).to.have.lengthOf(1);
      });
    });

    describe('works with data- attributes', () => {
      class Foo extends React.Component {
        render() {
          return (
            <div>
              <i className="ficon ficon-12 some-icon" />
              <span className="custom class">
                <i className="ficon ficon-book ficon-24" data-custom-tag="bookIcon" />
                <i className="ficon ficon-book ficon-24" data-custom-tag="bookIcon" />
              </span>
            </div>
          );
        }
      }

      it('finds elements by data attribute', () => {
        const wrapper = shallow(<Foo />);
        expect(wrapper.html()).to.contain('data-custom-tag="bookIcon"'); // sanity check
        const elements = wrapper.find('[data-custom-tag="bookIcon"]');
        expect(elements).to.have.lengthOf(2);
        expect(elements.filter('i')).to.have.lengthOf(2);
      });
    });

    describeIf(is('>= 16.2'), 'works with fragments', () => {
      const NestedFragmentComponent = () => (
        <div className="container">
          <Fragment>
            <span>A span</span>
            <span>B span</span>
            <div>A div</div>
            <Fragment>
              <span>C span</span>
            </Fragment>
          </Fragment>
          <span>D span</span>
        </div>
      );

      it('finds descendant span inside React.Fragment', () => {
        const wrapper = shallow(<NestedFragmentComponent />);
        expect(wrapper.find('.container span')).to.have.lengthOf(4);
      });

      it('finds nonexistent p inside React.Fragment', () => {
        const wrapper = shallow(<NestedFragmentComponent />);
        expect(wrapper.find('.container p')).to.have.lengthOf(0);
      });

      it('finds direct child span inside React.Fragment', () => {
        const wrapper = shallow(<NestedFragmentComponent />);
        expect(wrapper.find('.container > span')).to.have.lengthOf(4);
      });

      it('handles adjacent sibling selector inside React.Fragment', () => {
        const wrapper = shallow(<NestedFragmentComponent />);
        expect(wrapper.find('.container span + div')).to.have.lengthOf(1);
      });

      it('handles general sibling selector inside React.Fragment', () => {
        const wrapper = shallow(<NestedFragmentComponent />);
        expect(wrapper.find('.container div ~ span')).to.have.lengthOf(2);
      });

      it('handles fragments with no content', () => {
        const EmptyFragmentComponent = () => (
          <div className="container">
            <Fragment>
              <Fragment />
            </Fragment>
          </div>
        );
        const wrapper = shallow(<EmptyFragmentComponent />);

        expect(wrapper.find('.container > span')).to.have.lengthOf(0);
        expect(wrapper.find('.container span')).to.have.lengthOf(0);
        expect(wrapper.children()).to.have.lengthOf(0);
      });
    });

    itIf(is('>= 16'), 'finds portals by name', () => {
      const containerDiv = { nodeType: 1 };
      const Foo = () => (
        <div>
          {createPortal(
            <div className="in-portal">InPortal</div>,
            containerDiv,
          )}
        </div>
      );

      const wrapper = shallow(<Foo />);

      expect(wrapper.find('Portal')).to.have.lengthOf(1);
    });

    itIf(is('>= 16'), 'finds elements through portals', () => {
      const containerDiv = { nodeType: 1 };
      const Foo = () => (
        <div>
          {createPortal(
            <div>
              <h1>Successful Portal!</h1>
              <span />
            </div>,
            containerDiv,
          )}
        </div>
      );


      const wrapper = shallow(<Foo />);

      expect(wrapper.find('h1')).to.have.lengthOf(1);

      expect(wrapper.find('span')).to.have.lengthOf(1);
    });

    describeIf(is('>= 16.3'), 'forwardRef', () => {
      it('finds forwardRefs', () => {
        const Component = forwardRef(() => <div />);
        class Foo extends React.Component {
          render() {
            return (
              <div>
                <Component />
                <Component />
              </div>
            );
          }
        }

        const wrapper = shallow(<Foo />);
        expect(wrapper.find(Component)).to.have.lengthOf(2);
        expect(wrapper.find('ForwardRef')).to.have.lengthOf(2);
      });

      it('finds forwardRef by custom display name', () => {
        const Component = forwardRef(() => <div />);
        Component.displayName = 'CustomForwardRef';
        class Foo extends React.Component {
          render() {
            return (
              <div>
                <Component />
                <Component />
              </div>
            );
          }
        }

        const wrapper = shallow(<Foo />);
        expect(wrapper.find(Component)).to.have.lengthOf(2);
        expect(wrapper.find(Component.displayName)).to.have.lengthOf(2);
      });
    });

    describeWithDOM('find DOM elements by constructor', () => {
      const { elements, all } = getData();

      elements.filter(({ constructor: C }) => C && C !== all).forEach(({
        tag: Tag,
        constructorName: name,
      }) => {
        class Foo extends React.Component {
          render() {
            return <Tag />;
          }
        }

        it(`${Tag}: found with \`${name}\``, () => {
          const wrapper = shallow(<Foo />);

          const rendered = wrapper;
          expect(rendered.type()).to.equal(Tag);
          expect(rendered.is(Tag)).to.equal(true);
          expect(wrapper.filter(Tag)).to.have.lengthOf(1);
        });
      });
    });

    describeIf(is('>= 16.6'), 'React.memo', () => {
      it('works with an SFC', () => {
        const InnerComp = () => <div><span>Hello</span></div>;
        const InnerFoo = ({ foo }) => (
          <div>
            <InnerComp />
            <div className="bar">bar</div>
            <div className="qoo">{foo}</div>
          </div>
        );
        const Foo = memo(InnerFoo);

        const wrapper = shallow(<Foo foo="qux" />);
        expect(wrapper.debug()).to.equal(`<div>
  <InnerComp />
  <div className="bar">
    bar
  </div>
  <div className="qoo">
    qux
  </div>
</div>`);
        expect(wrapper.find('InnerComp')).to.have.lengthOf(1);
        expect(wrapper.find('.bar')).to.have.lengthOf(1);
        expect(wrapper.find('.qoo').text()).to.equal('qux');
      });

      it('throws with a class component', () => {
        class InnerComp extends React.Component {
          render() {
            return <div><span>Hello</span></div>;
          }
        }

        class Foo extends React.Component {
          render() {
            const { foo } = this.props;
            return (
              <div>
                <InnerComp />
                <div className="bar">bar</div>
                <div className="qoo">{foo}</div>
              </div>
            );
          }
        }
        const FooMemo = memo(Foo);

        expect(() => shallow(<FooMemo foo="qux" />)).to.throw(TypeError);
      });

      it.skip('works with a class component', () => {
        class InnerComp extends React.Component {
          render() {
            return <div><span>Hello</span></div>;
          }
        }

        class Foo extends React.Component {
          render() {
            const { foo } = this.props;
            return (
              <div>
                <InnerComp />
                <div className="bar">bar</div>
                <div className="qoo">{foo}</div>
              </div>
            );
          }
        }
        const FooMemo = memo(Foo);

        const wrapper = shallow(<FooMemo foo="qux" />);
        expect(wrapper.debug()).to.equal(`<div>
  <InnerComp />
  <div className="bar">
    bar
  </div>
  <div className="qoo">
    qux
  </div>
</div>`);
        expect(wrapper.find('InnerComp')).to.have.lengthOf(1);
        expect(wrapper.find('.bar')).to.have.lengthOf(1);
        expect(wrapper.find('.qoo').text()).to.equal('qux');
      });
    });
  });

  describe('.findWhere(predicate)', () => {
    it('returns all elements for a truthy test', () => {
      const wrapper = shallow((
        <div>
          <input className="foo" />
          <input />
        </div>
      ));
      expect(wrapper.findWhere(() => true)).to.have.lengthOf(3);
    });

    it('returns no elements for a falsy test', () => {
      const wrapper = shallow((
        <div>
          <input className="foo" />
          <input />
        </div>
      ));
      expect(wrapper.findWhere(() => false)).to.have.lengthOf(0);
    });

    it('does not pass empty wrappers', () => {
      class EditableText extends React.Component {
        render() {
          return <div>{''}</div>;
        }
      }

      const wrapper = shallow(<EditableText />);

      const stub = sinon.stub();
      wrapper.findWhere(stub);
      const passedNodeLengths = stub.getCalls().map(({ args: [firstArg] }) => firstArg.length);
      expect(passedNodeLengths).to.eql([1]);
    });

    it('calls the predicate with the wrapped node as the first argument', () => {
      const wrapper = shallow((
        <div>
          <div className="foo bar" />
          <div className="foo baz" />
          <div className="foo bux" />
        </div>
      ));

      const stub = sinon.stub();
      stub.returns(true);
      const spy = sinon.spy(stub);
      wrapper.findWhere(spy);
      expect(spy).to.have.property('callCount', 4);
      expect(spy.args[0][0]).to.be.instanceOf(ShallowWrapper);
      expect(spy.args[1][0]).to.be.instanceOf(ShallowWrapper);
      expect(spy.args[2][0]).to.be.instanceOf(ShallowWrapper);
      expect(spy.args[3][0]).to.be.instanceOf(ShallowWrapper);
      expect(spy.args[1][0].hasClass('bar')).to.equal(true);
      expect(spy.args[2][0].hasClass('baz')).to.equal(true);
      expect(spy.args[3][0].hasClass('bux')).to.equal(true);
    });

    it('finds nodes', () => {
      class Foo extends React.Component {
        render() {
          return (
            <div>
              <span data-foo={this.props.selector} />
              <i data-foo={this.props.selector} />
            </div>
          );
        }
      }

      const selector = 'blah';
      const wrapper = shallow(<Foo selector={selector} />);
      const foundSpan = wrapper.findWhere(n => (
        n.type() === 'span' && n.props()['data-foo'] === selector
      ));
      expect(foundSpan.type()).to.equal('span');

      const foundNotSpan = wrapper.findWhere(n => (
        n.type() !== 'span' && n.props()['data-foo'] === selector
      ));
      expect(foundNotSpan.type()).to.equal('i');
    });

    describeIf(is('>= 16.2'), 'with fragments', () => {
      it('finds nodes', () => {
        class FragmentFoo extends React.Component {
          render() {
            return (
              <div>
                <Fragment>
                  <span data-foo={this.props.selector} />
                  <i data-foo={this.props.selector} />
                  <Fragment>
                    <i data-foo={this.props.selector} />
                  </Fragment>
                </Fragment>
                <span data-foo={this.props.selector} />
              </div>
            );
          }
        }

        const selector = 'blah';
        const wrapper = shallow(<FragmentFoo selector={selector} />);
        const foundSpans = wrapper.findWhere(n => (
          n.type() === 'span' && n.props()['data-foo'] === selector
        ));
        expect(foundSpans).to.have.lengthOf(2);
        expect(foundSpans.get(0).type).to.equal('span');
        expect(foundSpans.get(1).type).to.equal('span');

        const foundNotSpans = wrapper.findWhere(n => (
          n.type() !== 'span' && n.props()['data-foo'] === selector
        ));
        expect(foundNotSpans).to.have.lengthOf(2);
        expect(foundNotSpans.get(0).type).to.equal('i');
        expect(foundNotSpans.get(1).type).to.equal('i');
      });
    });

    it('finds nodes when conditionally rendered', () => {
      class Foo extends React.Component {
        render() {
          return (
            <div>
              <span data-foo={this.props.selector} />
              {this.props.selector === 'baz' ? <i data-foo={this.props.selector} /> : null}
            </div>
          );
        }
      }

      const selector = 'blah';
      const wrapper = shallow(<Foo selector={selector} />);
      const foundSpan = wrapper.findWhere(n => (
        n.type() === 'span' && n.props()['data-foo'] === selector
      ));
      expect(foundSpan.type()).to.equal('span');

      const foundNotSpan = wrapper.findWhere(n => (
        n.type() !== 'span' && n.props()['data-foo'] === selector
      ));
      expect(foundNotSpan).to.have.lengthOf(0);
    });

    it('does not get trapped when conditionally rendering using an empty string variable as the condition', () => {
      const emptyString = '';

      class Foo extends React.Component {
        render() {
          return (
            <div>
              <header>
                <span />
                {emptyString && <i />}
              </header>
              <div>
                <span data-foo={this.props.selector}>Test</span>
              </div>
            </div>
          );
        }
      }

      const selector = 'blah';
      const wrapper = shallow(<Foo selector={selector} />);
      const foundSpan = wrapper.findWhere(n => (
        n.type() === 'span'
        && n.props()['data-foo'] === selector
      ));

      expect(foundSpan.debug()).to.equal((
        `<span data-foo="${selector}">
  Test
</span>`
      ));
    });

    it('returns props object when props() is called', () => {
      class Foo extends React.Component {
        render() {
          return (
            <div data-foo={this.props.data}>Test Component</div>
          );
        }
      }

      const content = 'blah';
      const wrapper = shallow(<Foo data={content} />);
      // TODO: shallow has children, mount does not
      expect(wrapper.props()).to.deep.equal({ 'data-foo': content, children: 'Test Component' });
    });

    it('returns shallow rendered string when debug() is called', () => {
      class Foo extends React.Component {
        render() {
          return (
            <div data-foo={this.props.data}>Test Component</div>
          );
        }
      }

      const content = 'blah';
      const wrapper = shallow(<Foo data={content} />);
      expect(wrapper.debug()).to.equal((
        `<div data-foo="${content}">
  Test Component
</div>`
      ));
    });

    describeIf(is('> 0.13'), 'stateless function components (SFCs)', () => {
      it('finds nodes', () => {
        const SFC = function SFC({ selector }) {
          return (
            <div>
              <span data-foo={selector} />
              <i data-foo={selector} />
            </div>
          );
        };

        const selector = 'blah';
        const wrapper = shallow(<SFC selector={selector} />);
        const foundSpan = wrapper.findWhere(n => (
          n.type() === 'span' && n.props()['data-foo'] === selector
        ));
        expect(foundSpan.type()).to.equal('span');

        const foundNotSpan = wrapper.findWhere(n => (
          n.type() !== 'span' && n.props()['data-foo'] === selector
        ));
        expect(foundNotSpan.type()).to.equal('i');
      });

      it('finds nodes when conditionally rendered', () => {
        const SFC = function SFC({ selector }) {
          return (
            <div>
              <span data-foo={selector} />
              {selector === 'baz' ? <i data-foo={selector} /> : null}
            </div>
          );
        };

        const selector = 'blah';
        const wrapper = shallow(<SFC selector={selector} />);
        const foundSpan = wrapper.findWhere(n => (
          n.type() === 'span' && n.props()['data-foo'] === selector
        ));
        expect(foundSpan.type()).to.equal('span');

        const foundNotSpan = wrapper.findWhere(n => (
          n.type() !== 'span' && n.props()['data-foo'] === selector
        ));
        expect(foundNotSpan).to.have.lengthOf(0);
      });

      it('returns props object when props() is called', () => {
        const SFC = function SFC({ data }) {
          return (
            <div data-foo={data}>Test SFC</div>
          );
        };

        const content = 'blah';
        const wrapper = shallow(<SFC data={content} />);
        // TODO: shallow has children, mount does not
        expect(wrapper.props()).to.deep.equal({ 'data-foo': content, children: 'Test SFC' });
      });

      it('returns shallow rendered string when debug() is called', () => {
        const SFC = function SFC({ data }) {
          return (
            <div data-foo={data}>Test SFC</div>
          );
        };

        const content = 'blah';
        const wrapper = shallow(<SFC data={content} />);
        expect(wrapper.debug()).to.equal((
          `<div data-foo="${content}">
  Test SFC
</div>`
        ));
      });

      it('works with a nested SFC', () => {
        const Bar = realArrowFunction(<div>Hello</div>);
        class Foo extends React.Component {
          render() { return <Bar />; }
        }
        const wrapper = shallow(<Foo />);
        expect(wrapper.is(Bar)).to.equal(true);
        expect(wrapper.dive().text()).to.equal('Hello');
      });
    });

    it('allows `.text()` to be called on text nodes', () => {
      const wrapper = shallow((
        <section>
          <div className="foo bar" />
          <div>foo bar</div>
          {null}
          {false}
        </section>
      ));

      const stub = sinon.stub();
      wrapper.findWhere(stub);

      const passedNodes = stub.getCalls().map(({ args: [firstArg] }) => firstArg);

      const textContents = passedNodes.map(n => [n.debug(), n.text()]);
      const expected = [
        [wrapper.debug(), 'foo bar'], // root
        ['<div className="foo bar" />', ''], // first div
        ['<div>\n  foo bar\n</div>', 'foo bar'], // second div
        ['foo bar', 'foo bar'], // second div's contents
      ];
      expect(textContents).to.eql(expected);
    });

    it('does not pass in null or false nodes', () => {
      const wrapper = shallow((
        <section>
          <div className="foo bar" />
          <div>foo bar</div>
          {null}
          {false}
        </section>
      ));
      const stub = sinon.stub();
      wrapper.findWhere(stub);

      const passedNodes = stub.getCalls().map(({ args: [firstArg] }) => firstArg);
      const hasElements = passedNodes.map(n => [n.debug(), n.getElement() && true]);
      const expected = [
        [wrapper.debug(), true], // root
        ['<div className="foo bar" />', true], // first div
        ['<div>\n  foo bar\n</div>', true], // second div
        ['foo bar', null], // second div's contents
      ];
      expect(hasElements).to.eql(expected);

      // the root, plus the 2 renderable children, plus the grandchild text
      expect(stub).to.have.property('callCount', 4);
    });

    it('does not pass in null or false nodes', () => {
      const wrapper = shallow((
        <div>
          <div className="foo bar" />
          {null}
          {false}
        </div>
      ));
      const stub = sinon.stub();
      stub.returns(true);
      const spy = sinon.spy(stub);
      wrapper.findWhere(spy);
      expect(spy).to.have.property('callCount', 2);
    });

    it('allows `.text()` to be called on text nodes', () => {
      const wrapper = shallow((
        <section>
          <div className="foo bar" />
          <div>foo bar</div>
          {null}
          {false}
        </section>
      ));

      const stub = sinon.stub();
      wrapper.findWhere(stub);

      const passedNodes = stub.getCalls().map(({ args: [firstArg] }) => firstArg);

      const textContents = passedNodes.map(n => [n.debug(), n.text()]);
      const expected = [
        [wrapper.debug(), 'foo bar'], // root
        ['<div className="foo bar" />', ''], // first div
        ['<div>\n  foo bar\n</div>', 'foo bar'], // second div
        ['foo bar', 'foo bar'], // second div's contents
      ];
      expect(textContents).to.eql(expected);
    });

    itIf(is('>= 16'), 'finds portals by react-is Portal type', () => {
      const containerDiv = { nodeType: 1 };
      const Foo = () => (
        <div>
          {createPortal(
            <div className="in-portal">InPortal</div>,
            containerDiv,
          )}
        </div>
      );

      const wrapper = shallow(<Foo />);

      expect(wrapper.findWhere(node => node.type() === Portal)).to.have.lengthOf(1);
    });
  });

  describe('.setProps(newProps[, callback)', () => {
    it('throws on a non-function callback', () => {
      class Foo extends React.Component {
        render() {
          return null;
        }
      }
      const wrapper = shallow(<Foo />);

      expect(() => wrapper.setProps({}, undefined)).to.throw();
      expect(() => wrapper.setProps({}, null)).to.throw();
      expect(() => wrapper.setProps({}, false)).to.throw();
      expect(() => wrapper.setProps({}, true)).to.throw();
      expect(() => wrapper.setProps({}, [])).to.throw();
      expect(() => wrapper.setProps({}, {})).to.throw();
    });

    it('sets props for a component multiple times', () => {
      class Foo extends React.Component {
        render() {
          return (
            <div className={this.props.id}>
              {this.props.foo}
            </div>
          );
        }
      }
      const wrapper = shallow(<Foo id="foo" />);
      expect(wrapper.find('.foo')).to.have.lengthOf(1);
      wrapper.setProps({ id: 'bar', foo: 'bla' });
      expect(wrapper.find('.bar')).to.have.lengthOf(1);
    });

    describe('merging props', () => {
      it('merges, not replaces, props when rerendering', () => {
        class Foo extends React.Component {
          render() {
            return (
              <div className={this.props.id}>
                {this.props.foo}
              </div>
            );
          }
        }

        const wrapper = shallow(<Foo id="foo" foo="bar" />);

        expect(wrapper.debug()).to.equal(`
<div className="foo">
  bar
</div>
        `.trim());
        expect(wrapper.props()).to.eql({
          className: 'foo',
          children: 'bar',
        });
        expect(wrapper.instance().props).to.eql({
          id: 'foo',
          foo: 'bar',
        });

        wrapper.setProps({ id: 'bar' });

        expect(wrapper.debug()).to.equal(`
<div className="bar">
  bar
</div>
        `.trim());
        expect(wrapper.props()).to.eql({
          className: 'bar',
          children: 'bar',
        });
        expect(wrapper.instance().props).to.eql({
          id: 'bar',
          foo: 'bar',
        });
      });

      itIf(is('> 0.13'), 'merges, not replaces, props on SFCs', () => {
        function Foo({ id, foo }) {
          return (
            <div className={id}>
              {foo}
            </div>
          );
        }
        const wrapper = shallow(<Foo id="foo" foo="bar" />);

        expect(wrapper.debug()).to.equal(`
<div className="foo">
  bar
</div>
        `.trim());
        expect(wrapper.props()).to.eql({
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

        expect(wrapper.debug()).to.equal(`
<div className="bar">
  bar
</div>
        `.trim());
        expect(wrapper.props()).to.eql({
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
        class Foo extends React.Component {
          shouldComponentUpdate() {
            return false;
          }

          render() {
            return (
              <div className={this.props.id}>
                {this.props.foo}
              </div>
            );
          }
        }
        const wrapper = shallow(<Foo id="foo" foo="bar" />);

        expect(wrapper.debug()).to.equal(`
<div className="foo">
  bar
</div>
        `.trim());
        expect(wrapper.props()).to.eql({
          className: 'foo',
          children: 'bar',
        });
        expect(wrapper.instance().props).to.eql({
          id: 'foo',
          foo: 'bar',
        });

        wrapper.setProps({ id: 'foo' });

        expect(wrapper.debug()).to.equal(`
<div className="foo">
  bar
</div>
        `.trim());
        expect(wrapper.props()).to.eql({
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

      class Foo extends React.Component {
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
      Foo.contextTypes = {
        foo() { return null; },
      };
      const cWRP = sinon.stub(Foo.prototype, 'componentWillReceiveProps');
      // eslint-disable-next-line camelcase
      const U_cWRP = sinon.stub(Foo.prototype, 'UNSAFE_componentWillReceiveProps');

      const nextProps = { id: 'bar', foo: 'bla' };
      const context = { foo: 'bar' };
      const wrapper = shallow(<Foo id="foo" />, { context });

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
      class Foo extends React.Component {
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

      const wrapper = shallow(<Foo a="a" b="b" />);
      expect(wrapper.props().a).to.equal('a');
      expect(wrapper.props().b).to.equal('b');

      wrapper.setProps({ b: 'c', d: 'e' });
      expect(wrapper.props().a).to.equal('a');
      expect(wrapper.props().b).to.equal('c');
      expect(wrapper.props().d).to.equal('e');
    });

    it('passes in old context', () => {
      class Foo extends React.Component {
        render() {
          return (
            <div>{this.context.x}</div>
          );
        }
      }

      Foo.contextTypes = { x: PropTypes.string };

      const context = { x: 'yolo' };
      const wrapper = shallow(<Foo x={5} />, { context });
      expect(wrapper.first('div').text()).to.equal('yolo');

      wrapper.setProps({ x: 5 }); // Just force a re-render
      expect(wrapper.first('div').text()).to.equal('yolo');
    });

    it('uses defaultProps if new props includes undefined values', () => {
      const initialState = { a: 42 };
      const context = { b: 7 };
      class Foo extends React.Component {
        constructor(...args) {
          super(...args);
          this.state = initialState;
        }

        componentWillReceiveProps() {}

        render() {
          return <div className={this.props.className} />;
        }
      }

      const cWRP = sinon.stub(Foo.prototype, 'componentWillReceiveProps');

      Foo.defaultProps = {
        className: 'default-class',
      };
      Foo.contextTypes = {
        b: PropTypes.number,
      };

      const wrapper = shallow(<Foo className="original" />, { context });

      // Set undefined in order to use defaultProps if any
      wrapper.setProps({ className: undefined });

      expect(cWRP).to.have.property('callCount', 1);
      const [args] = cWRP.args;
      expect(args).to.eql([
        { className: Foo.defaultProps.className },
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

      const wrapper = shallow(<Trainwreck user={validUser} />);

      expect(() => wrapper.setProps({ user: { name: {} } })).not.to.throw();
      expect(() => wrapper.setProps({ user: {} })).to.throw(error);
    });

    it('calls the callback when setProps has completed', () => {
      class Foo extends React.Component {
        render() {
          const { id } = this.props;
          return (
            <div className={id}>
              {id}
            </div>
          );
        }
      }
      const wrapper = shallow(<Foo id="foo" />);
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
          return (
            <div />
          );
        }
      }

      const wrapper = shallow(<Foo a="a" b="b" />);

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
        const wrapper = shallow(<Dummy />);
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
        const Foo = props => (
          <div className={props.id}>
            {props.id}
          </div>
        );

        const wrapper = shallow(<Foo id="foo" />);
        expect(wrapper.find('.foo')).to.have.lengthOf(1);
        wrapper.setProps({ id: 'bar', foo: 'bla' });
        expect(wrapper.find('.bar')).to.have.lengthOf(1);
      });

      it('merges newProps with oldProps', () => {
        const Foo = props => (
          <Bar {...props} />
        );
        const Bar = () => (
          <div />
        );

        const wrapper = shallow(<Foo a="a" b="b" />);
        expect(wrapper.props().a).to.equal('a');
        expect(wrapper.props().b).to.equal('b');

        wrapper.setProps({ b: 'c', d: 'e' });
        expect(wrapper.props().a).to.equal('a');
        expect(wrapper.props().b).to.equal('c');
        expect(wrapper.props().d).to.equal('e');
      });

      it('passes in old context', () => {
        const Foo = (props, context) => (
          <div>{context.x}</div>
        );
        Foo.contextTypes = { x: PropTypes.string };

        const context = { x: 'yolo' };
        const wrapper = shallow(<Foo x={5} />, { context });
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

        const wrapper = shallow(<Trainwreck user={validUser} />);

        expect(() => wrapper.setProps({ user: { name: {} } })).not.to.throw();
        expect(() => wrapper.setProps({ user: {} })).to.throw(error);
      });
    });
  });

  describe('.setContext(newContext)', () => {
    const SimpleComponent = createClass({
      contextTypes: {
        name: PropTypes.string,
      },
      render() {
        return <div>{this.context.name}</div>;
      },
    });

    it('sets context for a component multiple times', () => {
      const context = { name: 'foo' };
      const wrapper = shallow(<SimpleComponent />, { context });
      expect(wrapper.text()).to.equal('foo');
      wrapper.setContext({ name: 'bar' });
      expect(wrapper.text()).to.equal('bar');
      wrapper.setContext({ name: 'baz' });
      expect(wrapper.text()).to.equal('baz');
    });

    it('throws if it is called when shallow didn’t include context', () => {
      const wrapper = shallow(<SimpleComponent />);
      expect(() => wrapper.setContext({ name: 'bar' })).to.throw(
        Error,
        'ShallowWrapper::setContext() can only be called on a wrapper that was originally passed a context option', // eslint-disable-line max-len
      );
    });

    describeIf(is('> 0.13'), 'stateless functional components', () => {
      const SFC = (props, context) => (
        <div>{context.name}</div>
      );
      SFC.contextTypes = { name: PropTypes.string };

      it('sets context for a component multiple times', () => {
        const context = { name: 'foo' };
        const wrapper = shallow(<SFC />, { context });
        expect(wrapper.text()).to.equal('foo');
        wrapper.setContext({ name: 'bar' });
        expect(wrapper.text()).to.equal('bar');
        wrapper.setContext({ name: 'baz' });
        expect(wrapper.text()).to.equal('baz');
      });

      it('throws if it is called when shallow didn’t include context', () => {
        const wrapper = shallow(<SFC />);
        expect(() => wrapper.setContext({ name: 'bar' })).to.throw(
          Error,
          'ShallowWrapper::setContext() can only be called on a wrapper that was originally passed a context option', // eslint-disable-line max-len
        );
      });
    });
  });

  describe('.simulate(eventName, data)', () => {
    it('simulates events', () => {
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
          return (
            <a
              className={`clicks-${this.state.count}`}
              onClick={this.incrementCount}
            >
              foo
            </a>
          );
        }
      }

      const wrapper = shallow(<Foo />);

      expect(wrapper.find('.clicks-0')).to.have.lengthOf(1);
      wrapper.simulate('click');
      expect(wrapper.find('.clicks-1')).to.have.lengthOf(1);
    });


    it('passes in event data', () => {
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

      wrapper.simulate('click', a, b);
      expect(spy.args[0][0]).to.equal(a);
      expect(spy.args[0][1]).to.equal(b);
    });

    describeIf(is('> 0.13'), 'stateless function components (SFCs)', () => {
      it('simulates events', () => {
        const spy = sinon.spy();
        const Foo = props => (
          <a onClick={props.onClick}>foo</a>
        );

        const wrapper = shallow(<Foo onClick={spy} />);

        expect(spy).to.have.property('callCount', 0);
        wrapper.find('a').simulate('click');
        expect(spy).to.have.property('callCount', 1);
      });

      it('passes in event data', () => {
        const spy = sinon.spy();
        const Foo = () => (
          <a onClick={spy}>foo</a>
        );

        const wrapper = shallow(<Foo />);
        const a = {};
        const b = {};

        wrapper.simulate('click', a, b);
        expect(spy.args[0][0]).to.equal(a);
        expect(spy.args[0][1]).to.equal(b);
      });
    });

    describe('Normalizing JS event names', () => {
      it('converts lowercase events to React camelcase', () => {
        const spy = sinon.spy();
        const clickSpy = sinon.spy();
        class Foo extends React.Component {
          render() {
            return (
              <a onClick={clickSpy} onDoubleClick={spy}>foo</a>
            );
          }
        }

        const wrapper = shallow(<Foo />);

        wrapper.simulate('dblclick');
        expect(spy).to.have.property('callCount', 1);

        wrapper.simulate('click');
        expect(clickSpy).to.have.property('callCount', 1);
      });

      describeIf(is('> 0.13'), 'normalizing mouseenter', () => {
        it('converts lowercase events to React camelcase', () => {
          const spy = sinon.spy();
          class Foo extends React.Component {
            render() {
              return (
                <a onMouseEnter={spy}>foo</a>
              );
            }
          }

          const wrapper = shallow(<Foo />);

          wrapper.simulate('mouseenter');
          expect(spy).to.have.property('callCount', 1);
        });

        it('converts lowercase events to React camelcase in SFCs', () => {
          const spy = sinon.spy();
          const Foo = () => (
            <a onMouseEnter={spy}>foo</a>
          );

          const wrapper = shallow(<Foo />);

          wrapper.simulate('mouseenter');
          expect(spy).to.have.property('callCount', 1);
        });
      });

      describeIf(is('>= 15'), 'animation events', () => {
        it('converts lowercase events to React camelcase', () => {
          const spy = sinon.spy();
          class Foo extends React.Component {
            render() {
              return (
                <a onAnimationIteration={spy}>foo</a>
              );
            }
          }

          const wrapper = shallow(<Foo />);

          wrapper.simulate('animationiteration');
          expect(spy).to.have.property('callCount', 1);
        });

        it('converts lowercase events to React camelcase in stateless components', () => {
          const spy = sinon.spy();
          const Foo = () => (
            <a onAnimationIteration={spy}>foo</a>
          );

          const wrapper = shallow(<Foo />);

          wrapper.simulate('animationiteration');
          expect(spy).to.have.property('callCount', 1);
        });
      });

      describeIf(is('>= 16.4'), 'pointer events', () => {
        it('converts lowercase events to React camelcase', () => {
          const spy = sinon.spy();
          class Foo extends React.Component {
            render() {
              return (
                <a onGotPointerCapture={spy}>foo</a>
              );
            }
          }

          const wrapper = shallow(<Foo />);

          wrapper.simulate('gotpointercapture');
          expect(spy).to.have.property('callCount', 1);
        });

        it('converts lowercase events to React camelcase in stateless components', () => {
          const spy = sinon.spy();
          const Foo = () => (
            <a onGotPointerCapture={spy}>foo</a>
          );

          const wrapper = shallow(<Foo />);

          wrapper.simulate('gotpointercapture');
          expect(spy).to.have.property('callCount', 1);
        });
      });
    });

    itIf(BATCHING, 'has batched updates', () => {
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
          return (
            <a onClick={this.onClick}>{this.state.count}</a>
          );
        }
      }

      const wrapper = shallow(<Foo />);
      wrapper.simulate('click');
      expect(wrapper.text()).to.equal('1');
      expect(renderCount).to.equal(2);
    });

    it('chains', () => {
      const wrapper = shallow(<div />);
      expect(wrapper.simulate('click')).to.equal(wrapper);
    });

    describe('works with .parent()/.parents()/.closest()', () => {
      function getWrapper() {
        const onClick = sinon.stub();
        const wrapper = shallow((
          <div className="div-elem">
            <span className="parent-elem" onClick={onClick}>
              <span className="child-elem">click me</span>
            </span>
          </div>
        ));
        return { wrapper, onClick };
      }

      it.skip('child should fire onClick', () => {
        const { wrapper, onClick } = getWrapper();

        wrapper.find('.child-elem').simulate('click');
        expect(onClick).to.have.property('callCount', 1);
      });

      it('parents should fire onClick', () => {
        const { wrapper, onClick } = getWrapper();

        wrapper.find('.child-elem').parents('.parent-elem').simulate('click');
        expect(onClick).to.have.property('callCount', 1);
      });

      it('closest should fire onClick', () => {
        const { wrapper, onClick } = getWrapper();

        wrapper.find('.child-elem').closest('.parent-elem').simulate('click');
        expect(onClick).to.have.property('callCount', 1);
      });

      it('parent should fire onClick', () => {
        const { wrapper, onClick } = getWrapper();

        wrapper.find('.child-elem').parent().simulate('click');
        expect(onClick).to.have.property('callCount', 1);
      });
    });
  });

  describe('.simulateError(error)', () => {
    class Div extends React.Component {
      render() {
        return <div>{this.props.children}</div>;
      }
    }

    class Spans extends React.Component {
      render() {
        return <div><span /><span /></div>;
      }
    }

    class Nested extends React.Component {
      render() {
        return <Div><Spans /></Div>;
      }
    }

    it('throws on host elements', () => {
      const wrapper = shallow(<Div />);
      expect(wrapper.is('div')).to.equal(true);
      expect(() => wrapper.simulateError()).to.throw();
    });

    it('throws on "not one" node', () => {
      const wrapper = shallow(<Spans />);

      const spans = wrapper.find('span');
      expect(spans).to.have.lengthOf(2);
      expect(() => spans.simulateError()).to.throw();

      const navs = wrapper.find('nav');
      expect(navs).to.have.lengthOf(0);
      expect(() => navs.simulateError()).to.throw();
    });

    it('throws when the renderer lacks `simulateError`', () => {
      const wrapper = shallow(<Nested />);
      delete wrapper[sym('__renderer__')].simulateError;
      expect(() => wrapper.simulateError()).to.throw();
      try {
        wrapper.simulateError();
      } catch (e) {
        expect(e).not.to.equal(undefined);
      }
    });

    it('calls through to renderer’s `simulateError`', () => {
      const wrapper = shallow(<Nested />);
      const stub = sinon.stub().callsFake((_, __, e) => { throw e; });
      wrapper[sym('__renderer__')].simulateError = stub;
      const error = new Error('hi');
      expect(() => wrapper.simulateError(error)).to.throw(error);
      expect(stub).to.have.property('callCount', 1);

      const [args] = stub.args;
      expect(args).to.have.lengthOf(3);
      const [hierarchy, rootNode, actualError] = args;
      expect(actualError).to.equal(error);
      expect(rootNode).to.eql(wrapper[sym('__root__')].getNodeInternal());
      expect(hierarchy).to.have.lengthOf(1);
      const [node] = hierarchy;
      expect(node).to.contain.keys({
        type: Div,
        nodeType: 'class',
        rendered: {
          type: Spans,
          nodeType: 'class',
          rendered: null,
        },
      });
    });

    it('returns the wrapper', () => {
      const wrapper = shallow(<Nested />);
      wrapper[sym('__renderer__')].simulateError = sinon.stub();
      expect(wrapper.simulateError()).to.equal(wrapper);
    });
  });

  describe('.setState(newState[, callback])', () => {
    it('throws on a non-function callback', () => {
      class Foo extends React.Component {
        render() {
          return null;
        }
      }
      const wrapper = shallow(<Foo />);

      expect(() => wrapper.setState({}, undefined)).to.throw();
      expect(() => wrapper.setState({}, null)).to.throw();
      expect(() => wrapper.setState({}, false)).to.throw();
      expect(() => wrapper.setState({}, true)).to.throw();
      expect(() => wrapper.setState({}, [])).to.throw();
      expect(() => wrapper.setState({}, {})).to.throw();
    });

    it('sets the state of the root node', () => {
      class Foo extends React.Component {
        constructor(props) {
          super(props);
          this.state = { id: 'foo' };
        }

        render() {
          return (
            <div className={this.state.id} />
          );
        }
      }
      const wrapper = shallow(<Foo />);
      expect(wrapper.find('.foo')).to.have.lengthOf(1);
      wrapper.setState({ id: 'bar' });
      expect(wrapper.find('.bar')).to.have.lengthOf(1);
    });

    it('allows setState inside of componentDidMount', () => {
      class MySharona extends React.Component {
        constructor(props) {
          super(props);
          this.state = { mounted: false };
        }

        componentDidMount() {
          this.setState({ mounted: true });
        }

        render() {
          return <div>{this.state.mounted ? 'a' : 'b'}</div>;
        }
      }
      const wrapper = shallow(<MySharona />);
      expect(wrapper.find('div').text()).to.equal('a');
    });

    it('calls the callback when setState has completed', () => {
      class Foo extends React.Component {
        constructor(props) {
          super(props);
          this.state = { id: 'foo' };
        }

        render() {
          return (
            <div className={this.state.id} />
          );
        }
      }
      const wrapper = shallow(<Foo />);
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
      class Foo extends React.Component {
        constructor(props) {
          super(props);
          this.state = { id: 'foo' };
        }

        componentDidUpdate() {}

        render() {
          return (
            <div className={this.state.id} />
          );
        }
      }

      const wrapper = shallow(<Foo />);
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
      class Foo extends React.Component {
        constructor(props) {
          super(props);
          this.state = { id: 'foo' };
        }

        componentDidUpdate() {}

        render() {
          return (
            <div className={this.state.id} />
          );
        }
      }

      let payload;
      const stub = sinon.stub(Foo.prototype, 'componentDidUpdate')
        .callsFake(function componentDidUpdate() { this.setState(() => payload); });

      const wrapper = shallow(<Foo />);

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
            return (<div>{this.state.a}</div>);
          }
        }
        const spy = sinon.spy(A.prototype, 'componentWillReceiveProps');

        const wrapper = shallow(<A />, { disableLifecycleMethods: true });

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
            return (
              <div>
                {this.state.a + this.state.b}
              </div>
            );
          }
        }
        const spy = sinon.spy(B.prototype, 'componentWillReceiveProps');

        const wrapper = shallow(<B />, { disableLifecycleMethods: true });

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

        const wrapper = shallow(<Foo />);

        expect(() => wrapper.state()).to.throw(
          Error,
          'ShallowWrapper::state() can only be called on class components',
        );
      });

      it('throws when trying to set state', () => {
        const Foo = () => (
          <div>abc</div>
        );

        const wrapper = shallow(<Foo />);

        expect(() => wrapper.setState({ a: 1 })).to.throw(
          Error,
          'ShallowWrapper::setState() can only be called on class components',
        );
      });
    });

    it('throws an error when cb is not a function', () => {
      class Foo extends React.Component {
        constructor(props) {
          super(props);
          this.state = { id: 'foo' };
        }

        setBadState() {
          this.setState({}, 1);
        }

        render() {
          return (
            <div className={this.state.id} />
          );
        }
      }
      const wrapper = shallow(<Foo />);
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

      const wrapper = shallow(<Foo />);
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
          return key ? null : null;
        }
      }

      expect(shallow(<Comp />).debug()).to.equal('');
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
        const wrapper = shallow(<Parent />);

        expect(wrapper.debug()).to.equal('<Child prop={1} />');

        return new Promise((resolve) => {
          wrapper.setState({ childProp: 2 }, () => {
            expect(wrapper.debug()).to.equal('<Child prop={2} />');
            resolve();
          });
        });
      });

      it('can not set the state of the stateful child of a stateful root', () => {
        const wrapper = shallow(<Parent />);

        expect(wrapper.debug()).to.equal('<Child prop={1} />');

        const child = wrapper.find(Child);
        expect(() => child.setState({ state: 'b' })).to.throw(
          Error,
          'ShallowWrapper::setState() can only be called on the root',
        );
      });

      describeIf(is('> 0.13'), 'stateless function components (SFCs)', () => {
        function SFC(props) {
          return <Parent {...props} />;
        }

        it('can not set the state of the stateful child of a stateless root', () => {
          const wrapper = shallow(<SFC />);

          expect(wrapper.text().trim()).to.equal('<Parent />');

          const child = wrapper.find(Child);
          expect(() => child.setState({ state: 'b' })).to.throw(
            Error,
            'ShallowWrapper::setState() can only be called on the root',
          );
        });
      });
    });
  });

  describe('.is(selector)', () => {
    it('returns true when selector matches current element', () => {
      const wrapper = shallow(<div className="foo bar baz" />);
      expect(wrapper.is('.foo')).to.equal(true);
    });

    it('allows for compound selectors', () => {
      const wrapper = shallow(<div className="foo bar baz" />);
      expect(wrapper.is('.foo.bar')).to.equal(true);
    });

    it('ignores insignificant whitespace', () => {
      const className = `foo
      `;
      const wrapper = shallow(<div className={className} />);
      expect(wrapper.is('.foo')).to.equal(true);
    });

    it('handles all significant whitespace', () => {
      const className = `foo

      bar
      baz`;
      const wrapper = shallow(<div className={className} />);
      expect(wrapper.is('.foo.bar.baz')).to.equal(true);
    });

    it('returns false when selector does not match', () => {
      const wrapper = shallow(<div className="bar baz" />);
      expect(wrapper.is('.foo')).to.equal(false);
    });
  });

  describe('.isEmptyRender()', () => {
    const emptyRenderValues = generateEmptyRenderData();

    itWithData(emptyRenderValues, 'when a React class component returns: ', (data) => {
      const Foo = createClass({
        render() {
          return data.value;
        },
      });
      const wrapper = shallow(<Foo />);
      expect(wrapper.isEmptyRender()).to.equal(data.expectResponse);
    });

    itWithData(emptyRenderValues, 'when an ES2015 class component returns: ', (data) => {
      class Foo extends React.Component {
        render() {
          return data.value;
        }
      }
      const wrapper = shallow(<Foo />);
      expect(wrapper.isEmptyRender()).to.equal(data.expectResponse);
    });

    describe('nested nodes', () => {
      class RenderChildren extends React.Component {
        render() {
          return this.props.children;
        }
      }

      class RenderNull extends React.Component {
        render() {
          return null;
        }
      }

      it('returns false for nested elements that return null', () => {
        const wrapper = shallow((
          <RenderChildren>
            <RenderNull />
          </RenderChildren>
        ));

        expect(wrapper.isEmptyRender()).to.equal(false);
      });

      it('returns false for multiple nested elements that all return null', () => {
        const wrapper = shallow((
          <RenderChildren>
            <div />
          </RenderChildren>
        ));

        expect(wrapper.isEmptyRender()).to.equal(false);
      });

      it('returns false for multiple nested elements where one fringe returns a non null value', () => {
        const wrapper = shallow((
          <RenderChildren>
            <div>Hello</div>
          </RenderChildren>
        ));

        expect(wrapper.isEmptyRender()).to.equal(false);
      });

      itIf(is('>= 16'), 'returns false for multiple nested elements that all return null', () => {
        const wrapper = shallow((
          <RenderChildren>
            <RenderNull />
            <RenderChildren>
              <RenderNull />
              <div />
            </RenderChildren>
          </RenderChildren>
        ));

        expect(wrapper.isEmptyRender()).to.equal(false);
      });

      itIf(is('>= 16'), 'returns false for multiple nested elements where one fringe returns a non null value', () => {
        const wrapper = shallow((
          <RenderChildren>
            <RenderNull />
            <RenderChildren>
              <RenderNull />
              <RenderNull />
            </RenderChildren>
            <RenderChildren>
              <RenderNull />
              <RenderChildren>
                <RenderNull />
                <RenderNull />
                <RenderNull />
                <div>Hello</div>
              </RenderChildren>
            </RenderChildren>
          </RenderChildren>
        ));

        expect(wrapper.isEmptyRender()).to.equal(false);
      });

      itIf(is('>= 16'), 'returns false for multiple nested elements where all values are null', () => {
        const wrapper = shallow((
          <RenderChildren>
            <RenderNull />
            <RenderChildren>
              <RenderNull />
              <RenderNull />
            </RenderChildren>
            <RenderChildren>
              <RenderNull />
              <RenderChildren>
                <RenderNull />
                <RenderNull />
                <RenderNull />
              </RenderChildren>
            </RenderChildren>
          </RenderChildren>
        ));

        expect(wrapper.isEmptyRender()).to.equal(false);
      });
    });

    it('does not return true for HTML elements', () => {
      const wrapper = shallow(<div className="bar baz" />);
      expect(wrapper.isEmptyRender()).to.equal(false);
    });

    describeIf(is('>=15 || ^16.0.0-alpha'), 'stateless function components (SFCs)', () => {
      itWithData(emptyRenderValues, 'when a component returns: ', (data) => {
        function Foo() {
          return data.value;
        }
        const wrapper = shallow(<Foo />);
        expect(wrapper.isEmptyRender()).to.equal(data.expectResponse);
      });
    });
  });

  describe('.not(selector)', () => {
    it('filters to things not matching a selector', () => {
      const wrapper = shallow((
        <div>
          <div className="foo bar baz" />
          <div className="foo" />
          <div className="bar baz" />
          <div className="baz" />
          <div className="foo bar" />
        </div>
      ));

      expect(wrapper.find('.foo').not('.bar')).to.have.lengthOf(1);
      expect(wrapper.find('.baz').not('.foo')).to.have.lengthOf(2);
      expect(wrapper.find('.foo').not('div')).to.have.lengthOf(0);
    });
  });

  describe('.filter(selector)', () => {
    it('returns a new wrapper of just the nodes that matched the selector', () => {
      const wrapper = shallow((
        <div>
          <div className="foo bar baz" />
          <div className="foo" />
          <div className="bar baz">
            <div className="foo bar baz" />
            <div className="foo" />
          </div>
          <div className="baz" />
          <div className="foo bar" />
        </div>
      ));

      expect(wrapper.find('.foo').filter('.bar')).to.have.lengthOf(3);
      expect(wrapper.find('.bar').filter('.foo')).to.have.lengthOf(3);
      expect(wrapper.find('.bar').filter('.bax')).to.have.lengthOf(0);
      expect(wrapper.find('.foo').filter('.baz.bar')).to.have.lengthOf(2);
    });

    it('only looks in the current wrappers nodes, not their children', () => {
      const wrapper = shallow((
        <div>
          <div className="foo">
            <div className="bar" />
          </div>
          <div className="foo bar" />
        </div>
      ));

      expect(wrapper.find('.foo').filter('.bar')).to.have.lengthOf(1);
    });
  });

  describe('.filterWhere(predicate)', () => {
    it('filters only the nodes of the wrapper', () => {
      const wrapper = shallow((
        <div>
          <div className="foo bar" />
          <div className="foo baz" />
          <div className="foo bux" />
        </div>
      ));

      const stub = sinon.stub();
      stub.onCall(0).returns(false);
      stub.onCall(1).returns(true);
      stub.onCall(2).returns(false);

      const baz = wrapper.find('.foo').filterWhere(stub);
      expect(baz).to.have.lengthOf(1);
      expect(baz.hasClass('baz')).to.equal(true);
    });

    it('calls the predicate with the wrapped node as the first argument', () => {
      const wrapper = shallow((
        <div>
          <div className="foo bar" />
          <div className="foo baz" />
          <div className="foo bux" />
        </div>
      ));

      const stub = sinon.stub();
      stub.returns(true);
      const spy = sinon.spy(stub);
      wrapper.find('.foo').filterWhere(spy);
      expect(spy).to.have.property('callCount', 3);
      expect(spy.args[0][0]).to.be.instanceOf(ShallowWrapper);
      expect(spy.args[1][0]).to.be.instanceOf(ShallowWrapper);
      expect(spy.args[2][0]).to.be.instanceOf(ShallowWrapper);
      expect(spy.args[0][0].hasClass('bar')).to.equal(true);
      expect(spy.args[1][0].hasClass('baz')).to.equal(true);
      expect(spy.args[2][0].hasClass('bux')).to.equal(true);
    });
  });

  describe('.text()', () => {
    const matchesRender = function matchesRender(node) {
      const actual = shallow(node).text();
      const expected = render(node).text();
      expect(expected).to.equal(actual);
    };

    it('handles simple text nodes', () => {
      const wrapper = shallow((
        <div>some text</div>
      ));
      expect(wrapper.text()).to.equal('some text');
    });

    it('handles nodes with mapped children', () => {
      class Foo extends React.Component {
        render() {
          return (
            <div>
              {this.props.items.map(x => x)}
            </div>
          );
        }
      }
      matchesRender(<Foo items={['abc', 'def', 'hij']} />);
      matchesRender((
        <Foo
          items={[
            <i key={1}>abc</i>,
            <i key={2}>def</i>,
            <i key={3}>hij</i>,
          ]}
        />
      ));
    });

    it('renders composite components dumbly', () => {
      class Foo extends React.Component {
        render() { return <div />; }
      }
      const wrapper = shallow((
        <div>
          <Foo />
          <div>test</div>
        </div>
      ));
      expect(wrapper.text()).to.equal('<Foo />test');
    });

    it('handles html entities', () => {
      matchesRender(<div>&gt;</div>);
    });

    it('handles spaces the same between shallow and mount', () => {
      const Space = (
        <div>
          <div> test  </div>
          <div>Hello


            World
          </div>
          <div>Hello World</div>
          <div>Hello
            World
          </div>
          <div>Hello     World</div>
          <div>&nbsp;</div>
          <div>&nbsp;&nbsp;</div>
        </div>
      );

      const wrapper = shallow(Space);

      expect(wrapper.text()).to.equal(' test  Hello WorldHello WorldHello WorldHello     World   ');
    });

    it('handles non-breaking spaces correctly', () => {
      class Foo extends React.Component {
        render() {
          return (
            <div>
              &nbsp; &nbsp;
            </div>
          );
        }
      }
      const wrapper = shallow(<Foo />);
      const charCodes = wrapper.text().split('').map(x => x.charCodeAt(0));
      expect(charCodes).to.eql([
        0x00a0, // non-breaking space
        0x20, // normal space
        0x00a0, // non-breaking space
      ]);
    });

    describeIf(is('> 0.13'), 'stateless function components (SFCs)', () => {
      it('handles nodes with mapped children', () => {
        const Foo = props => (
          <div>
            {props.items.map(x => x)}
          </div>
        );
        matchesRender(<Foo items={['abc', 'def', 'hij']} />);
        matchesRender((
          <Foo
            items={[
              <i key={1}>abc</i>,
              <i key={2}>def</i>,
              <i key={3}>hij</i>,
            ]}
          />
        ));
      });

      it('renders composite components dumbly', () => {
        const Foo = () => (
          <div>foo</div>
        );

        const wrapper = shallow((
          <div>
            <Foo />
            <div>test</div>
          </div>
        ));
        expect(wrapper.text()).to.equal('<Foo />test');
      });
    });

    it('renders falsy numbers', () => {
      [0, -0, '0', NaN].forEach((x) => {
        const wrapper = shallow(<div>{x}</div>);
        expect(wrapper.text()).to.equal(String(x));
      });
    });

    describe('text content with curly braces', () => {
      it('handles literal strings', () => {
        const wrapper = shallow(<div><div>{'{}'}</div></div>);
        expect(wrapper.text()).to.equal('{}');
      });

      it.skip('handles innerHTML', () => {
        const wrapper = shallow((
          <div>
            <div dangerouslySetInnerHTML={{ __html: '{ some text }' }} />
          </div>
        ));
        expect(wrapper.text()).to.equal('{ some text }');
      });
    });

    describeIf(is('> 16.2'), 'fragments', () => {
      class FragmentClassExample extends React.Component {
        render() {
          return (
            <Fragment>
              <div>Foo</div>
              <div>Bar</div>
            </Fragment>
          );
        }
      }

      const FragmentConstExample = () => (
        <Fragment>
          <div><span>Foo</span></div>
          <div><span>Bar</span></div>
        </Fragment>
      );

      it('correctly gets text for both children for class', () => {
        const classWrapper = shallow(<FragmentClassExample />);
        expect(classWrapper.text()).to.include('Foo');
        expect(classWrapper.text()).to.include('Bar');
      });

      it('correctly gets text for both children for const', () => {
        const constWrapper = shallow(<FragmentConstExample />);
        expect(constWrapper.text()).to.include('Foo');
        expect(constWrapper.text()).to.include('Bar');
      });

      it('works with a nested component', () => {
        const Title = ({ children }) => <span>{children}</span>;
        const Foobar = () => (
          <Fragment>
            <Title>Foo</Title>
            <Fragment>Bar</Fragment>
          </Fragment>
        );

        const wrapper = shallow(<Foobar />);
        const text = wrapper.text();
        expect(wrapper.debug()).to.equal(`<Fragment>
  <Title>
    Foo
  </Title>
  Bar
</Fragment>`);
        expect(text).to.equal('<Title />Bar');
      });
    });
  });

  describe('.props()', () => {
    it('returns the props object', () => {
      const fn = () => ({});
      const wrapper = shallow((
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
      const wrapper = shallow((
        <div className="bax">
          <div className="baz" onClick={fn} />
          <div className="foo" id="fooId" />
        </div>
      ));

      expect(wrapper.find('.baz').props().onClick).to.equal(fn);
      expect(wrapper.find('.foo').props().id).to.equal('fooId');
    });

    it('returns props of root rendered node', () => {
      class Foo extends React.Component {
        render() {
          return (
            <div className={this.props.bar} id={this.props.foo} />
          );
        }
      }

      const wrapper = shallow(<Foo foo="hi" bar="bye" />);

      expect(wrapper.props()).to.eql({ className: 'bye', id: 'hi' });
    });

    describeIf(is('> 0.13'), 'stateless function components (SFCs)', () => {
      it('returns props of root rendered node', () => {
        const Foo = ({ bar, foo }) => (
          <div className={bar} id={foo} />
        );

        const wrapper = shallow(<Foo foo="hi" bar="bye" />);

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
        const wrapper = shallow(<SloppyReceiver />);
        expect(wrapper.props()).to.be.an('object').that.has.all.keys({
          'data-is-global': true,
          'data-is-undefined': false,
        });
      });

      it('does not provide a `this` to a strict-mode SFC', () => {
        const wrapper = shallow(<StrictReceiver />);
        expect(wrapper.props()).to.be.an('object').that.has.all.keys({
          'data-is-global': false,
          'data-is-undefined': true,
        });
      });
    });
  });

  describe('.prop(name)', () => {
    it('returns the props of key `name`', () => {
      const fn = () => ({});
      const wrapper = shallow((
        <div id="fooId" className="bax" onClick={fn}>
          <div className="baz" />
          <div className="foo" />
        </div>
      ));

      expect(wrapper.prop('className')).to.equal('bax');
      expect(wrapper.prop('onClick')).to.equal(fn);
      expect(wrapper.prop('id')).to.equal('fooId');

    });

    it('is allowed to be used on an inner node', () => {
      const fn = () => ({});
      const wrapper = shallow((
        <div className="bax">
          <div className="baz" onClick={fn} />
          <div className="foo" id="fooId" />
        </div>
      ));

      expect(wrapper.find('.baz').prop('onClick')).to.equal(fn);
      expect(wrapper.find('.foo').prop('id')).to.equal('fooId');
    });

    it('returns props of root rendered node', () => {
      class Foo extends React.Component {
        render() {
          return (
            <div className={this.props.bar} id={this.props.foo} />
          );
        }
      }

      const wrapper = shallow(<Foo foo="hi" bar="bye" />);

      expect(wrapper.prop('className')).to.equal('bye');
      expect(wrapper.prop('id')).to.equal('hi');
      expect(wrapper.prop('foo')).to.equal(undefined);
      expect(wrapper.prop('bar')).to.equal(undefined);
    });

    describeIf(is('> 0.13'), 'stateless function components (SFCs)', () => {
      it('returns props of root rendered node', () => {
        const Foo = ({ bar, foo }) => (
          <div className={bar} id={foo} />
        );

        const wrapper = shallow(<Foo foo="hi" bar="bye" />);

        expect(wrapper.prop('className')).to.equal('bye');
        expect(wrapper.prop('id')).to.equal('hi');
        expect(wrapper.prop('foo')).to.equal(undefined);
        expect(wrapper.prop('bar')).to.equal(undefined);
      });
    });
  });

  describe('.state([name])', () => {
    it('returns the state object', () => {
      class Foo extends React.Component {
        constructor(props) {
          super(props);
          this.state = { foo: 'foo' };
        }

        render() { return <div>{this.state.foo}</div>; }
      }
      const wrapper = shallow(<Foo />);
      expect(wrapper.state()).to.eql({ foo: 'foo' });
    });

    it('returns the current state after state transitions', () => {
      class Foo extends React.Component {
        constructor(props) {
          super(props);
          this.state = { foo: 'foo' };
        }

        render() { return <div>{this.state.foo}</div>; }
      }
      const wrapper = shallow(<Foo />);
      wrapper.setState({ foo: 'bar' });
      expect(wrapper.state()).to.eql({ foo: 'bar' });
    });

    it('allows a state property name be passed in as an argument', () => {
      class Foo extends React.Component {
        constructor(props) {
          super(props);
          this.state = { foo: 'foo' };
        }

        render() { return <div>{this.state.foo}</div>; }
      }
      const wrapper = shallow(<Foo />);
      expect(wrapper.state('foo')).to.equal('foo');
    });

    it('throws on host nodes', () => {
      const wrapper = shallow(<div><span /></div>);

      expect(() => wrapper.state()).to.throw(Error, 'ShallowWrapper::state() can only be called on class components');
    });

    itIf(is('>= 16'), 'throws on Portals', () => {
      const containerDiv = { nodeType: 1 };
      const portal = createPortal(
        <div />,
        containerDiv,
      );

      const wrapper = shallow(<div>{portal}</div>);
      expect(() => wrapper.state()).to.throw(Error, 'ShallowWrapper::state() can only be called on class components');
    });

    describeIf(is('> 0.13'), 'stateless function components (SFCs)', () => {
      it('throws on SFCs', () => {
        function Foo() {
          return <div />;
        }

        const wrapper = shallow(<Foo />);
        expect(() => wrapper.state()).to.throw(Error, 'ShallowWrapper::state() can only be called on class components');
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
        const wrapper = shallow(<Parent />);

        expect(wrapper.state()).to.eql({ childProp: 1 });
      });

      it('can not get the state of the stateful child of a stateful root', () => {
        const wrapper = shallow(<Parent />);

        const child = wrapper.find(Child);
        expect(() => child.state()).to.throw(Error, 'ShallowWrapper::state() can only be called on the root');
      });

      describeIf(is('> 0.13'), 'stateless function components (SFCs)', () => {
        function StatelessParent(props) {
          return <Child {...props} />;
        }

        it('can not get the state of the stateful child of a stateless root', () => {
          const wrapper = shallow(<StatelessParent />);

          const child = wrapper.find(Child);
          expect(() => child.state()).to.throw(Error, 'ShallowWrapper::state() can only be called on the root');
        });
      });
    });
  });

  describe('.children([selector])', () => {
    it('returns empty wrapper for node with no children', () => {
      const wrapper = shallow(<div />);
      expect(wrapper.children()).to.have.lengthOf(0);
    });

    it('skips the falsy children', () => {
      const wrapper = shallow((
        <div>
          <div>
            {false}
            {[false, false]}
            <p>foo</p>
          </div>
          <div>
            {undefined}
            {[undefined, undefined]}
            <p>bar</p>
          </div>
          <div>
            {null}
            {[null, null]}
            <p>baz</p>
          </div>
        </div>
      ));
      expect(wrapper.childAt(0).children()).to.have.lengthOf(1);
      expect(wrapper.childAt(1).children()).to.have.lengthOf(1);
      expect(wrapper.childAt(2).children()).to.have.lengthOf(1);
    });

    it('returns the children nodes of the root', () => {
      const wrapper = shallow((
        <div>
          <div className="foo" />
          <div className="bar" />
          <div className="baz" />
        </div>
      ));
      expect(wrapper.children()).to.have.lengthOf(3);
      expect(wrapper.children().at(0).hasClass('foo')).to.equal(true);
      expect(wrapper.children().at(1).hasClass('bar')).to.equal(true);
      expect(wrapper.children().at(2).hasClass('baz')).to.equal(true);
    });

    it('does not return any of the children of children', () => {
      const wrapper = shallow((
        <div>
          <div className="foo">
            <div className="bar" />
          </div>
          <div className="baz" />
        </div>
      ));
      expect(wrapper.children()).to.have.lengthOf(2);
      expect(wrapper.children().at(0).hasClass('foo')).to.equal(true);
      expect(wrapper.children().at(1).hasClass('baz')).to.equal(true);
    });

    it('handles mixed children with and without arrays', () => {
      class Foo extends React.Component {
        render() {
          return (
            <div>
              <span className="foo" />
              {this.props.items.map(x => x)}
            </div>
          );
        }
      }
      const wrapper = shallow((
        <Foo
          items={[
            <i key={1} className="bar">abc</i>,
            <i key={2} className="baz">def</i>,
          ]}
        />
      ));
      expect(wrapper.children()).to.have.lengthOf(3);
      expect(wrapper.children().at(0).hasClass('foo')).to.equal(true);
      expect(wrapper.children().at(1).hasClass('bar')).to.equal(true);
      expect(wrapper.children().at(2).hasClass('baz')).to.equal(true);
    });

    it('optionally allows a selector to filter by', () => {
      const wrapper = shallow((
        <div>
          <div className="foo" />
          <div className="bar bip" />
          <div className="baz bip" />
        </div>
      ));
      const children = wrapper.children('.bip');
      expect(children).to.have.lengthOf(2);
      expect(children.at(0).hasClass('bar')).to.equal(true);
      expect(children.at(1).hasClass('baz')).to.equal(true);
    });

    describeIf(is('> 0.13'), 'stateless function components (SFCs)', () => {
      it('handles mixed children with and without arrays', () => {
        const Foo = props => (
          <div>
            <span className="foo" />
            {props.items.map(x => x)}
          </div>
        );

        const wrapper = shallow((
          <Foo
            items={[
              <i key={1} className="bar">abc</i>,
              <i key={2} className="baz">def</i>,
            ]}
          />
        ));
        expect(wrapper.children()).to.have.lengthOf(3);
        expect(wrapper.children().at(0).hasClass('foo')).to.equal(true);
        expect(wrapper.children().at(1).hasClass('bar')).to.equal(true);
        expect(wrapper.children().at(2).hasClass('baz')).to.equal(true);
      });
    });

    it('returns duplicates untouched', () => {
      class Foo extends React.Component {
        render() {
          const foo = 'Foo';
          return (
            <div>
              {foo} Bar {foo} Bar {foo}
            </div>
          );
        }
      }

      const wrapper = shallow(<Foo />);
      const children = wrapper.children();
      const textNodes = children.map(x => x.text());
      expect(textNodes).to.eql(['Foo', ' Bar ', 'Foo', ' Bar ', 'Foo']);
    });

    it('renders children separated by spaces', () => {
      class JustificationRow extends React.Component {
        render() {
          const { children } = this.props;
          const wrappedChildren = React.Children.map(
            children,
            child => child && <span>{child}</span>,
          );

          const justifiedChildren = [];
          React.Children.forEach(wrappedChildren, (child) => {
            if (child) {
              justifiedChildren.push(child, ' ');
            }
          });
          justifiedChildren.pop();

          return <div>{justifiedChildren}</div>;
        }
      }

      const wrapper = shallow((
        <JustificationRow>
          <div>foo</div>
          <div>bar</div>
          <div>baz</div>
        </JustificationRow>
      ));

      expect(wrapper.children().map(x => x.debug())).to.eql([
        `<span>
  <div>
    foo
  </div>
</span>`,
        ' ',
        `<span>
  <div>
    bar
  </div>
</span>`,
        ' ',
        `<span>
  <div>
    baz
  </div>
</span>`,
      ]);
    });
  });

  describe('.childAt(index)', () => {
    it('gets a wrapped node at the specified index', () => {
      const wrapper = shallow((
        <div>
          <div className="bar" />
          <div className="baz" />
        </div>
      ));

      expect(wrapper.childAt(0).hasClass('bar')).to.equal(true);
      expect(wrapper.childAt(1).hasClass('baz')).to.equal(true);
    });
  });

  describe('.parents([selector])', () => {
    it('returns an array of current node’s ancestors', () => {
      const wrapper = shallow((
        <div className="bax">
          <div className="foo">
            <div className="bar">
              <div className="baz" />
            </div>
          </div>
          <div className="qux">
            <div className="qoo" />
          </div>
        </div>
      ));

      const parents = wrapper.find('.baz').parents();

      expect(parents).to.have.lengthOf(3);
      expect(parents.at(0).hasClass('bar')).to.equal(true);
      expect(parents.at(1).hasClass('foo')).to.equal(true);
      expect(parents.at(2).hasClass('bax')).to.equal(true);
    });

    it('works for non-leaf nodes as well', () => {
      const wrapper = shallow((
        <div className="bax">
          <div className="foo">
            <div className="bar">
              <div className="baz" />
            </div>
          </div>
        </div>
      ));

      const parents = wrapper.find('.bar').parents();

      expect(parents).to.have.lengthOf(2);
      expect(parents.at(0).hasClass('foo')).to.equal(true);
      expect(parents.at(1).hasClass('bax')).to.equal(true);
    });

    it('optionally allows a selector', () => {
      const wrapper = shallow((
        <div className="bax foo">
          <div className="foo">
            <div className="bar">
              <div className="baz" />
            </div>
          </div>
        </div>
      ));

      const parents = wrapper.find('.baz').parents('.foo');

      expect(parents).to.have.lengthOf(2);
      expect(parents.at(0).hasClass('foo')).to.equal(true);
      expect(parents.at(1).hasClass('bax')).to.equal(true);
    });

    it('works when called sequentially on two sibling nodes', () => {
      class Test extends React.Component {
        render() {
          return (
            <div>
              <div className="a">
                <div>A child</div>
              </div>
              <div className="b">
                <div>B child</div>
              </div>
            </div>
          );
        }
      }

      const wrapper = shallow(<Test />);

      const aChild = wrapper.find({ children: 'A child' });
      expect(aChild.debug()).to.equal(`<div>
  A child
</div>`);
      expect(aChild).to.have.lengthOf(1);

      const bChild = wrapper.find({ children: 'B child' });
      expect(bChild.debug()).to.equal(`<div>
  B child
</div>`);
      expect(bChild).to.have.lengthOf(1);

      const bChildParents = bChild.parents('.b');
      expect(bChildParents.debug()).to.equal(`<div className="b">
  <div>
    B child
  </div>
</div>`);
      expect(bChildParents).to.have.lengthOf(1);

      const aChildParents = aChild.parents('.a');
      expect(aChildParents.debug()).to.equal(`<div className="a">
  <div>
    A child
  </div>
</div>`);
      expect(aChildParents).to.have.lengthOf(1);
    });
  });

  describe('.parent()', () => {
    it('returns only the immediate parent of the node', () => {
      const wrapper = shallow((
        <div className="bax">
          <div className="foo">
            <div className="bar">
              <div className="baz" />
            </div>
          </div>
        </div>
      ));
      expect(wrapper.find('.baz').parent().hasClass('bar')).to.equal(true);
    });

    it('works when the sibling node has children', () => {
      const wrapper = shallow((
        <div className="bax">
          <div className="foo">
            <div className="bar">
              <div className="baz" />
              <div>
                <div />
              </div>
            </div>
          </div>
        </div>
      ));

      expect(wrapper.find('.baz').parent().hasClass('bar')).to.equal(true);
    });

    it('works for multiple nodes', () => {
      const wrapper = shallow((
        <div>
          <div className="foo">
            <div className="baz" />
          </div>
          <div className="bar">
            <div className="baz" />
          </div>
          <div className="bax">
            <div className="baz" />
          </div>
        </div>
      ));

      const parents = wrapper.find('.baz').parent();
      expect(parents).to.have.lengthOf(3);
      expect(parents.at(0).hasClass('foo')).to.equal(true);
      expect(parents.at(1).hasClass('bar')).to.equal(true);
      expect(parents.at(2).hasClass('bax')).to.equal(true);
    });

    it('works with component', () => {
      const Foo = createClass({
        render() {
          return <div className="bar" />;
        },
      });
      const wrapper = shallow(<Foo />);
      expect(wrapper.find('.bar')).to.have.lengthOf(1);
      expect(wrapper.find('.bar').parent()).to.have.lengthOf(0);
    });
  });

  describe('.closest(selector)', () => {
    it('returns the closest ancestor for a given selector', () => {
      const wrapper = shallow((
        <div className="foo">
          <div className="foo baz">
            <div className="bax">
              <div className="bar" />
            </div>
          </div>
        </div>
      ));

      const closestFoo = wrapper.find('.bar').closest('.foo');
      expect(closestFoo).to.have.lengthOf(1);
      expect(closestFoo.hasClass('baz')).to.equal(true);
    });

    it('only ever returns a wrapper of a single node', () => {
      const wrapper = shallow((
        <div className="bax">
          <div className="foo">
            <div className="bar">
              <div className="baz" />
            </div>
          </div>
        </div>
      ));

      expect(wrapper.find('.baz').parent().hasClass('bar')).to.equal(true);
    });

    it('returns itself if matching', () => {
      const wrapper = shallow((
        <div className="bax">
          <div className="foo">
            <div className="baz">
              <div className="bux baz" />
            </div>
          </div>
        </div>
      ));

      expect(wrapper.find('.bux').closest('.baz').hasClass('bux')).to.equal(true);
    });

    it('does not find a nonexistent match', () => {
      const wrapper = shallow((
        <div className="foo">
          <div className="bar" />
        </div>
      ));

      expect(wrapper.find('.fooooo')).to.have.lengthOf(0);

      const bar = wrapper.find('.bar');
      expect(bar).to.have.lengthOf(1);

      expect(bar.closest('.fooooo')).to.have.lengthOf(0);
    });
  });

  describe('.hasClass(className)', () => {
    context('when using a DOM component', () => {
      it('returns whether or not node has a certain class', () => {
        const wrapper = shallow(<div className="foo bar baz some-long-string FoOo" />);

        expect(wrapper.hasClass('foo')).to.equal(true);
        expect(wrapper.hasClass('bar')).to.equal(true);
        expect(wrapper.hasClass('baz')).to.equal(true);
        expect(wrapper.hasClass('some-long-string')).to.equal(true);
        expect(wrapper.hasClass('FoOo')).to.equal(true);
        expect(wrapper.hasClass('doesnt-exist')).to.equal(false);
      });
    });

    describeIf(is('> 0.13'), 'with stateless function components (SFCs)', () => {
      it('returns whether or not node has a certain class', () => {
        const Foo = () => <main><div className="foo bar baz some-long-string FoOo" /></main>;
        const wrapper = shallow(<Foo />);

        expect(wrapper.hasClass('foo')).to.equal(false);
        expect(wrapper.hasClass('bar')).to.equal(false);
        expect(wrapper.hasClass('baz')).to.equal(false);
        expect(wrapper.hasClass('some-long-string')).to.equal(false);
        expect(wrapper.hasClass('FoOo')).to.equal(false);
        expect(wrapper.hasClass('doesnt-exist')).to.equal(false);

        expect(wrapper.children().hasClass('foo')).to.equal(true);
        expect(wrapper.children().hasClass('bar')).to.equal(true);
        expect(wrapper.children().hasClass('baz')).to.equal(true);
        expect(wrapper.children().hasClass('some-long-string')).to.equal(true);
        expect(wrapper.children().hasClass('FoOo')).to.equal(true);
        expect(wrapper.children().hasClass('doesnt-exist')).to.equal(false);
      });
    });

    context('when using a Composite class component', () => {
      it('returns whether or not node has a certain class', () => {
        class Foo extends React.Component {
          render() {
            return (<main><div className="foo bar baz some-long-string FoOo" /></main>);
          }
        }
        const wrapper = shallow(<Foo />);

        expect(wrapper.hasClass('foo')).to.equal(false);
        expect(wrapper.hasClass('bar')).to.equal(false);
        expect(wrapper.hasClass('baz')).to.equal(false);
        expect(wrapper.hasClass('some-long-string')).to.equal(false);
        expect(wrapper.hasClass('FoOo')).to.equal(false);
        expect(wrapper.hasClass('doesnt-exist')).to.equal(false);

        expect(wrapper.children().hasClass('foo')).to.equal(true);
        expect(wrapper.children().hasClass('bar')).to.equal(true);
        expect(wrapper.children().hasClass('baz')).to.equal(true);
        expect(wrapper.children().hasClass('some-long-string')).to.equal(true);
        expect(wrapper.children().hasClass('FoOo')).to.equal(true);
        expect(wrapper.children().hasClass('doesnt-exist')).to.equal(false);
      });
    });

    it('returns whether or not node has a certain class', () => {
      const wrapper = shallow((
        <div className="foo bar baz some-long-string FoOo" />
      ));

      expect(wrapper.hasClass('foo')).to.equal(true);
      expect(wrapper.hasClass('bar')).to.equal(true);
      expect(wrapper.hasClass('baz')).to.equal(true);
      expect(wrapper.hasClass('some-long-string')).to.equal(true);
      expect(wrapper.hasClass('FoOo')).to.equal(true);
      expect(wrapper.hasClass('doesnt-exist')).to.equal(false);
    });

    context('when using a Composite component that renders null', () => {
      it('returns whether or not node has a certain class', () => {
        class Foo extends React.Component {
          render() {
            return null;
          }
        }
        const wrapper = shallow(<Foo />);

        expect(wrapper.hasClass('foo')).to.equal(false);
      });
    });

    it('works with a non-string `className` prop', () => {
      class Foo extends React.Component {
        render() {
          return <div {...this.props} />;
        }
      }
      const obj = { classA: true, classB: false };
      const wrapper = shallow(<Foo className={obj} />);
      expect(wrapper.hasClass('foo')).to.equal(false);
      expect(wrapper.hasClass('classA')).to.equal(false);
      expect(wrapper.hasClass('classB')).to.equal(false);
      expect(wrapper.hasClass(String(obj))).to.equal(true);
    });

    it('allows hyphens', () => {
      const wrapper = shallow(<div className="foo-bar" />);
      expect(wrapper.hasClass('foo-bar')).to.equal(true);
    });

    it('works if className has a function in toString property', () => {
      function classes() {}
      classes.toString = () => 'foo-bar';
      const wrapper = shallow(<div className={classes} />);
      expect(wrapper.hasClass('foo-bar')).to.equal(true);
    });

    it('works if searching with a RegExp', () => {
      const wrapper = shallow(<div className="ComponentName-classname-123" />);
      expect(wrapper.hasClass(/(ComponentName)-(classname)-(\d+)/)).to.equal(true);
      expect(wrapper.hasClass(/(ComponentName)-(other)-(\d+)/)).to.equal(false);
    });
  });

  describe('.forEach(fn)', () => {
    it('calls a function for each node in the wrapper', () => {
      const wrapper = shallow((
        <div>
          <div className="foo bax" />
          <div className="foo bar" />
          <div className="foo baz" />
        </div>
      ));
      const spy = sinon.spy();

      wrapper.find('.foo').forEach(spy);

      expect(spy).to.have.property('callCount', 3);
      expect(spy.args[0][0]).to.be.instanceOf(ShallowWrapper);
      expect(spy.args[0][0].hasClass('bax')).to.equal(true);
      expect(spy.args[0][1]).to.equal(0);
      expect(spy.args[1][0]).to.be.instanceOf(ShallowWrapper);
      expect(spy.args[1][0].hasClass('bar')).to.equal(true);
      expect(spy.args[1][1]).to.equal(1);
      expect(spy.args[2][0]).to.be.instanceOf(ShallowWrapper);
      expect(spy.args[2][0].hasClass('baz')).to.equal(true);
      expect(spy.args[2][1]).to.equal(2);
    });
  });

  describe('.map(fn)', () => {
    it('calls a function with a wrapper for each node in the wrapper', () => {
      const wrapper = shallow((
        <div>
          <div className="foo bax" />
          <div className="foo bar" />
          <div className="foo baz" />
        </div>
      ));
      const spy = sinon.spy();

      wrapper.find('.foo').map(spy);

      expect(spy).to.have.property('callCount', 3);
      expect(spy.args[0][0]).to.be.instanceOf(ShallowWrapper);
      expect(spy.args[0][0].hasClass('bax')).to.equal(true);
      expect(spy.args[0][1]).to.equal(0);
      expect(spy.args[1][0]).to.be.instanceOf(ShallowWrapper);
      expect(spy.args[1][0].hasClass('bar')).to.equal(true);
      expect(spy.args[1][1]).to.equal(1);
      expect(spy.args[2][0]).to.be.instanceOf(ShallowWrapper);
      expect(spy.args[2][0].hasClass('baz')).to.equal(true);
      expect(spy.args[2][1]).to.equal(2);
    });

    it('returns an array with the mapped values', () => {
      const wrapper = shallow((
        <div>
          <div className="foo bax" />
          <div className="foo bar" />
          <div className="foo baz" />
        </div>
      ));
      const result = wrapper.find('.foo').map(w => w.props().className);

      expect(result).to.eql([
        'foo bax',
        'foo bar',
        'foo baz',
      ]);
    });
  });

  describe('.reduce(fn[, initialValue])', () => {
    it('has the right length', () => {
      expect(ShallowWrapper.prototype.reduce).to.have.lengthOf(1);
    });

    it('calls a function with a wrapper for each node in the wrapper', () => {
      const wrapper = shallow((
        <div>
          <div className="foo bax" />
          <div className="foo bar" />
          <div className="foo baz" />
        </div>
      ));
      const spy = sinon.spy(n => n + 1);

      wrapper.find('.foo').reduce(spy, 0);

      expect(spy).to.have.property('callCount', 3);
      expect(spy.args[0][1]).to.be.instanceOf(ShallowWrapper);
      expect(spy.args[0][1].hasClass('bax')).to.equal(true);
      expect(spy.args[1][1]).to.be.instanceOf(ShallowWrapper);
      expect(spy.args[1][1].hasClass('bar')).to.equal(true);
      expect(spy.args[2][1]).to.be.instanceOf(ShallowWrapper);
      expect(spy.args[2][1].hasClass('baz')).to.equal(true);
    });

    it('accumulates a value', () => {
      const wrapper = shallow((
        <div>
          <div id="bax" className="foo qoo" />
          <div id="bar" className="foo boo" />
          <div id="baz" className="foo hoo" />
        </div>
      ));
      const result = wrapper.find('.foo').reduce(
        (obj, n) => {
          obj[n.prop('id')] = n.prop('className');
          return obj;
        },
        {},
      );

      expect(result).to.eql({
        bax: 'foo qoo',
        bar: 'foo boo',
        baz: 'foo hoo',
      });
    });

    it('allows the initialValue to be omitted', () => {
      const one = (<div id="bax" className="foo qoo" />);
      const two = (<div id="bar" className="foo boo" />);
      const three = (<div id="baz" className="foo hoo" />);
      const wrapper = shallow((
        <div>
          {one}
          {two}
          {three}
        </div>
      ));
      const counter = (<noscript id="counter" />);
      const result = wrapper
        .find('.foo')
        .reduce((acc, n) => [].concat(acc, n, new ShallowWrapper(counter)))
        .map(getWrapperPropSelector('id'));

      expect(result).to.eql([one, two, counter, three, counter].map(getElementPropSelector('id')));
    });
  });

  describe('.reduceRight(fn[, initialValue])', () => {
    it('has the right length', () => {
      expect(ShallowWrapper.prototype.reduceRight).to.have.lengthOf(1);
    });

    it('calls a function with a wrapper for each node in the wrapper in reverse', () => {
      const wrapper = shallow((
        <div>
          <div className="foo bax" />
          <div className="foo bar" />
          <div className="foo baz" />
        </div>
      ));
      const spy = sinon.spy(n => n + 1);

      wrapper.find('.foo').reduceRight(spy, 0);

      expect(spy).to.have.property('callCount', 3);
      expect(spy.args[0][1]).to.be.instanceOf(ShallowWrapper);
      expect(spy.args[0][1].hasClass('baz')).to.equal(true);
      expect(spy.args[1][1]).to.be.instanceOf(ShallowWrapper);
      expect(spy.args[1][1].hasClass('bar')).to.equal(true);
      expect(spy.args[2][1]).to.be.instanceOf(ShallowWrapper);
      expect(spy.args[2][1].hasClass('bax')).to.equal(true);
    });

    it('accumulates a value', () => {
      const wrapper = shallow((
        <div>
          <div id="bax" className="foo qoo" />
          <div id="bar" className="foo boo" />
          <div id="baz" className="foo hoo" />
        </div>
      ));
      const result = wrapper.find('.foo').reduceRight(
        (obj, n) => {
          obj[n.prop('id')] = n.prop('className');
          return obj;
        },
        {},
      );

      expect(result).to.eql({
        bax: 'foo qoo',
        bar: 'foo boo',
        baz: 'foo hoo',
      });
    });

    it('allows the initialValue to be omitted', () => {
      const one = (<div id="bax" className="foo qoo" />);
      const two = (<div id="bar" className="foo boo" />);
      const three = (<div id="baz" className="foo hoo" />);
      const wrapper = shallow((
        <div>
          {one}
          {two}
          {three}
        </div>
      ));
      const counter = (<noscript id="counter" />);
      const result = wrapper
        .find('.foo')
        .reduceRight((acc, n) => [].concat(acc, n, new ShallowWrapper(counter)))
        .map(getWrapperPropSelector('id'));

      expect(result).to.eql([three, two, counter, one, counter].map(getElementPropSelector('id')));
    });
  });

  describe('.slice([begin[, end]])', () => {
    it('returns an identical wrapper if no params are set', () => {
      const wrapper = shallow((
        <div>
          <div className="foo bax" />
          <div className="foo bar" />
          <div className="foo baz" />
        </div>
      ));
      expect(wrapper.find('.foo').slice()).to.have.lengthOf(3);
      expect(wrapper.find('.foo').slice().at(0).hasClass('bax')).to.equal(true);
      expect(wrapper.find('.foo').slice().at(1).hasClass('bar')).to.equal(true);
      expect(wrapper.find('.foo').slice().at(2).hasClass('baz')).to.equal(true);
    });

    it('returns a new wrapper if begin is set', () => {
      const wrapper = shallow((
        <div>
          <div className="foo bax" />
          <div className="foo bar" />
          <div className="foo baz" />
        </div>
      ));
      expect(wrapper.find('.foo').slice(1)).to.have.lengthOf(2);
      expect(wrapper.find('.foo').slice(1).at(0).hasClass('bar')).to.equal(true);
      expect(wrapper.find('.foo').slice(1).at(1).hasClass('baz')).to.equal(true);
    });

    it('returns a new wrapper if begin and end are set', () => {
      const wrapper = shallow((
        <div>
          <div className="foo bax" />
          <div className="foo bar" />
          <div className="foo baz" />
        </div>
      ));
      expect(wrapper.find('.foo').slice(1, 2)).to.have.lengthOf(1);
      expect(wrapper.find('.foo').slice(1, 2).at(0).hasClass('bar')).to.equal(true);
    });

    it('returns a new wrapper if begin and end are set (negative)', () => {
      const wrapper = shallow((
        <div>
          <div className="foo bax" />
          <div className="foo bar" />
          <div className="foo baz" />
        </div>
      ));
      expect(wrapper.find('.foo').slice(-2, -1)).to.have.lengthOf(1);
      expect(wrapper.find('.foo').slice(-2, -1).at(0).hasClass('bar')).to.equal(true);
    });
  });

  describe('.some(selector)', () => {
    it('returns if a node matches a selector', () => {
      const wrapper = shallow((
        <div>
          <div className="foo qoo" />
          <div className="foo boo" />
          <div className="foo hoo" />
        </div>
      ));
      expect(wrapper.find('.foo').some('.qoo')).to.equal(true);
      expect(wrapper.find('.foo').some('.foo')).to.equal(true);
      expect(wrapper.find('.foo').some('.bar')).to.equal(false);
    });

    it('throws if called on root', () => {
      const wrapper = shallow((
        <div>
          <div className="foo" />
        </div>
      ));
      expect(() => wrapper.some('.foo')).to.throw(
        Error,
        'ShallowWrapper::some() can not be called on the root',
      );
    });
  });

  describe('.someWhere(predicate)', () => {
    it('returns if a node matches a predicate', () => {
      const wrapper = shallow((
        <div>
          <div className="foo qoo" />
          <div className="foo boo" />
          <div className="foo hoo" />
        </div>
      ));
      expect(wrapper.find('.foo').someWhere(n => n.hasClass('qoo'))).to.equal(true);
      expect(wrapper.find('.foo').someWhere(n => n.hasClass('foo'))).to.equal(true);
      expect(wrapper.find('.foo').someWhere(n => n.hasClass('bar'))).to.equal(false);
    });
  });

  describe('.every(selector)', () => {
    it('returns if every node matches a selector', () => {
      const wrapper = shallow((
        <div>
          <div className="foo qoo" />
          <div className="foo boo" />
          <div className="foo hoo" />
        </div>
      ));
      expect(wrapper.find('.foo').every('.foo')).to.equal(true);
      expect(wrapper.find('.foo').every('.qoo')).to.equal(false);
      expect(wrapper.find('.foo').every('.bar')).to.equal(false);
    });
  });

  describe('.everyWhere(predicate)', () => {
    it('returns if every node matches a predicate', () => {
      const wrapper = shallow((
        <div>
          <div className="foo qoo" />
          <div className="foo boo" />
          <div className="foo hoo" />
        </div>
      ));
      expect(wrapper.find('.foo').everyWhere(n => n.hasClass('foo'))).to.equal(true);
      expect(wrapper.find('.foo').everyWhere(n => n.hasClass('qoo'))).to.equal(false);
      expect(wrapper.find('.foo').everyWhere(n => n.hasClass('bar'))).to.equal(false);
    });
  });

  describe('.flatMap(fn)', () => {
    it('returns a wrapper with the mapped and flattened nodes', () => {
      const wrapper = shallow((
        <div>
          <div className="foo">
            <div className="bar" />
            <div className="bar" />
          </div>
          <div className="foo">
            <div className="baz" />
            <div className="baz" />
          </div>
          <div className="foo">
            <div className="bax" />
            <div className="bax" />
          </div>
        </div>
      ));

      const nodes = wrapper.find('.foo').flatMap(w => w.children().getElements());

      expect(nodes).to.have.lengthOf(6);
      expect(nodes.at(0).hasClass('bar')).to.equal(true);
      expect(nodes.at(1).hasClass('bar')).to.equal(true);
      expect(nodes.at(2).hasClass('baz')).to.equal(true);
      expect(nodes.at(3).hasClass('baz')).to.equal(true);
      expect(nodes.at(4).hasClass('bax')).to.equal(true);
      expect(nodes.at(5).hasClass('bax')).to.equal(true);
    });
  });

  describe('.shallow()', () => {
    it('returns a shallow rendered instance of the current node', () => {
      class Bar extends React.Component {
        render() {
          return (
            <div>
              <div className="in-bar" />
            </div>
          );
        }
      }
      class Foo extends React.Component {
        render() {
          return (
            <div>
              <Bar />
            </div>
          );
        }
      }
      const wrapper = shallow(<Foo />);
      expect(wrapper.find('.in-bar')).to.have.lengthOf(0);
      expect(wrapper.find(Bar)).to.have.lengthOf(1);
      expect(wrapper.find(Bar).shallow().find('.in-bar')).to.have.lengthOf(1);
    });

    describe('context', () => {
      it('can pass in context', () => {
        class Bar extends React.Component {
          render() {
            return <div>{this.context.name}</div>;
          }
        }
        Bar.contextTypes = {
          name: PropTypes.string,
        };
        class Foo extends React.Component {
          render() {
            return (
              <div>
                <Bar />
              </div>
            );
          }
        }

        const context = { name: 'foo' };
        const wrapper = shallow(<Foo />);
        expect(wrapper.find(Bar)).to.have.lengthOf(1);
        expect(wrapper.find(Bar).shallow({ context }).text()).to.equal('foo');
      });

      it('does not throw if context is passed in but contextTypes is missing', () => {
        class Bar extends React.Component {
          render() {
            return <div>{this.context.name}</div>;
          }
        }
        class Foo extends React.Component {
          render() {
            return (
              <div>
                <Bar />
              </div>
            );
          }
        }

        const context = { name: 'foo' };
        const wrapper = shallow(<Foo />);
        expect(() => wrapper.find(Bar).shallow({ context })).to.not.throw();
      });

      it('is introspectable through context API', () => {
        class Bar extends React.Component {
          render() {
            return <div>{this.context.name}</div>;
          }
        }
        Bar.contextTypes = {
          name: PropTypes.string,
        };
        class Foo extends React.Component {
          render() {
            return (
              <div>
                <Bar />
              </div>
            );
          }
        }

        const context = { name: 'foo' };
        const wrapper = shallow(<Foo />).find(Bar).shallow({ context });

        expect(wrapper.context().name).to.equal(context.name);
        expect(wrapper.context('name')).to.equal(context.name);
      });

      it('filters context to childContextTypes', () => {
        class Bar extends React.Component {
          render() {
            return <div />;
          }
        }
        Bar.contextTypes = {
          name: PropTypes.string,
        };
        class Foo extends React.Component {
          render() {
            return (
              <div>
                <Bar />
              </div>
            );
          }
        }

        const context = { name: 'foo', hello: 'world' };
        const wrapper = shallow(<Foo />, { context });
        expect(wrapper.find(Bar).dive().context()).to.eql({ name: 'foo' });
      });
    });

    describeIf(is('> 0.13'), 'stateless function components (SFCs)', () => {
      it('returns a shallow rendered instance of the current node', () => {
        const Bar = () => (
          <div>
            <div className="in-bar" />
          </div>
        );
        const Foo = () => (
          <div>
            <Bar />
          </div>
        );

        const wrapper = shallow(<Foo />);
        expect(wrapper.find('.in-bar')).to.have.lengthOf(0);
        expect(wrapper.find(Bar)).to.have.lengthOf(1);
        expect(wrapper.find(Bar).shallow().find('.in-bar')).to.have.lengthOf(1);
      });

      describe('context', () => {
        it('can pass in context', () => {
          const Bar = (props, context) => (
            <div>{context.name}</div>
          );
          Bar.contextTypes = { name: PropTypes.string };
          const Foo = () => (
            <div>
              <Bar />
            </div>
          );

          const context = { name: 'foo' };
          const wrapper = shallow(<Foo />);
          expect(wrapper.find(Bar).shallow({ context }).text()).to.equal('foo');
        });

        it('does not throw if context is passed in but contextTypes is missing', () => {
          const Bar = (props, context) => (
            <div>{context.name}</div>
          );
          const Foo = () => (
            <div>
              <Bar />
            </div>
          );

          const context = { name: 'foo' };
          const wrapper = shallow(<Foo />);
          expect(() => wrapper.find(Bar).shallow({ context })).to.not.throw();
        });

        itIf(is('< 16'), 'is introspectable through context API', () => {
          const Bar = (props, context) => (
            <div>{context.name}</div>
          );
          Bar.contextTypes = { name: PropTypes.string };
          const Foo = () => (
            <div>
              <Bar />
            </div>
          );

          const context = { name: 'foo' };
          const wrapper = shallow(<Foo />).find(Bar).shallow({ context });

          expect(wrapper.context().name).to.equal(context.name);
          expect(wrapper.context('name')).to.equal(context.name);
        });

        itIf(is('>= 16'), 'will throw when trying to inspect context', () => {
          const Bar = (props, context) => (
            <div>{context.name}</div>
          );
          Bar.contextTypes = { name: PropTypes.string };
          const Foo = () => (
            <div>
              <Bar />
            </div>
          );

          const context = { name: 'foo' };
          const wrapper = shallow(<Foo />).find(Bar).shallow({ context });

          expect(() => wrapper.context()).to.throw(
            Error,
            'ShallowWrapper::context() can only be called on wrapped nodes that have a non-null instance',
          );
          expect(() => wrapper.context('name')).to.throw(
            Error,
            'ShallowWrapper::context() can only be called on wrapped nodes that have a non-null instance',
          );
        });
      });
    });
  });

  describe('.first()', () => {
    it('returns the first node in the current set', () => {
      const wrapper = shallow((
        <div>
          <div className="bar baz" />
          <div className="bar" />
          <div className="bar" />
          <div className="bar" />
        </div>
      ));
      expect(wrapper.find('.bar').first().hasClass('baz')).to.equal(true);
    });
  });

  describe('.last()', () => {
    it('returns the last node in the current set', () => {
      const wrapper = shallow((
        <div>
          <div className="bar" />
          <div className="bar" />
          <div className="bar" />
          <div className="bar baz" />
        </div>
      ));
      expect(wrapper.find('.bar').last().hasClass('baz')).to.equal(true);
    });
  });

  describe('.isEmpty()', () => {
    let warningStub;
    let fooNode;
    let missingNode;

    beforeEach(() => {
      warningStub = sinon.stub(console, 'warn');
      const wrapper = shallow((
        <div className="foo" />
      ));
      fooNode = wrapper.find('.foo');
      missingNode = wrapper.find('.missing');
    });
    afterEach(() => {
      warningStub.restore();
    });

    it('displays a deprecation warning', () => {
      fooNode.isEmpty();
      expect(warningStub.calledWith('Enzyme::Deprecated method isEmpty() called, use exists() instead.')).to.equal(true);
    });

    it('calls exists() instead', () => {
      const existsSpy = sinon.spy();
      fooNode.exists = existsSpy;
      fooNode.isEmpty();
      expect(existsSpy.called).to.equal(true);
    });

    it('returns true if wrapper is empty', () => {
      expect(fooNode.isEmpty()).to.equal(false);
      expect(missingNode.isEmpty()).to.equal(true);
    });
  });

  describe('.exists()', () => {
    it('has no required arguments', () => {
      expect(ShallowWrapper.prototype.exists).to.have.lengthOf(0);
    });

    describe('without argument', () => {
      it('returns true if node exists in wrapper', () => {
        const wrapper = shallow((
          <div className="foo" />
        ));
        expect(wrapper.find('.bar').exists()).to.equal(false);
        expect(wrapper.find('.foo').exists()).to.equal(true);
      });
    });
    describe('with argument', () => {
      it('throws on invalid EnzymeSelector', () => {
        const wrapper = shallow(<div />);

        expect(() => wrapper.exists(null)).to.throw(TypeError);
        expect(() => wrapper.exists(undefined)).to.throw(TypeError);
        expect(() => wrapper.exists(45)).to.throw(TypeError);
        expect(() => wrapper.exists({})).to.throw(TypeError);
      });

      it('returns .find(arg).exists() instead', () => {
        const wrapper = shallow(<div />);
        const fakeFindExistsReturnVal = Symbol('fake .find(arg).exists() return value');
        const fakeSelector = '.someClass';
        wrapper.find = sinon.stub().returns({ exists: () => fakeFindExistsReturnVal });
        const existsResult = wrapper.exists(fakeSelector);
        expect(wrapper.find).to.have.property('callCount', 1);
        expect(wrapper.find.firstCall.args[0]).to.equal(fakeSelector);
        expect(existsResult).to.equal(fakeFindExistsReturnVal);
      });
    });
  });

  describe('.at(index)', () => {
    it('gets a wrapper of the node at the specified index', () => {
      const wrapper = shallow((
        <div>
          <div className="bar foo" />
          <div className="bar bax" />
          <div className="bar bux" />
          <div className="bar baz" />
        </div>
      ));
      expect(wrapper.find('.bar').at(0).hasClass('foo')).to.equal(true);
      expect(wrapper.find('.bar').at(1).hasClass('bax')).to.equal(true);
      expect(wrapper.find('.bar').at(2).hasClass('bux')).to.equal(true);
      expect(wrapper.find('.bar').at(3).hasClass('baz')).to.equal(true);
    });

    it('`.at()` does not affect the results of `.exists()`', () => {
      const wrapper = shallow((
        <div>
          <div className="foo" />
        </div>
      ));
      expect(wrapper.find('.bar').exists()).to.equal(false);
      expect(wrapper.find('.bar').at(0).exists()).to.equal(false);

      expect(wrapper.find('.foo').exists()).to.equal(true);
      expect(wrapper.find('.foo').at(0).exists()).to.equal(true);
    });
  });

  describe('.get(index)', () => {
    it('gets the node at the specified index', () => {
      const wrapper = shallow((
        <div>
          <div className="bar foo" />
          <div className="bar bax" />
          <div className="bar bux" />
          <div className="bar baz" />
        </div>
      ));
      expect(wrapper.find('.bar').get(0)).to.deep.equal(wrapper.find('.foo').getElement());
      expect(wrapper.find('.bar').get(1)).to.deep.equal(wrapper.find('.bax').getElement());
      expect(wrapper.find('.bar').get(2)).to.deep.equal(wrapper.find('.bux').getElement());
      expect(wrapper.find('.bar').get(3)).to.deep.equal(wrapper.find('.baz').getElement());
    });

    it('does not add a "null" key to elements with a ref and no key', () => {
      class Foo extends React.Component {
        constructor(props) {
          super(props);
          this.setRef = this.setRef.bind(this);
        }

        setRef(node) {
          this.node = node;
        }

        render() {
          return (
            <div ref={this.setRef} className="foo" />
          );
        }
      }
      const wrapper = shallow(<Foo />);
      expect(wrapper.get(0).key).to.equal(null);
    });
  });

  describe('.debug()', () => {
    it('passes through to the debugNodes function', () => {
      expect(shallow(<div />).debug()).to.equal('<div />');
    });
  });

  describe('.html()', () => {
    it('returns html of straight DOM elements', () => {
      const wrapper = shallow((
        <div className="test">
          <span>Hello World!</span>
        </div>
      ));
      expect(wrapper.html()).to.equal((
        '<div class="test"><span>Hello World!</span></div>'
      ));
    });

    it('renders out nested composite components', () => {
      class Foo extends React.Component {
        render() {
          return (<div className="in-foo" />);
        }
      }
      class Bar extends React.Component {
        render() {
          return (
            <div className="in-bar">
              <Foo />
            </div>
          );
        }
      }
      const wrapper = shallow(<Bar />);
      expect(wrapper.html()).to.equal((
        '<div class="in-bar"><div class="in-foo"></div></div>'
      ));
      expect(wrapper.find(Foo).html()).to.equal((
        '<div class="in-foo"></div>'
      ));
    });

    describeIf(is('> 0.13'), 'stateless function components (SFCs)', () => {
      it('renders out nested composite components', () => {
        const Foo = () => (
          <div className="in-foo" />
        );
        const Bar = () => (
          <div className="in-bar">
            <Foo />
          </div>
        );

        const wrapper = shallow(<Bar />);
        expect(wrapper.html()).to.equal((
          '<div class="in-bar"><div class="in-foo"></div></div>'
        ));
        expect(wrapper.find(Foo).html()).to.equal((
          '<div class="in-foo"></div>'
        ));
      });
    });

    describeIf(is('>16.2'), 'Fragments', () => {
      class FragmentClassExample extends React.Component {
        render() {
          return (
            <Fragment>
              <div><span>Foo</span></div>
              <div><span>Bar</span></div>
            </Fragment>
          );
        }
      }

      const FragmentConstExample = () => (
        <Fragment>
          <div><span>Foo</span></div>
          <div><span>Bar</span></div>
        </Fragment>
      );

      class ClassChild extends React.Component {
        render() {
          return <div>Class child</div>;
        }
      }

      function SFCChild() {
        return <div>SFC child</div>;
      }

      class FragmentWithCustomChildClass extends React.Component {
        render() {
          return (
            <Fragment>
              <ClassChild />
              <SFCChild />
            </Fragment>
          );
        }
      }

      it('correctly renders html for both children for class', () => {
        const classWrapper = shallow(<FragmentClassExample />);
        expect(classWrapper.html()).to.equal('<div><span>Foo</span></div><div><span>Bar</span></div>');
      });

      it('correctly renders html for both children for const', () => {
        const constWrapper = shallow(<FragmentConstExample />);
        expect(constWrapper.html()).to.equal('<div><span>Foo</span></div><div><span>Bar</span></div>');
      });

      it('correctly renders html for custom component children', () => {
        const withChildrenWrapper = shallow(<FragmentWithCustomChildClass />);
        expect(withChildrenWrapper.html()).to.equal('<div>Class child</div><div>SFC child</div>');
      });
    });
  });

  describe('.unmount()', () => {
    it('calls componentWillUnmount()', () => {
      const spy = sinon.spy();

      class Foo extends React.Component {
        constructor(props) {
          super(props);
          this.componentWillUnmount = spy;
        }

        render() {
          return (
            <div className={this.props.id}>
              {this.props.id}
            </div>
          );
        }
      }
      const wrapper = shallow(<Foo id="foo" />);
      expect(spy).to.have.property('callCount', 0);
      wrapper.unmount();
      expect(spy).to.have.property('callCount', 1);
    });
  });

  describe('.render()', () => {
    it('returns a cheerio wrapper around the current node', () => {
      class Foo extends React.Component {
        render() {
          return (<div className="in-foo" />);
        }
      }

      class Bar extends React.Component {
        render() {
          return (
            <div className="in-bar">
              <Foo />
            </div>
          );
        }
      }

      const wrapper = shallow(<Bar />);

      expect(wrapper.render().find('.in-foo')).to.have.lengthOf(1);

      const rendered = wrapper.render();
      expect(rendered.is('.in-bar')).to.equal(true);
      expect(rendered).to.have.lengthOf(1);

      const renderedFoo = wrapper.find(Foo).render();
      expect(renderedFoo.is('.in-foo')).to.equal(true);
      expect(renderedFoo.is('.in-bar')).to.equal(false);
      expect(renderedFoo.find('.in-bar')).to.have.lengthOf(0);
    });

    describeIf(is('> 0.13'), 'stateless functional components', () => {
      it('returns a cheerio wrapper around the current node', () => {
        const Foo = () => (
          <div className="in-foo" />
        );

        const Bar = () => (
          <div className="in-bar">
            <Foo />
          </div>
        );

        const wrapper = shallow(<Bar />);

        expect(wrapper.render().find('.in-foo')).to.have.lengthOf(1);
        expect(wrapper.render().is('.in-bar')).to.equal(true);

        const renderedFoo = wrapper.find(Foo).render();
        expect(renderedFoo.is('.in-foo')).to.equal(true);
        expect(renderedFoo.is('.in-bar')).to.equal(false);
        expect(renderedFoo.find('.in-bar')).to.have.lengthOf(0);
      });
    });
  });

  wrap()
    .withConsoleThrows()
    .describe('.renderProp()', () => {
      it('returns a wrapper around the node returned from the render prop', () => {
        class Foo extends React.Component {
          render() {
            return <div className="in-foo" />;
          }
        }
        class Bar extends React.Component {
          render() {
            const { render: r } = this.props;
            return <div className="in-bar">{r()}</div>;
          }
        }

        const wrapperA = shallow(<div><Bar render={() => <div><Foo /></div>} /></div>);
        const renderPropWrapperA = wrapperA.find(Bar).renderProp('render')();
        expect(renderPropWrapperA.find(Foo)).to.have.lengthOf(1);

        const wrapperB = shallow(<div><Bar render={() => <Foo />} /></div>);
        const renderPropWrapperB = wrapperB.find(Bar).renderProp('render')();
        expect(renderPropWrapperB.find(Foo)).to.have.lengthOf(1);

        const stub = sinon.stub().returns(<div />);
        const wrapperC = shallow(<div><Bar render={stub} /></div>);
        stub.resetHistory();
        wrapperC.find(Bar).renderProp('render')('one', 'two');
        expect(stub.args).to.deep.equal([['one', 'two']]);
      });

      it('throws on host elements', () => {
        class Div extends React.Component {
          render() {
            const { children } = this.props;
            return <div>{children}</div>;
          }
        }

        const wrapper = shallow(<Div />);
        expect(wrapper.is('div')).to.equal(true);
        expect(() => wrapper.renderProp('foo')).to.throw();
      });

      wrap()
        .withOverride(() => getAdapter(), 'wrap', () => undefined)
        .it('throws with a react adapter that lacks a `.wrap`', () => {
          class Foo extends React.Component {
            render() {
              return <div className="in-foo" />;
            }
          }
          class Bar extends React.Component {
            render() {
              const { render: r } = this.props;
              return <div className="in-bar">{r()}</div>;
            }
          }

          const wrapper = shallow(<div><Bar render={() => <div><Foo /></div>} /></div>);
          expect(() => wrapper.find(Bar).renderProp('render')).to.throw(RangeError);
        });

      describeIf(is('>= 16'), 'allows non-nodes', () => {
        function MyComponent({ val }) {
          return <ComponentWithRenderProp val={val} r={x => x} />;
        }

        function ComponentWithRenderProp({ val, r }) {
          return r(val);
        }

        it('works with strings', () => {
          const wrapper = shallow(<MyComponent val="foo" />);

          wrapper.find(ComponentWithRenderProp).renderProp('r')('foo');

          wrapper.find(ComponentWithRenderProp).renderProp('r')('');
        });

        it('works with numbers', () => {
          const wrapper = shallow(<MyComponent val={42} />);

          wrapper.find(ComponentWithRenderProp).renderProp('r')(42);

          wrapper.find(ComponentWithRenderProp).renderProp('r')(0);

          wrapper.find(ComponentWithRenderProp).renderProp('r')(NaN);
        });

        it('works with arrays', () => {
          const wrapper = shallow(<MyComponent val={[]} />);

          wrapper.find(ComponentWithRenderProp).renderProp('r')([]);

          wrapper.find(ComponentWithRenderProp).renderProp('r')(['a']);

          wrapper.find(ComponentWithRenderProp).renderProp('r')([Infinity]);
        });

        it('works with false', () => {
          const wrapper = shallow(<MyComponent val={false} />);

          wrapper.find(ComponentWithRenderProp).renderProp('r')(false);
        });

        it('throws with true', () => {
          const wrapper = shallow(<MyComponent val={false} />);

          expect(() => wrapper.find(ComponentWithRenderProp).renderProp('r')(true).shallow()).to.throw();
        });
      });
    });

  describe('lifecycle methods', () => {
    describe('disableLifecycleMethods option', () => {
      describe('validation', () => {
        it('throws for a non-boolean value', () => {
          ['value', 42, null].forEach((value) => {
            expect(() => shallow(<div />, {
              disableLifecycleMethods: value,
            })).to.throw(/true or false/);
          });
        });

        it('does not throw for a boolean value or undefined', () => {
          [true, false, undefined].forEach((value) => {
            expect(() => shallow(<div />, {
              disableLifecycleMethods: value,
            })).not.to.throw();
          });
        });

        it('does not throw when no lifecycle flags are provided in options', () => {
          expect(() => shallow(<div />, {})).not.to.throw();
        });

        it('throws when used with lifecycleExperimental in invalid combinations', () => {
          [true, false].forEach((value) => {
            expect(() => shallow(<div />, {
              lifecycleExperimental: value,
              disableLifecycleMethods: value,
            })).to.throw(/same value/);
          });
        });
      });

      describe('when disabled', () => {
        let wrapper;
        const spy = sinon.spy();
        class Foo extends React.Component {
          componentWillMount() { spy('componentWillMount'); }

          componentDidMount() { spy('componentDidMount'); }

          componentWillReceiveProps() { spy('componentWillReceiveProps'); }

          shouldComponentUpdate() {
            spy('shouldComponentUpdate');
            return true;
          }

          componentWillUpdate() { spy('componentWillUpdate'); }

          componentDidUpdate() { spy('componentDidUpdate'); }

          componentWillUnmount() { spy('componentWillUnmount'); }

          render() {
            spy('render');
            return <div>foo</div>;
          }
        }

        const options = {
          disableLifecycleMethods: true,
          context: {
            foo: 'foo',
          },
        };

        beforeEach(() => {
          wrapper = shallow(<Foo />, options);
          spy.resetHistory();
        });

        it('does not call componentDidMount when mounting', () => {
          wrapper = shallow(<Foo />, options);
          expect(spy.args).to.deep.equal([
            ['componentWillMount'],
            ['render'],
          ]);
        });

        it('calls expected methods when receiving new props', () => {
          wrapper.setProps({ foo: 'foo' });
          expect(spy.args).to.deep.equal([
            ['componentWillReceiveProps'],
            ['shouldComponentUpdate'],
            ['componentWillUpdate'],
            ['render'],
          ]);
        });

        describeIf(is('0.13 || 15 || > 16'), 'setContext', () => {
          it('calls expected methods when receiving new context', () => {
            wrapper.setContext({ foo: 'foo' });
            expect(spy.args).to.deep.equal([
              ['componentWillReceiveProps'],
              ['shouldComponentUpdate'],
              ['componentWillUpdate'],
              ['render'],
            ]);
          });
        });

        describeIf(is('16'), 'setContext', () => {
          it('calls expected methods when receiving new context', () => {
            wrapper.setContext({ foo: 'foo' });
            expect(spy.args).to.deep.equal([
              ['shouldComponentUpdate'],
              ['componentWillUpdate'],
              ['render'],
            ]);
          });
        });

        describeIf(is('0.14'), 'setContext', () => {
          it('calls expected methods when receiving new context', () => {
            wrapper.setContext({ foo: 'foo' });
            expect(spy.args).to.deep.equal([
              ['shouldComponentUpdate'],
              ['componentWillUpdate'],
              ['render'],
            ]);
          });
        });

        itIf(is('< 16'), 'calls expected methods for setState', () => {
          wrapper.setState({ bar: 'bar' });
          expect(spy.args).to.deep.equal([
            ['shouldComponentUpdate'],
            ['componentWillUpdate'],
            ['render'],
            ['componentDidUpdate'],
          ]);
        });

        // componentDidUpdate is not called in react 16
        itIf(is('>= 16'), 'calls expected methods for setState', () => {
          wrapper.setState({ bar: 'bar' });
          expect(spy.args).to.deep.equal([
            ['shouldComponentUpdate'],
            ['componentWillUpdate'],
            ['render'],
          ]);
        });

        it('calls expected methods when unmounting', () => {
          wrapper.unmount();
          expect(spy.args).to.deep.equal([
            ['componentWillUnmount'],
          ]);
        });
      });

      it('does not call when disableLifecycleMethods flag is true', () => {
        const spy = sinon.spy();
        class Foo extends React.Component {
          componentDidMount() {
            spy();
          }

          render() {
            return <div>foo</div>;
          }
        }
        shallow(<Foo />, { disableLifecycleMethods: true });
        expect(spy).to.have.property('callCount', 0);
      });

      it('calls `componentDidMount` directly when disableLifecycleMethods is true', () => {
        class Table extends React.Component {
          render() {
            return (<table />);
          }
        }

        class MyComponent extends React.Component {
          constructor(props) {
            super(props);
            this.state = {
              showTable: false,
            };
          }

          componentDidMount() {
            this.setState({ showTable: true });
          }

          render() {
            const { showTable } = this.state;
            return (<div>{showTable ? <Table /> : null}</div>);
          }
        }
        const wrapper = shallow(<MyComponent />, { disableLifecycleMethods: true });
        expect(wrapper.find(Table).length).to.equal(0);
        wrapper.instance().componentDidMount();
        expect(wrapper.find(Table).length).to.equal(1);
      });

      it('calls shouldComponentUpdate when disableLifecycleMethods flag is true', () => {
        const spy = sinon.spy();
        class Foo extends React.Component {
          constructor(props) {
            super(props);
            this.state = {
              foo: 'bar',
            };
          }

          shouldComponentUpdate() {
            spy();
            return false;
          }

          render() {
            return <div>{this.state.foo}</div>;
          }
        }
        const wrapper = shallow(
          <Foo foo="foo" />,
          {
            context: { foo: 'foo' },
            disableLifecycleMethods: true,
          },
        );
        expect(spy).to.have.property('callCount', 0);
        wrapper.setProps({ foo: 'bar' });
        expect(spy).to.have.property('callCount', 1);
        wrapper.setState({ foo: 'bar' });
        expect(spy).to.have.property('callCount', 2);
        wrapper.setContext({ foo: 'bar' });
        expect(spy).to.have.property('callCount', 3);
      });
    });

    describe('lifecycleExperimental option', () => {
      describe('validation', () => {
        it('throws for a non-boolean value', () => {
          ['value', 42, null].forEach((value) => {
            expect(() => shallow(<div />, {
              lifecycleExperimental: value,
            })).to.throw(/true or false/);
          });
        });

        it('does not throw for a boolean value or when not provided', () => {
          [true, false, undefined].forEach((value) => {
            expect(() => shallow(<div />, {
              lifecycleExperimental: value,
            })).not.to.throw();
          });
        });
      });
    });

    describeIf(is('>= 16.3'), 'getDerivedStateFromProps', () => {
      let spy;

      beforeEach(() => {
        spy = sinon.spy();
      });

      class Spy extends React.Component {
        constructor(...args) {
          super(...args);
          this.state = { state: true }; // eslint-disable-line react/no-unused-state
          spy('constructor');
        }

        shouldComponentUpdate(nextProps, nextState, nextContext) {
          spy('shouldComponentUpdate', {
            prevProps: this.props,
            nextProps,
            prevState: this.state,
            nextState,
            prevContext: this.context,
            nextContext,
          });
          return true;
        }

        componentWillUpdate(nextProps, nextState, nextContext) {
          spy('componentWillUpdate', {
            prevProps: this.props,
            nextProps,
            prevState: this.state,
            nextState,
            prevContext: this.context,
            nextContext,
          });
        }

        componentDidUpdate(prevProps, prevState, prevContext) {
          spy('componentDidUpdate', {
            prevProps,
            nextProps: this.props,
            prevState,
            nextState: this.state,
            prevContext,
            nextContext: this.context,
          });
        }

        render() {
          spy('render');
          return null;
        }
      }

      class CWRP extends Spy {
        componentWillReceiveProps(nextProps, nextContext) {
          spy('componentWillReceiveProps', {
            prevProps: this.props,
            nextProps,
            prevState: this.state,
            nextState: this.state,
            prevContext: this.context,
            nextContext,
          });
        }
      }

      class U_CWRP extends Spy {
        UNSAFE_componentWillReceiveProps(nextProps) { // eslint-disable-line camelcase
          spy('UNSAFE_componentWillReceiveProps', {
            prevProps: this.props,
            nextProps,
            prevState: this.state,
            nextState: this.state,
            prevContext: this.context,
            nextContext: undefined,
          });
        }
      }

      class GDSFP extends Spy {
        static getDerivedStateFromProps(props, state) {
          spy('getDerivedStateFromProps', { props, state });
          return {};
        }
      }

      it('calls cWRP when expected', () => {
        const prevProps = { a: 1 };
        const wrapper = shallow(<CWRP {...prevProps} />);
        expect(spy.args).to.deep.equal([
          ['constructor'],
          ['render'],
        ]);
        spy.resetHistory();

        const foo = {};
        const props = { foo };
        const {
          context: prevContext,
          context: nextContext,
          state: prevState,
          state: nextState,
        } = wrapper.instance();

        wrapper.setProps(props);
        const nextProps = { ...prevProps, ...props };

        const data = {
          prevProps,
          nextProps,
          prevState,
          nextState,
          prevContext,
          nextContext,
        };
        expect(spy.args).to.deep.equal([
          ['componentWillReceiveProps', data],
          ['shouldComponentUpdate', data],
          ['componentWillUpdate', data],
          ['render'],
          ['componentDidUpdate', {
            ...data,
            prevContext: is('>= 16') ? undefined : prevContext,
          }],
        ]);
      });

      it('calls UNSAFE_cWRP when expected', () => {
        const prevProps = { a: 1 };
        // eslint-disable-next-line react/jsx-pascal-case
        const wrapper = shallow(<U_CWRP {...prevProps} />);
        expect(spy.args).to.deep.equal([
          ['constructor'],
          ['render'],
        ]);
        spy.resetHistory();

        const foo = {};
        const props = { foo };
        const {
          context: prevContext,
          context: nextContext,
          state: prevState,
          state: nextState,
        } = wrapper.instance();

        wrapper.setProps(props);
        const nextProps = { ...prevProps, ...props };

        const data = {
          prevProps,
          nextProps,
          prevState,
          nextState,
          prevContext,
          nextContext,
        };
        expect(spy.args).to.deep.equal([
          ['UNSAFE_componentWillReceiveProps', {
            ...data,
            nextContext: is('>= 16') ? undefined : nextContext,
          }],
          ['shouldComponentUpdate', data],
          ['componentWillUpdate', data],
          ['render'],
          ['componentDidUpdate', {
            ...data,
            prevContext: is('>= 16') ? undefined : prevContext,
          }],
        ]);
      });

      it('calls gDSFP when expected', () => {
        const prevProps = { a: 1 };
        const state = { state: true };
        const wrapper = shallow(<GDSFP {...prevProps} />);
        expect(spy.args).to.deep.equal([
          ['constructor'],
          ['getDerivedStateFromProps', {
            props: prevProps,
            state,
          }],
          ['render'],
        ]);
        spy.resetHistory();

        const foo = {};
        const props = { foo };
        const {
          context: prevContext,
          context: nextContext,
          state: prevState,
          state: nextState,
        } = wrapper.instance();

        wrapper.setProps(props);
        const nextProps = { ...prevProps, ...props };

        const data = {
          prevProps,
          nextProps,
          prevState,
          nextState,
          prevContext,
          nextContext,
        };
        expect(spy.args).to.deep.equal([
          ['getDerivedStateFromProps', {
            props: nextProps,
            state: nextState,
          }],
          ['shouldComponentUpdate', data],
          ['render'],
          ['componentDidUpdate', {
            ...data,
            prevContext: is('>= 16') ? undefined : prevContext,
          }],
        ]);
      });

      it('cDU’s nextState differs from `this.state` when gDSFP returns new state', () => {
        class SimpleComponent extends React.Component {
          constructor(props) {
            super(props);
            this.state = { value: props.value };
          }

          static getDerivedStateFromProps(props, state) {
            return props.value === state.value ? null : { value: props.value };
          }

          shouldComponentUpdate(nextProps, nextState) {
            return nextState.value !== this.state.value;
          }

          render() {
            const { value } = this.state;
            return (<input value={value} />);
          }
        }
        const wrapper = shallow(<SimpleComponent value="initial" />);

        expect(wrapper.find('input').prop('value')).to.equal('initial');

        wrapper.setProps({ value: 'updated' });

        expect(wrapper.find('input').prop('value')).to.equal('updated');
      });
    });

    describeIf(is('>= 16'), 'componentDidCatch', () => {
      describe('errors inside an error boundary', () => {
        const errorToThrow = new EvalError('threw an error!');

        const hasFragments = is('>= 16.2');
        const MaybeFragment = hasFragments ? Fragment : 'main';

        function Thrower({ throws }) {
          if (throws) {
            throw errorToThrow;
          }
          return null;
        }

        class ErrorBoundary extends React.Component {
          constructor(...args) {
            super(...args);
            this.state = {
              throws: false,
              didThrow: false,
            };
          }

          componentDidCatch(error, info) {
            const { spy } = this.props;
            spy(error, info);
            this.setState({
              throws: false,
              didThrow: true,
            });
          }

          render() {
            const { throws } = this.state;
            return (
              <div>
                <MaybeFragment>
                  <span>
                    <Thrower throws={throws} />
                    <div>
                      {this.state.didThrow ? 'HasThrown' : 'HasNotThrown'}
                    </div>
                  </span>
                </MaybeFragment>
              </div>
            );
          }
        }

        describe('Thrower', () => {
          it('does not throw when `throws` is `false`', () => {
            expect(() => shallow(<Thrower throws={false} />)).not.to.throw();
          });

          it('throws when `throws` is `true`', () => {
            expect(() => shallow(<Thrower throws />)).to.throw(errorToThrow);
          });
        });

        it('catches a simulated error', () => {
          const spy = sinon.spy();
          const wrapper = shallow(<ErrorBoundary spy={spy} />);

          expect(spy).to.have.property('callCount', 0);

          expect(() => wrapper.find(Thrower).simulateError(errorToThrow)).not.to.throw();

          expect(spy).to.have.property('callCount', 1);

          expect(spy.args).to.be.an('array').and.have.lengthOf(1);
          const [[actualError, info]] = spy.args;
          expect(() => { throw actualError; }).to.throw(errorToThrow);
          expect(info).to.deep.equal({
            componentStack: `
    in Thrower (created by ErrorBoundary)
    in span (created by ErrorBoundary)${hasFragments ? '' : `
    in main (created by ErrorBoundary)`}
    in div (created by ErrorBoundary)
    in ErrorBoundary (created by WrapperComponent)
    in WrapperComponent`,
          });
        });

        it('rerenders on a simulated error', () => {
          const wrapper = shallow(<ErrorBoundary spy={sinon.stub()} />);

          expect(wrapper.find({ children: 'HasThrown' })).to.have.lengthOf(0);
          expect(wrapper.find({ children: 'HasNotThrown' })).to.have.lengthOf(1);

          expect(() => wrapper.find(Thrower).simulateError(errorToThrow)).not.to.throw();

          expect(wrapper.find({ children: 'HasThrown' })).to.have.lengthOf(1);
          expect(wrapper.find({ children: 'HasNotThrown' })).to.have.lengthOf(0);
        });

        it('does not catch errors during shallow render', () => {
          const spy = sinon.spy();
          const wrapper = shallow(<ErrorBoundary spy={spy} />);

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
      });
    });

    context('mounting phase', () => {
      it('calls componentWillMount and componentDidMount', () => {
        const spy = sinon.spy();
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
        shallow(<Foo />);
        expect(spy.args).to.deep.equal([
          ['componentWillMount'],
          ['render'],
          ['componentDidMount'],
        ]);
      });

      itIf(BATCHING, 'is batching updates', () => {
        const spy = sinon.spy();
        class Foo extends React.Component {
          constructor(props) {
            super(props);
            this.state = {
              count: 0,
            };
          }

          componentWillMount() {
            this.setState({ count: this.state.count + 1 });
            this.setState({ count: this.state.count + 1 });
          }

          componentDidMount() {
            this.setState({ count: this.state.count + 1 });
            this.setState({ count: this.state.count + 1 });
          }

          render() {
            spy();
            return <div>{this.state.count}</div>;
          }
        }
        const result = shallow(<Foo />);
        expect(result.state('count')).to.equal(2);
        expect(spy).to.have.property('callCount', 2);
      });
    });

    context('updating props', () => {
      it('calls shouldComponentUpdate, componentWillUpdate, and componentDidUpdate', () => {
        const spy = sinon.spy();

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
            return <div>{this.state.foo}</div>;
          }
        }
        Foo.contextTypes = {
          foo: PropTypes.string,
        };

        const wrapper = shallow(
          <Foo foo="bar" />,
          {
            context: { foo: 'context' },
          },
        );
        wrapper.setProps({ foo: 'baz' });
        wrapper.setProps({ foo: 'bax' });
        expect(spy.args).to.deep.equal([
          [
            'render',
          ],
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
          [
            'render',
          ],
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
          [
            'render',
          ],
          [
            'componentDidUpdate',
            { foo: 'baz' }, { foo: 'bax' },
            { foo: 'state' }, { foo: 'state' },
            is('>= 16') ? undefined : { foo: 'context' },
          ],
        ]);
      });

      it('calls componentWillReceiveProps, shouldComponentUpdate, componentWillUpdate and componentDidUpdate with merged props', () => {
        const spy = sinon.spy();

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
            return (
              <div />
            );
          }
        }

        const wrapper = shallow(<Foo a="a" b="b" />);

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

      it('cancels rendering when Component returns false in shouldComponentUpdate', () => {
        const spy = sinon.spy();

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

        const wrapper = shallow(<Foo foo="bar" />);
        expect(wrapper.instance().props.foo).to.equal('bar');
        wrapper.setProps({ foo: 'baz' });
        expect(wrapper.instance().props.foo).to.equal('baz');
        wrapper.setProps({ foo: 'bax' });
        expect(wrapper.instance().props.foo).to.equal('bax');
        expect(spy.args).to.deep.equal([
          ['render'],
          ['componentWillReceiveProps'],
          ['shouldComponentUpdate'],
          ['componentWillReceiveProps'],
          ['shouldComponentUpdate'],
        ]);
      });

      itIf(BATCHING, 'does not provoke another renders to call setState in componentWillReceiveProps', () => {
        const spy = sinon.spy();
        class Foo extends React.Component {
          constructor(props) {
            super(props);
            this.state = {
              count: 0,
            };
          }

          componentWillReceiveProps() {
            this.setState({ count: this.state.count + 1 });
            this.setState({ count: this.state.count + 1 });
          }

          render() {
            spy();
            return <div>{this.props.foo}</div>;
          }
        }
        const result = shallow(<Foo />);
        expect(spy).to.have.property('callCount', 1);
        result.setProps({ name: 'bar' });
        expect(spy).to.have.property('callCount', 2);
        expect(result.state('count')).to.equal(1);
      });

      itIf(BATCHING, 'provokes an another render to call setState twice in componentWillUpdate', () => {
        const spy = sinon.spy();
        class Foo extends React.Component {
          constructor(props) {
            super(props);
            this.updated = false;
            this.state = {
              count: 0,
            };
          }

          componentWillUpdate() {
            if (!this.updated) {
              this.updated = true;
              this.setState({ count: this.state.count + 1 });
              this.setState({ count: this.state.count + 1 });
            }
          }

          render() {
            spy();
            return <div>{this.props.foo}</div>;
          }
        }
        const result = shallow(<Foo />);
        expect(spy).to.have.property('callCount', 1);
        result.setProps({ name: 'bar' });
        expect(spy).to.have.property('callCount', 3);
        expect(result.state('count')).to.equal(1);
      });

      itIf(BATCHING, 'provokes an another render to call setState twice in componentDidUpdate', () => {
        const spy = sinon.spy();
        class Foo extends React.Component {
          constructor(props) {
            super(props);
            this.updated = false;
            this.state = {
              count: 0,
            };
          }

          componentDidUpdate() {
            if (!this.updated) {
              this.updated = true;
              /* eslint-disable react/no-did-update-set-state */
              this.setState({ count: this.state.count + 1 });
              this.setState({ count: this.state.count + 1 });
              /* eslint-enable react/no-did-update-set-state */
            }
          }

          render() {
            spy();
            return <div>{this.props.foo}</div>;
          }
        }
        const result = shallow(<Foo />);
        expect(spy).to.have.property('callCount', 1);
        result.setProps({ name: 'bar' });
        expect(spy).to.have.property('callCount', 3);
        expect(result.state('count')).to.equal(1);
      });
    });

    context('updating state', () => {
      it('calls shouldComponentUpdate, componentWillUpdate and componentDidUpdate', () => {
        const spy = sinon.spy();

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
            return <div>{this.state.foo}</div>;
          }
        }
        Foo.contextTypes = {
          foo: PropTypes.string,
        };

        const wrapper = shallow(
          <Foo foo="props" />,
          {
            context: { foo: 'context' },
          },
        );
        wrapper.setState({ foo: 'baz' });
        const expected = [
          [
            'render',
          ],
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
          [
            'render',
          ],
          [
            'componentDidUpdate',
            { foo: 'props' }, { foo: 'props' },
            { foo: 'bar' }, { foo: 'baz' },
            is('>= 16') ? undefined : { foo: 'context' },
          ],
        ];
        expect(spy.args).to.deep.equal(expected);
      });

      it('cancels rendering when Component returns false in shouldComponentUpdate', () => {
        const spy = sinon.spy();
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
            return <div>{this.state.foo}</div>;
          }
        }
        const wrapper = shallow(<Foo />);
        expect(wrapper.instance().state.foo).to.equal('bar');
        wrapper.setState({ foo: 'baz' });
        expect(wrapper.instance().state.foo).to.equal('baz');
        expect(spy.args).to.deep.equal([['render'], ['shouldComponentUpdate']]);
      });

      itIf(BATCHING, 'provokes an another render to call setState twice in componentWillUpdate', () => {
        const spy = sinon.spy();
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
            if (!this.updated) {
              this.updated = true;
              this.setState({ count: this.state.count + 1 });
              this.setState({ count: this.state.count + 1 });
            }
          }

          render() {
            spy();
            return <div>{this.state.name}</div>;
          }
        }
        const result = shallow(<Foo />);
        expect(spy).to.have.property('callCount', 1);
        result.setState({ name: 'bar' });
        expect(spy).to.have.property('callCount', 3);
        expect(result.state('count')).to.equal(1);
      });

      itIf(BATCHING, 'provokes an another render to call setState twice in componentDidUpdate', () => {
        const spy = sinon.spy();
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
            if (!this.updated) {
              this.updated = true;
              /* eslint-disable react/no-did-update-set-state */
              this.setState({ count: this.state.count + 1 });
              this.setState({ count: this.state.count + 1 });
              /* eslint-enable react/no-did-update-set-state */
            }
          }

          render() {
            spy();
            return <div>{this.state.name}</div>;
          }
        }
        const result = shallow(<Foo />);
        expect(spy).to.have.property('callCount', 1);
        result.setState({ name: 'bar' });
        expect(spy).to.have.property('callCount', 3);
        expect(result.state('count')).to.equal(1);
      });
    });

    context('updating context', () => {
      it('calls shouldComponentUpdate, componentWillUpdate and componentDidUpdate', () => {
        const spy = sinon.spy();
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
            return <div>{this.state.foo}</div>;
          }
        }
        Foo.contextTypes = {
          foo: PropTypes.string,
        };
        const wrapper = shallow(
          <Foo foo="props" />,
          {
            context: { foo: 'bar' },
          },
        );
        expect(wrapper.instance().context.foo).to.equal('bar');
        wrapper.setContext({ foo: 'baz' });
        expect(wrapper.instance().context.foo).to.equal('baz');
        expect(spy.args).to.deep.equal([
          [
            'render',
          ],
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
          [
            'render',
          ],
          [
            'componentDidUpdate',
            { foo: 'props' }, { foo: 'props' },
            { foo: 'state' }, { foo: 'state' },
            is('>= 16') ? undefined : { foo: 'bar' },
          ],
        ]);
      });

      it('cancels rendering when Component returns false in shouldComponentUpdate', () => {
        const spy = sinon.spy();
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
        const wrapper = shallow(
          <Foo />,
          {
            context: { foo: 'bar' },
          },
        );
        wrapper.setContext({ foo: 'baz' });
        expect(spy.args).to.deep.equal([['render'], ['shouldComponentUpdate']]);
      });

      itIf(BATCHING, 'provokes an another render to call setState twice in componentWillUpdate', () => {
        const spy = sinon.spy();
        class Foo extends React.Component {
          constructor(props) {
            super(props);
            this.updated = false;
            this.state = {
              count: 0,
            };
          }

          componentWillUpdate() {
            if (!this.updated) {
              this.updated = true;
              this.setState({ count: this.state.count + 1 });
              this.setState({ count: this.state.count + 1 });
            }
          }

          render() {
            spy();
            return <div>{this.state.name}</div>;
          }
        }
        const result = shallow(
          <Foo />,
          {
            context: { foo: 'bar' },
          },
        );
        expect(spy).to.have.property('callCount', 1);
        result.setContext({ foo: 'baz' });
        expect(spy).to.have.property('callCount', 3);
        expect(result.state('count')).to.equal(1);
      });

      itIf(BATCHING, 'provokes an another render to call setState twice in componentDidUpdate', () => {
        const spy = sinon.spy();
        class Foo extends React.Component {
          constructor(props) {
            super(props);
            this.updated = false;
            this.state = {
              count: 0,
            };
          }

          componentDidUpdate() {
            if (!this.updated) {
              this.updated = true;
              /* eslint-disable react/no-did-update-set-state */
              this.setState({ count: this.state.count + 1 });
              this.setState({ count: this.state.count + 1 });
              /* eslint-enable react/no-did-update-set-state */
            }
          }

          render() {
            spy();
            return <div>{this.state.name}</div>;
          }
        }
        const result = shallow(
          <Foo />,
          {
            context: { foo: 'bar' },
          },
        );
        expect(spy).to.have.property('callCount', 1);
        result.setContext({ foo: 'baz' });
        expect(spy).to.have.property('callCount', 3);
        expect(result.state('count')).to.equal(1);
      });
    });

    context('unmounting phase', () => {
      it('calls componentWillUnmount', () => {
        const spy = sinon.spy();
        class Foo extends React.Component {
          componentWillUnmount() {
            spy();
          }

          render() {
            return <div>foo</div>;
          }
        }
        const wrapper = shallow(<Foo />);
        wrapper.unmount();
        expect(spy).to.have.property('callCount', 1);
      });
    });

    context('component instance', () => {
      it('calls `componentDidUpdate` when component’s `setState` is called', () => {
        class Foo extends React.Component {
          constructor(props) {
            super(props);
            this.state = {
              foo: 'init',
            };
          }

          componentDidUpdate() {}

          onChange() {
            // enzyme can't handle the update because `this` is a ReactComponent instance,
            // not a ShallowWrapper instance.
            this.setState({ foo: 'onChange update' });
          }

          render() {
            return <div>{this.state.foo}</div>;
          }
        }
        const spy = sinon.spy(Foo.prototype, 'componentDidUpdate');

        const wrapper = shallow(<Foo />);
        wrapper.setState({ foo: 'wrapper setState update' });
        expect(wrapper.state('foo')).to.equal('wrapper setState update');
        expect(spy).to.have.property('callCount', 1);
        wrapper.instance().onChange();
        expect(wrapper.state('foo')).to.equal('onChange update');
        expect(spy).to.have.property('callCount', 2);
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

          componentDidUpdate() {}

          onChange() {
            // enzyme can't handle the update because `this` is a ReactComponent instance,
            // not a ShallowWrapper instance.
            this.setState({ foo: 'onChange update' });
          }

          render() {
            return (
              <div>
                {this.state.foo}
                <button onClick={this.onChange}>click</button>
              </div>
            );
          }
        }
        const spy = sinon.spy(Foo.prototype, 'componentDidUpdate');

        const wrapper = shallow(<Foo />);
        wrapper.find('button').prop('onClick')();
        expect(wrapper.state('foo')).to.equal('onChange update');
        expect(spy).to.have.property('callCount', 1);
      });

      it('calls `componentDidUpdate` when component’s `setState` is called', () => {
        class Foo extends React.Component {
          constructor(props) {
            super(props);
            this.state = {
              foo: 'init',
            };
            this.update = () => this.setState({ foo: 'update' });
          }

          componentDidMount() {
            this.update();
          }

          componentDidUpdate() {}

          render() {
            return <div>{this.state.foo}</div>;
          }
        }
        const spy = sinon.spy(Foo.prototype, 'componentDidUpdate');

        const wrapper = shallow(<Foo />);
        expect(spy).to.have.property('callCount', 1);
        expect(wrapper.state('foo')).to.equal('update');
      });

      it('does not call `componentDidMount` twice when a child component is created', () => {
        class Foo extends React.Component {
          constructor(props) {
            super(props);
            this.state = {
              foo: 'init',
            };
          }

          componentDidMount() {}

          render() {
            return (
              <div>
                <button onClick={() => this.setState({ foo: 'update2' })}>
                  click
                </button>
                {this.state.foo}
              </div>
            );
          }
        }
        const spy = sinon.spy(Foo.prototype, 'componentDidMount');

        const wrapper = shallow(<Foo />);
        expect(spy).to.have.property('callCount', 1);
        wrapper.find('button').prop('onClick')();
        expect(spy).to.have.property('callCount', 1);
      });
    });

    describeIf(is('>= 15.3'), 'PureComponent', () => {
      it('does not update when state and props did not change', () => {
        class Foo extends PureComponent {
          constructor(props) {
            super(props);
            this.state = {
              foo: 'init',
            };
          }

          componentDidUpdate() {}

          render() {
            return (
              <div>
                {this.state.foo}
              </div>
            );
          }
        }
        const spy = sinon.spy(Foo.prototype, 'componentDidUpdate');
        const wrapper = shallow(<Foo id={1} />);
        wrapper.setState({ foo: 'update' });
        expect(spy).to.have.property('callCount', 1);
        wrapper.setState({ foo: 'update' });
        expect(spy).to.have.property('callCount', 1);

        wrapper.setProps({ id: 2 });
        expect(spy).to.have.property('callCount', 2);
        wrapper.setProps({ id: 2 });
        expect(spy).to.have.property('callCount', 2);
      });

      class Test extends PureComponent {
        constructor(...args) {
          super(...args);

          this.state = { a: { b: { c: 1 } } };
        }

        componentDidUpdate() {
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
          const { a: { b: { c } } } = this.state;
          return <div>{c}</div>;
        }
      }

      it('rerenders on setState when new state is !==, but deeply equal to existing state', () => {
        const updateSpy = sinon.spy();
        const wrapper = shallow(<Test onUpdate={updateSpy} />);
        wrapper.instance().setDeepEqualState();
        expect(updateSpy).to.have.property('callCount', 1);
      });

      it('rerenders when setState is called with an object that doesnt have deep equality', () => {
        const updateSpy = sinon.spy();
        const wrapper = shallow(<Test onUpdate={updateSpy} />);
        wrapper.instance().setDeepDifferentState();
        expect(updateSpy).to.have.property('callCount', 1);
      });

      describeIf(is('>= 16.3'), 'setProps calls `componentDidUpdate` when `getDerivedStateFromProps` is defined', () => {
        class DummyComp extends PureComponent {
          constructor(...args) {
            super(...args);
            this.state = { state: -1 };
          }

          static getDerivedStateFromProps({ changeState, counter }) {
            return changeState ? { state: counter * 10 } : null;
          }

          componentDidUpdate() {}

          render() {
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

        const cDU = sinon.spy(DummyComp.prototype, 'componentDidUpdate');
        const gDSFP = sinon.spy(DummyComp, 'getDerivedStateFromProps');

        beforeEach(() => { // eslint-disable-line mocha/no-sibling-hooks
          cDU.resetHistory();
          gDSFP.resetHistory();
        });

        it('with no state changes, calls both methods with a sync and async setProps', () => {
          const wrapper = shallow(<DummyComp changeState={false} counter={0} />);

          expect(gDSFP).to.have.property('callCount', 1);
          const [firstCall] = gDSFP.args;
          expect(firstCall).to.eql([{
            changeState: false,
            counter: 0,
          }, {
            state: -1,
          }]);
          expect(wrapper.state()).to.eql({ state: -1 });

          wrapper.setProps({ counter: 1 });

          expect(cDU).to.have.property('callCount', 1);
          expect(gDSFP).to.have.property('callCount', 2);
          const [, secondCall] = gDSFP.args;
          expect(secondCall).to.eql([{
            changeState: false,
            counter: 1,
          }, {
            state: -1,
          }]);
          expect(wrapper.state()).to.eql({ state: -1 });

          return new Promise((resolve) => {
            wrapper.setProps({ counter: 2 }, resolve);
          }).then(() => {
            expect(cDU).to.have.property('callCount', 2);
            expect(gDSFP).to.have.property('callCount', 3);
            const [, , thirdCall] = gDSFP.args;
            expect(thirdCall).to.eql([{
              changeState: false,
              counter: 2,
            }, {
              state: -1,
            }]);
            expect(wrapper.state()).to.eql({ state: -1 });
          });
        });

        it('with a state changes, calls both methods with a sync and async setProps', () => {
          const wrapper = shallow(<DummyComp changeState counter={0} />);

          expect(cDU).to.have.property('callCount', 0);
          expect(gDSFP).to.have.property('callCount', 1);
          const [firstCall] = gDSFP.args;
          expect(firstCall).to.eql([{
            changeState: true,
            counter: 0,
          }, {
            state: -1,
          }]);
          expect(wrapper.state()).to.eql({ state: 0 });

          wrapper.setProps({ counter: 1 });

          expect(cDU).to.have.property('callCount', 1);
          expect(gDSFP).to.have.property('callCount', 2);
          const [, secondCall] = gDSFP.args;
          expect(secondCall).to.eql([{
            changeState: true,
            counter: 1,
          }, {
            state: 0,
          }]);
          expect(wrapper.state()).to.eql({ state: 10 });

          return new Promise((resolve) => {
            wrapper.setProps({ counter: 2 }, resolve);
          }).then(() => {
            expect(cDU).to.have.property('callCount', 2);
            expect(gDSFP).to.have.property('callCount', 3);
            const [, , thirdCall] = gDSFP.args;
            expect(thirdCall).to.eql([{
              changeState: true,
              counter: 2,
            }, {
              state: 10,
            }]);
            expect(wrapper.state()).to.eql({ state: 20 });
          });
        });
      });
    });

    describe('Own PureComponent implementation', () => {
      it('does not update when state and props did not change', () => {
        class Foo extends React.Component {
          constructor(props) {
            super(props);
            this.state = {
              foo: 'init',
            };
          }

          shouldComponentUpdate(nextProps, nextState) {
            return !isEqual(this.props, nextProps) || !isEqual(this.state, nextState);
          }

          componentDidUpdate() {}

          render() {
            return (
              <div>
                {this.state.foo}
              </div>
            );
          }
        }
        const spy = sinon.spy(Foo.prototype, 'componentDidUpdate');
        const wrapper = shallow(<Foo id={1} />);
        wrapper.setState({ foo: 'update' });
        expect(spy).to.have.property('callCount', 1);
        wrapper.setState({ foo: 'update' });
        expect(spy).to.have.property('callCount', 1);

        wrapper.setProps({ id: 2 });
        expect(spy).to.have.property('callCount', 2);
        wrapper.setProps({ id: 2 });
        expect(spy).to.have.property('callCount', 2);
      });
    });

    describeIf(is('>= 16.3'), 'support getSnapshotBeforeUpdate', () => {
      it('calls getSnapshotBeforeUpdate and pass snapshot to componentDidUpdate', () => {
        const spy = sinon.spy();
        class Foo extends React.Component {
          constructor(props) {
            super(props);
            this.state = {
              foo: 'bar',
            };
          }

          componentDidUpdate(prevProps, prevState, snapshot) {
            spy('componentDidUpdate', prevProps, this.props, prevState, this.state, snapshot);
          }

          getSnapshotBeforeUpdate(prevProps, prevState) {
            spy('getSnapshotBeforeUpdate', prevProps, this.props, prevState, this.state);
            return { snapshot: 'ok' };
          }

          render() {
            spy('render');
            return <div>foo</div>;
          }
        }
        const wrapper = shallow(<Foo name="foo" />);
        spy.resetHistory();
        wrapper.setProps({ name: 'bar' });
        expect(spy.args).to.deep.equal([
          ['render'],
          ['getSnapshotBeforeUpdate', { name: 'foo' }, { name: 'bar' }, { foo: 'bar' }, { foo: 'bar' }],
          ['componentDidUpdate', { name: 'foo' }, { name: 'bar' }, { foo: 'bar' }, { foo: 'bar' }, { snapshot: 'ok' }],
        ]);
        spy.resetHistory();
        wrapper.setState({ foo: 'baz' });
        expect(spy.args).to.deep.equal([
          ['render'],
          ['getSnapshotBeforeUpdate', { name: 'bar' }, { name: 'bar' }, { foo: 'bar' }, { foo: 'baz' }],
          ['componentDidUpdate', { name: 'bar' }, { name: 'bar' }, { foo: 'bar' }, { foo: 'baz' }, { snapshot: 'ok' }],
        ]);
      });
    });
  });

  it('works with class components that return null', () => {
    class Foo extends React.Component {
      render() {
        return null;
      }
    }
    const wrapper = shallow(<Foo />);
    expect(wrapper).to.have.lengthOf(1);
    expect(wrapper.html()).to.equal(null);
    expect(wrapper.type()).to.equal(null);
    const rendered = wrapper.render();
    expect(rendered).to.have.lengthOf(0);
    expect(rendered.html()).to.equal(null);
  });

  itIf(is('>= 16'), 'works with class components that return arrays', () => {
    class Foo extends React.Component {
      render() {
        return [<div />, <div />];
      }
    }
    const wrapper = shallow(<Foo />);
    expect(wrapper).to.have.lengthOf(2);
    expect(wrapper.find('div')).to.have.lengthOf(2);
  });

  itIf(is('>=15 || ^16.0.0-alpha'), 'works with SFCs that return null', () => {
    const Foo = () => null;

    const wrapper = shallow(<Foo />);
    expect(wrapper).to.have.lengthOf(1);
    expect(wrapper.html()).to.equal(null);
    expect(wrapper.type()).to.equal(null);
    const rendered = wrapper.render();
    expect(rendered).to.have.lengthOf(0);
    expect(rendered.html()).to.equal(null);
  });

  describe('.tap()', () => {
    it('calls the passed function with current ShallowWrapper and returns itself', () => {
      const spy = sinon.spy();
      const wrapper = shallow((
        <ul>
          <li>xxx</li>
          <li>yyy</li>
          <li>zzz</li>
        </ul>
      )).find('li');
      const result = wrapper.tap(spy);
      expect(spy.calledWith(wrapper)).to.equal(true);
      expect(result).to.equal(wrapper);
    });
  });

  describe('.key()', () => {
    it('returns the key of the node', () => {
      const wrapper = shallow((
        <ul>
          {['foo', 'bar', ''].map(s => <li key={s}>{s}</li>)}
        </ul>
      )).find('li');
      expect(wrapper.at(0).key()).to.equal('foo');
      expect(wrapper.at(1).key()).to.equal('bar');
      expect(wrapper.at(2).key()).to.equal('');
    });

    it('returns null when no key is specified', () => {
      const wrapper = shallow((
        <ul>
          <li>foo</li>
        </ul>
      )).find('li');
      expect(wrapper.key()).to.equal(null);
    });
  });

  describe('.matchesElement(node)', () => {
    it('matches on a root node that looks like the rendered one', () => {
      const spy = sinon.spy();
      const wrapper = shallow((
        <div>
          <div onClick={spy} style={{ fontSize: 12, color: 'red' }}>Hello World</div>
        </div>
      )).first();
      expect(wrapper.matchesElement(<div><div>Hello World</div></div>)).to.equal(true);
      expect(wrapper.matchesElement((
        <div>
          <div onClick={spy} style={{ fontSize: 12, color: 'red' }}>Hello World</div>
        </div>
      ))).to.equal(true);
      expect(wrapper.matchesElement((
        <div>
          <div onClick={spy}>Hello World</div>
        </div>
      ))).to.equal(true);
      expect(wrapper.matchesElement((
        <div>
          <div style={{ fontSize: 12, color: 'red' }}>Hello World</div>
        </div>
      ))).to.equal(true);
      expect(spy).to.have.property('callCount', 0);
    });

    it('does not match on a root node that doesn’t looks like the rendered one', () => {
      const spy = sinon.spy();
      const spy2 = sinon.spy();
      const wrapper = shallow((
        <div>
          <div onClick={spy} style={{ fontSize: 12, color: 'red' }}>Hello World</div>
        </div>
      )).first();
      expect(wrapper.matchesElement(<div><div>Bonjour le monde</div></div>)).to.equal(false);
      expect(wrapper.matchesElement((
        <div>
          <div onClick={spy} style={{ fontSize: 12, color: 'blue' }}>Hello World</div>
        </div>
      ))).to.equal(false);
      expect(wrapper.matchesElement((
        <div>
          <div onClick={spy2}>Hello World</div>
        </div>
      ))).to.equal(false);
      expect(wrapper.matchesElement((
        <div>
          <div style={{ fontSize: 13, color: 'red' }}>Hello World</div>
        </div>
      ))).to.equal(false);
      expect(spy).to.have.property('callCount', 0);
      expect(spy2).to.have.property('callCount', 0);
    });

    it('matches a simple node', () => {
      class Test extends React.Component {
        render() {
          return <h1>test</h1>;
        }
      }
      const wrapper = shallow(<Test />);
      expect(wrapper.matchesElement(<h1>test</h1>)).to.equal(true);
    });
  });

  describe('.containsMatchingElement(node)', () => {
    it('matches a root node that looks like the rendered one', () => {
      const spy1 = sinon.spy();
      const spy2 = sinon.spy();
      const wrapper = shallow((
        <div>
          <div onClick={spy1} style={{ fontSize: 12, color: 'red' }}>Hello World</div>
          <div onClick={spy2} style={{ fontSize: 13, color: 'blue' }}>Goodbye World</div>
        </div>
      ));
      expect(wrapper.containsMatchingElement((
        <div>
          <div>Hello World</div>
          <div>Goodbye World</div>
        </div>
      ))).to.equal(true);
      expect(wrapper.containsMatchingElement((
        <div>
          <div onClick={spy1} style={{ fontSize: 12, color: 'red' }}>Hello World</div>
          <div onClick={spy2} style={{ fontSize: 13, color: 'blue' }}>Goodbye World</div>
        </div>
      ))).to.equal(true);
      expect(wrapper.containsMatchingElement((
        <div>
          <div onClick={spy1}>Hello World</div>
          <div style={{ fontSize: 13, color: 'blue' }}>Goodbye World</div>
        </div>
      ))).to.equal(true);
      expect(wrapper.containsMatchingElement((
        <div>
          <div style={{ fontSize: 12, color: 'red' }}>Hello World</div>
          <div onClick={spy2}>Goodbye World</div>
        </div>
      ))).to.equal(true);
      expect(wrapper.containsMatchingElement((
        <div>
          <div>Hello World</div>
          <div onClick={spy2} style={{ fontSize: 13, color: 'blue' }}>Goodbye World</div>
        </div>
      ))).to.equal(true);
      expect(wrapper.containsMatchingElement((
        <div>
          <div>Hello World</div>
          <div style={{ fontSize: 13, color: 'blue' }}>Goodbye World</div>
        </div>
      ))).to.equal(true);
      expect(spy1).to.have.property('callCount', 0);
      expect(spy2).to.have.property('callCount', 0);
    });

    it('matches on a single node that looks like a rendered one', () => {
      const spy1 = sinon.spy();
      const spy2 = sinon.spy();
      const wrapper = shallow((
        <div>
          <div onClick={spy1} style={{ fontSize: 12, color: 'red' }}>Hello World</div>
          <div onClick={spy2} style={{ fontSize: 13, color: 'blue' }}>Goodbye World</div>
        </div>
      ));
      expect(wrapper.containsMatchingElement(<div>Hello World</div>)).to.equal(true);
      expect(wrapper.containsMatchingElement(<div>Goodbye World</div>)).to.equal(true);
      expect(wrapper.containsMatchingElement((
        <div onClick={spy1} style={{ fontSize: 12, color: 'red' }}>Hello World</div>
      ))).to.equal(true);
      expect(wrapper.containsMatchingElement((
        <div style={{ fontSize: 12, color: 'red' }}>Hello World</div>
      ))).to.equal(true);
      expect(wrapper.containsMatchingElement((
        <div onClick={spy2} style={{ fontSize: 13, color: 'blue' }}>Goodbye World</div>
      ))).to.equal(true);
      expect(wrapper.containsMatchingElement((
        <div onClick={spy2}>Goodbye World</div>
      ))).to.equal(true);
      expect(spy1).to.have.property('callCount', 0);
      expect(spy2).to.have.property('callCount', 0);
    });

    it('does not match on a single node that doesn\'t looks like a rendered one', () => {
      const spy1 = sinon.spy();
      const spy2 = sinon.spy();
      const wrapper = shallow((
        <div>
          <div onClick={spy1} style={{ fontSize: 12, color: 'red' }}>Hello World</div>
          <div onClick={spy2} style={{ fontSize: 13, color: 'blue' }}>Goodbye World</div>
        </div>
      ));
      expect(wrapper.containsMatchingElement(<div>Bonjour le monde</div>)).to.equal(false);
      expect(wrapper.containsMatchingElement((
        <div onClick={spy2}>Au revoir le monde</div>
      ))).to.equal(false);
    });

    it('does not differentiate between absence, null, or undefined', () => {
      const wrapper = shallow((
        <div>
          <div className="a" id={null} />
          <div className="b" id={undefined} />
          <div className="c" />
        </div>
      ));

      expect(wrapper.containsMatchingElement(<div />)).to.equal(true);

      expect(wrapper.containsMatchingElement(<div className="a" />)).to.equal(true);
      expect(wrapper.containsMatchingElement(<div className="a" id={null} />)).to.equal(true);
      expect(wrapper.containsMatchingElement(<div className="a" id={undefined} />)).to.equal(true);

      expect(wrapper.containsMatchingElement(<div className="b" />)).to.equal(true);
      expect(wrapper.containsMatchingElement(<div className="b" id={null} />)).to.equal(true);
      expect(wrapper.containsMatchingElement(<div className="b" id={undefined} />)).to.equal(true);

      expect(wrapper.containsMatchingElement(<div className="c" />)).to.equal(true);
      expect(wrapper.containsMatchingElement(<div className="c" id={null} />)).to.equal(true);
      expect(wrapper.containsMatchingElement(<div className="c" id={undefined} />)).to.equal(true);
    });

    it('works with leading and trailing spaces', () => {
      const wrapper = shallow((
        <li>
          <a> All Operations </a>
        </li>
      ));

      expect(wrapper.containsMatchingElement(<a> All Operations </a>)).to.equal(true);
    });

    it('works with leading and trailing newlines', () => {
      const wrapper = shallow((
        <li>
          <a>
            All Operations
          </a>
        </li>
      ));

      expect(wrapper.containsMatchingElement(<a> All Operations </a>)).to.equal(true);
    });
  });

  describe('.containsAllMatchingElements(nodes)', () => {
    it('throws TypeError if non-array passed in', () => {
      const wrapper = shallow((
        <div>
          Hello
        </div>
      ));

      expect(() => wrapper.containsAllMatchingElements((
        <div>
          Hello
        </div>
      ))).to.throw(TypeError, 'nodes should be an Array');
    });

    it('matches on array of nodes that each look like rendered nodes, with nested elements', () => {
      const wrapper = shallow((
        <div>
          <div>
            <p>Hello</p>
          </div>
          <div>
            <p>Goodbye</p>
          </div>
        </div>
      ));

      expect(wrapper.containsAllMatchingElements([
        <p>Hello</p>,
        <p>Goodbye</p>,
      ])).to.equal(true);
    });

    it('matches on an array of nodes that all looks like one of rendered nodes', () => {
      const spy1 = sinon.spy();
      const spy2 = sinon.spy();
      const wrapper = shallow((
        <div>
          <div onClick={spy1} style={{ fontSize: 12, color: 'red' }}>Hello World</div>
          <div onClick={spy2} style={{ fontSize: 13, color: 'blue' }}>Goodbye World</div>
        </div>
      ));
      expect(wrapper.containsAllMatchingElements([
        <div>Hello World</div>,
        <div>Goodbye World</div>,
      ])).to.equal(true);
      expect(wrapper.containsAllMatchingElements([
        <div onClick={spy1} style={{ fontSize: 12, color: 'red' }}>Hello World</div>,
        <div>Goodbye World</div>,
      ])).to.equal(true);
      expect(wrapper.containsAllMatchingElements([
        <div>Hello World</div>,
        <div onClick={spy2} style={{ fontSize: 13, color: 'blue' }}>Goodbye World</div>,
      ])).to.equal(true);
      expect(wrapper.containsAllMatchingElements([
        <div onClick={spy1} style={{ fontSize: 12, color: 'red' }}>Hello World</div>,
        <div onClick={spy2} style={{ fontSize: 13, color: 'blue' }}>Goodbye World</div>,
      ])).to.equal(true);
      expect(wrapper.containsAllMatchingElements([
        <div onClick={spy1}>Hello World</div>,
        <div onClick={spy2} style={{ fontSize: 13, color: 'blue' }}>Goodbye World</div>,
      ])).to.equal(true);
      expect(wrapper.containsAllMatchingElements([
        <div style={{ fontSize: 12, color: 'red' }}>Hello World</div>,
        <div onClick={spy2} style={{ fontSize: 13, color: 'blue' }}>Goodbye World</div>,
      ])).to.equal(true);
      expect(wrapper.containsAllMatchingElements([
        <div onClick={spy1} style={{ fontSize: 12, color: 'red' }}>Hello World</div>,
        <div style={{ fontSize: 13, color: 'blue' }}>Goodbye World</div>,
      ])).to.equal(true);
      expect(wrapper.containsAllMatchingElements([
        <div onClick={spy1} style={{ fontSize: 12, color: 'red' }}>Hello World</div>,
        <div onClick={spy2}>Goodbye World</div>,
      ])).to.equal(true);
      expect(spy1).to.have.property('callCount', 0);
      expect(spy2).to.have.property('callCount', 0);
    });

    it('does not match on nodes that doesn\'t all looks like one of rendered nodes', () => {
      const spy1 = sinon.spy();
      const spy2 = sinon.spy();
      const wrapper = shallow((
        <div>
          <div onClick={spy1} style={{ fontSize: 12, color: 'red' }}>Hello World</div>
          <div onClick={spy2} style={{ fontSize: 13, color: 'blue' }}>Goodbye World</div>
        </div>
      ));
      expect(wrapper.containsAllMatchingElements([
        <div onClick={spy1} style={{ fontSize: 12, color: 'red' }}>Hello World</div>,
        <div onClick={spy1} style={{ fontSize: 12, color: 'red' }}>Bonjour le monde</div>,
        <div onClick={spy2}>Goodbye World</div>,
      ])).to.equal(false);
      expect(spy1).to.have.property('callCount', 0);
      expect(spy2).to.have.property('callCount', 0);
    });
  });

  describe('.containsAnyMatchingElements(nodes)', () => {
    it('matches on an array with at least one node that looks like a rendered nodes', () => {
      const spy1 = sinon.spy();
      const spy2 = sinon.spy();
      const wrapper = shallow((
        <div>
          <div onClick={spy1} style={{ fontSize: 12, color: 'red' }}>Hello World</div>
          <div onClick={spy2} style={{ fontSize: 13, color: 'blue' }}>Goodbye World</div>
        </div>
      ));
      expect(wrapper.containsAnyMatchingElements([
        <div>Bonjour le monde</div>,
        <div>Goodbye World</div>,
      ])).to.equal(true);
      expect(wrapper.containsAnyMatchingElements([
        <div onClick={spy1} style={{ fontSize: 12, color: 'red' }}>Bonjour le monde</div>,
        <div>Goodbye World</div>,
      ])).to.equal(true);
      expect(wrapper.containsAnyMatchingElements([
        <div>Bonjour le monde</div>,
        <div onClick={spy2} style={{ fontSize: 13, color: 'blue' }}>Goodbye World</div>,
      ])).to.equal(true);
      expect(wrapper.containsAnyMatchingElements([
        <div onClick={spy1} style={{ fontSize: 12, color: 'red' }}>Bonjour le monde</div>,
        <div onClick={spy2} style={{ fontSize: 13, color: 'blue' }}>Goodbye World</div>,
      ])).to.equal(true);
      expect(wrapper.containsAnyMatchingElements([
        <div onClick={spy1}>Bonjour le monde</div>,
        <div onClick={spy2} style={{ fontSize: 13, color: 'blue' }}>Goodbye World</div>,
      ])).to.equal(true);
      expect(wrapper.containsAnyMatchingElements([
        <div style={{ fontSize: 12, color: 'red' }}>Bonjour le monde</div>,
        <div onClick={spy2} style={{ fontSize: 13, color: 'blue' }}>Goodbye World</div>,
      ])).to.equal(true);
      expect(wrapper.containsAnyMatchingElements([
        <div onClick={spy1} style={{ fontSize: 12, color: 'red' }}>Bonjour le monde</div>,
        <div style={{ fontSize: 13, color: 'blue' }}>Goodbye World</div>,
      ])).to.equal(true);
      expect(wrapper.containsAnyMatchingElements([
        <div onClick={spy1} style={{ fontSize: 12, color: 'red' }}>Bonjour le monde</div>,
        <div onClick={spy2}>Goodbye World</div>,
      ])).to.equal(true);
      expect(spy1).to.have.property('callCount', 0);
      expect(spy2).to.have.property('callCount', 0);
    });
    it('does not match on an array with no nodes that looks like a rendered nodes', () => {
      const spy1 = sinon.spy();
      const spy2 = sinon.spy();
      const wrapper = shallow((
        <div>
          <div onClick={spy1} style={{ fontSize: 12, color: 'red' }}>Hello World</div>
          <div onClick={spy2} style={{ fontSize: 13, color: 'blue' }}>Goodbye World</div>
        </div>
      ));
      expect(wrapper.containsAnyMatchingElements([
        <div onClick={spy1} style={{ fontSize: 12, color: 'red' }}>Bonjour le monde</div>,
        <div onClick={spy2}>Au revoir le monde</div>,
      ])).to.equal(false);
      expect(spy1).to.have.property('callCount', 0);
      expect(spy2).to.have.property('callCount', 0);
    });
  });

  wrap()
    .withOverride(() => getAdapter(), 'displayNameOfNode', () => undefined)
    .describe('.name()', () => {
      describe('node with displayName', () => {
        it('returns the displayName of the node', () => {
          class Foo extends React.Component {
            render() { return <div />; }
          }

          class Wrapper extends React.Component {
            render() { return <Foo />; }
          }

          Foo.displayName = 'CustomWrapper';

          const wrapper = shallow(<Wrapper />);
          expect(wrapper.name()).to.equal('CustomWrapper');
        });

        describeIf(is('> 0.13'), 'stateless function components (SFCs)', () => {
          it('returns the name of the node', () => {
            function SFC() {
              return <div />;
            }
            const Wrapper = () => <SFC />;

            SFC.displayName = 'CustomWrapper';

            const wrapper = shallow(<Wrapper />);
            expect(wrapper.name()).to.equal('CustomWrapper');
          });
        });

        describe('createClass', () => {
          it('returns the name of the node', () => {
            const Foo = createClass({
              displayName: 'CustomWrapper',
              render() {
                return <div />;
              },
            });
            const Wrapper = createClass({
              render() {
                return <Foo />;
              },
            });

            const wrapper = shallow(<Wrapper />);
            expect(wrapper.name()).to.equal('CustomWrapper');
          });
        });

        wrap()
          .withOverride(() => getAdapter(), 'displayNameOfNode', () => sinon.stub())
          .describe('adapter has `displayNameOfNode`', () => {
            it('delegates to the adapter’s `displayNameOfNode`', () => {
              class Foo extends React.Component {
                render() { return <div />; }
              }
              const stub = getAdapter().displayNameOfNode;
              const sentinel = {};
              stub.returns(sentinel);

              const wrapper = shallow(<Foo />);

              expect(wrapper.name()).to.equal(sentinel);

              expect(stub).to.have.property('callCount', 1);
              const { args } = stub.firstCall;
              expect(args).to.eql([wrapper.getNodeInternal()]);
            });
          });
      });

      describe('node without displayName', () => {
        it('returns the name of the node', () => {
          class Foo extends React.Component {
            render() { return <div />; }
          }

          class Wrapper extends React.Component {
            render() { return <Foo />; }
          }

          const wrapper = shallow(<Wrapper />);
          expect(wrapper.name()).to.equal('Foo');
        });

        describeIf(is('> 0.13'), 'stateless function components (SFCs)', () => {
          it('returns the name of the node', () => {
            function SFC() {
              return <div />;
            }
            const Wrapper = () => <SFC />;

            const wrapper = shallow(<Wrapper />);
            expect(wrapper.name()).to.equal('SFC');
          });
        });
      });

      describe('DOM node', () => {
        it('returns the name of the node', () => {
          const wrapper = shallow(<div />);
          expect(wrapper.name()).to.equal('div');
        });
      });
    });

  describe('.dive()', () => {
    class RendersDOM extends React.Component {
      render() {
        return <div><i /></div>;
      }
    }
    class RendersNull extends React.Component {
      render() {
        return null;
      }
    }
    class RendersMultiple extends React.Component {
      render() {
        return (
          <div>
            <RendersNull />
            <RendersDOM />
          </div>
        );
      }
    }
    class RendersZero extends React.Component {
      render() {
        return <div />;
      }
    }
    class WrapsRendersDOM extends React.Component {
      render() {
        return <RendersDOM />;
      }
    }
    WrapsRendersDOM.contextTypes = { foo: PropTypes.string };
    class DoubleWrapsRendersDOM extends React.Component {
      render() {
        return <WrapsRendersDOM />;
      }
    }
    class ContextWrapsRendersDOM extends React.Component {
      render() {
        return <WrapsRendersDOM />;
      }
    }
    ContextWrapsRendersDOM.contextTypes = { foo: PropTypes.string };

    it('throws on a DOM node', () => {
      const wrapper = shallow(<RendersDOM />);
      expect(wrapper.is('div')).to.equal(true);

      expect(() => { wrapper.dive(); }).to.throw(
        TypeError,
        'ShallowWrapper::dive() can not be called on Host Components',
      );
    });

    it('throws on a non-component', () => {
      const wrapper = shallow(<RendersNull />);
      expect(wrapper.type()).to.equal(null);

      expect(() => { wrapper.dive(); }).to.throw(
        TypeError,
        'ShallowWrapper::dive() can only be called on components',
      );
    });

    it('throws on multiple children found', () => {
      const wrapper = shallow(<RendersMultiple />).find('div').children();
      expect(() => { wrapper.dive(); }).to.throw(
        Error,
        'Method “dive” is meant to be run on 1 node. 2 found instead.',
      );
    });

    it('throws on zero children found', () => {
      const wrapper = shallow(<RendersZero />).find('div').children();
      expect(() => { wrapper.dive(); }).to.throw(
        Error,
        'Method “dive” is meant to be run on 1 node. 0 found instead.',
      );
    });

    it('throws on zero children found', () => {
      const wrapper = shallow(<RendersZero />).find('div').children();
      expect(() => { wrapper.dive(); }).to.throw(
        Error,
        'Method “dive” is meant to be run on 1 node. 0 found instead.',
      );
    });

    it('dives + shallow-renders when there is one component child', () => {
      const wrapper = shallow(<DoubleWrapsRendersDOM />);
      expect(wrapper.is(WrapsRendersDOM)).to.equal(true);

      const underwater = wrapper.dive();
      expect(underwater.is(RendersDOM)).to.equal(true);
    });

    describeIf(is('>=16.3.0'), 'forwardRef Elements', () => {
      const ForwardRefWrapsRendersDOM = forwardRef && forwardRef(() => <WrapsRendersDOM />);
      const NestedForwarRefsWrapsRendersDom = forwardRef && forwardRef(() => <ForwardRefWrapsRendersDOM />);

      if (forwardRef) {
        NestedForwarRefsWrapsRendersDom.contextTypes = { foo: PropTypes.string };
        ForwardRefWrapsRendersDOM.contextTypes = { foo: PropTypes.string };
      }

      it('dives + shallow-renders a forwardRef component', () => {
        const wrapper = shallow(<ForwardRefWrapsRendersDOM />);
        expect(wrapper.is(WrapsRendersDOM)).to.equal(true);

        const underwater = wrapper.dive();
        expect(underwater.is(RendersDOM)).to.equal(true);
      });

      it('dives + shallow-renders a with nested forwardRefs component', () => {
        const wrapper = shallow(<NestedForwarRefsWrapsRendersDom />);
        expect(wrapper.is(ForwardRefWrapsRendersDOM)).to.equal(true);

        const underwater = wrapper.dive();
        expect(underwater.is(WrapsRendersDOM)).to.equal(true);
      });
    });

    it('merges and pass options through', () => {
      const wrapper = shallow(<ContextWrapsRendersDOM />, { context: { foo: 'hello' } });
      expect(wrapper.context()).to.deep.equal({ foo: 'hello' });

      let underwater = wrapper.dive();
      expect(underwater.context()).to.deep.equal({ foo: 'hello' });

      underwater = wrapper.dive({ context: { foo: 'enzyme!' } });
      expect(underwater.context()).to.deep.equal({ foo: 'enzyme!' });
    });
  });

  describeIf(!!ITERATOR_SYMBOL, '@@iterator', () => {
    it('is iterable', () => {
      class Foo extends React.Component {
        render() {
          return (
            <div>
              <a href="#1">Hello</a>
              <a href="#2">Hello</a>
              <a href="#3">Hello</a>
              <a href="#4">Hello</a>
            </div>
          );
        }
      }
      const wrapper = shallow(<Foo />);
      const [a, b, c, d] = wrapper.find('a');
      const a1 = wrapper.find('a').get(0);
      const b1 = wrapper.find('a').get(1);
      const c1 = wrapper.find('a').get(2);
      const d1 = wrapper.find('a').get(3);
      expect(a1).to.deep.equal(a);
      expect(b1).to.deep.equal(b);
      expect(c1).to.deep.equal(c);
      expect(d1).to.deep.equal(d);
    });

    it('returns an iterable iterator', () => {
      class Foo extends React.Component {
        render() {
          return (
            <div>
              <a href="#1">Hello</a>
              <a href="#2">Hello</a>
              <a href="#3">Hello</a>
              <a href="#4">Hello</a>
            </div>
          );
        }
      }
      const wrapper = shallow(<Foo />);

      const iter = wrapper[ITERATOR_SYMBOL]();
      expect(iter).to.have.property(ITERATOR_SYMBOL).and.be.a('function');
      expect(iter[ITERATOR_SYMBOL]()).to.equal(iter);
    });
  });

  describe('.instance()', () => {
    it('returns the component instance', () => {
      class Foo extends React.Component {
        render() { return <div />; }
      }

      const wrapper = shallow(<Foo />);
      expect(wrapper.instance()).to.be.instanceof(Foo);
      expect(wrapper.instance().render).to.equal(Foo.prototype.render);
    });

    it('throws if called on something other than the root node', () => {
      class Foo extends React.Component {
        render() { return <div><a /></div>; }
      }

      const wrapper = shallow(<Foo />);
      const div = wrapper.find('div');

      expect(() => div.instance()).to.throw(
        Error,
        'ShallowWrapper::instance() can only be called on the root',
      );
    });
  });

  describe('.getElement()', () => {
    it('returns nodes with refs as well', () => {
      class Foo extends React.Component {
        constructor(props) {
          super(props);
          this.setRef = this.setRef.bind(this);
          this.node = null;
        }

        setRef(node) {
          this.node = node;
        }

        render() {
          return (
            <div>
              <div ref={this.setRef} className="foo" />
            </div>
          );
        }
      }
      const wrapper = shallow(<Foo />);
      const mockNode = { mock: true };
      wrapper.find('.foo').getElement().ref(mockNode);
      expect(wrapper.instance().node).to.equal(mockNode);
    });

    itIf(is('>= 16.3'), 'returns nodes with createRefs as well', () => {
      class Foo extends React.Component {
        constructor(props) {
          super(props);
          this.setRef = createRef();
        }

        render() {
          return (
            <div>
              <div ref={this.setRef} className="foo" />
            </div>
          );
        }
      }
      const wrapper = shallow(<Foo />);
      // shallow rendering does not invoke refs
      expect(wrapper.instance().setRef).to.have.property('current', null);
    });

    it('does not add a "null" key to elements with a ref and no key', () => {
      class Foo extends React.Component {
        constructor(props) {
          super(props);
          this.setRef = this.setRef.bind(this);
        }

        setRef(node) {
          this.node = node;
        }

        render() {
          return (
            <div ref={this.setRef} className="foo" />
          );
        }
      }
      const wrapper = shallow(<Foo />);
      expect(wrapper.getElement()).to.have.property('key', null);
    });

    itIf(is('>= 16.3'), 'does not add a "null" key to elements with a createRef and no key', () => {
      class Foo extends React.Component {
        constructor(props) {
          super(props);
          this.setRef = createRef();
        }

        render() {
          return (
            <div ref={this.setRef} className="foo" />
          );
        }
      }
      const wrapper = shallow(<Foo />);
      expect(wrapper.getElement()).to.have.property('key', null);
    });
  });

  describe('.getElements()', () => {
    it('returns the wrapped elements', () => {
      const one = <span />;
      const two = <span />;

      class Test extends React.Component {
        render() {
          return (
            <div>
              { one }
              { two }
            </div>
          );
        }
      }

      const wrapper = shallow(<Test />);
      expect(wrapper.find('span').getElements()).to.deep.equal([one, two]);
    });
  });

  describe('out-of-band state updates', () => {
    class Child extends React.Component {
      render() {
        return <span />;
      }
    }

    class Test extends React.Component {
      componentWillMount() {
        this.state = {};
      }

      safeSetState(newState) {
        withSetStateAllowed(() => {
          this.setState(newState);
        });
      }

      asyncSetState() {
        setImmediate(() => {
          this.safeSetState({ showSpan: true });
        });
      }

      callbackSetState() {
        this.safeSetState({ showSpan: true });
      }

      render() {
        return (
          <div>
            {this.state && this.state.showSpan && <span className="show-me" />}
            <button className="async-btn" onClick={() => this.asyncSetState()} />
            <Child callback={() => this.callbackSetState()} />
          </div>
        );
      }
    }

    it('has updated output after an asynchronous setState', () => {
      const wrapper = shallow(<Test />);
      wrapper.find('.async-btn').simulate('click');
      return new Promise((resolve) => {
        setImmediate(() => {
          wrapper.update();
          resolve();
        });
      }).then(() => {
        expect(wrapper.find('.show-me')).to.have.lengthOf(1);
      });
    });

    it('has updated output after child prop callback invokes setState', () => {
      const wrapper = shallow(<Test />);
      wrapper.find(Child).props().callback();
      wrapper.update();
      expect(wrapper.find('.show-me')).to.have.lengthOf(1);
    });
  });

  describe('#single()', () => {
    it('throws if run on multiple nodes', () => {
      const wrapper = shallow(<div><i /><i /></div>).children();
      expect(wrapper).to.have.lengthOf(2);
      expect(() => wrapper.single('name!')).to.throw(
        Error,
        'Method “name!” is meant to be run on 1 node. 2 found instead.',
      );
    });

    it('throws if run on zero nodes', () => {
      const wrapper = shallow(<div />).children();
      expect(wrapper).to.have.lengthOf(0);
      expect(() => wrapper.single('name!')).to.throw(
        Error,
        'Method “name!” is meant to be run on 1 node. 0 found instead.',
      );
    });

    it('throws if run on zero nodes', () => {
      const wrapper = shallow(<div />).children();
      expect(wrapper).to.have.lengthOf(0);
      expect(() => wrapper.single('name!')).to.throw(
        Error,
        'Method “name!” is meant to be run on 1 node. 0 found instead.',
      );
    });

    it('works with a name', () => {
      const wrapper = shallow(<div />);
      wrapper.single('foo', (node) => {
        expect(node).to.equal(wrapper[sym('__node__')]);
      });
    });

    it('works without a name', () => {
      const wrapper = shallow(<div />);
      wrapper.single((node) => {
        expect(node).to.equal(wrapper[sym('__node__')]);
      });
    });
  });

  describe('setState through a props method', () => {
    class Child extends React.Component {
      render() {
        return <button onClick={this.props.onClick}>click</button>;
      }
    }

    it('can get the latest state value', () => {
      class App extends React.Component {
        constructor(props) {
          super(props);
          this.state = {
            count: 0,
          };
        }

        onIncrement() {
          this.setState({
            count: this.state.count + 1,
          });
        }

        render() {
          return (
            <div>
              <Child onClick={() => this.onIncrement()} />
              <p>{this.state.count}</p>
            </div>
          );
        }
      }
      const wrapper = shallow(<App />);
      const p = wrapper.find('p');
      expect(wrapper.find('p').text()).to.equal('0');
      wrapper.find(Child).prop('onClick')();
      // TOOD: this is a difference between mount and shallow
      // this is still 0 because the wrapper won't be updated
      expect(p.text()).to.equal('0');
      expect(wrapper.find('p').text()).to.equal('1');
    });
  });

  describe('setState through a props method in async', () => {
    class Child extends React.Component {
      render() {
        return <button onClick={this.props.onClick}>click</button>;
      }
    }

    it('can get the latest state value', () => {
      let App;
      const promise = new Promise((resolve) => {
        App = class extends React.Component {
          constructor(props) {
            super(props);
            this.state = {
              count: 0,
            };
          }

          onIncrement() {
            setTimeout(() => {
              this.setState({
                count: this.state.count + 1,
              }, resolve);
            });
          }

          render() {
            return (
              <div>
                <Child onClick={() => this.onIncrement()} />
                <p>{this.state.count}</p>
              </div>
            );
          }
        };
      });
      const wrapper = shallow(<App />);
      expect(wrapper.find('p').text()).to.equal('0');
      wrapper.find(Child).prop('onClick')();
      return promise.then(() => {
        expect(wrapper.find('p').text()).to.equal('1');
      });
    });
  });

  describe('#wrap()', () => {
    class Foo extends React.Component {
      render() {
        return (
          <div>
            <a href="#1">Hello</a>
            <a href="#2">Hello</a>
          </div>
        );
      }
    }

    it('returns itself when it is already a ShallowWrapper', () => {
      const wrapperDiv = shallow(<div />);
      const wrapperFoo = shallow(<Foo />);
      expect(wrapperDiv.wrap(wrapperFoo)).to.equal(wrapperFoo);
      expect(wrapperFoo.wrap(wrapperDiv)).to.equal(wrapperDiv);
    });

    it('wraps when it is not already a ShallowWrapper', () => {
      const wrapper = shallow(<Foo />);
      const el = wrapper.find('a').at(1);
      const wrappedEl = wrapper.wrap(el.getElement());
      expect(wrappedEl).to.be.instanceOf(ShallowWrapper);
      expect(wrappedEl.props()).to.eql(el.props());
      expect(wrappedEl.shallow().debug()).to.equal(el.debug());
    });
  });

  describe('cloning elements', () => {
    class Foo extends React.Component {
      render() {
        const { children } = this.props;
        const mappedChildren = [];
        React.Children.forEach(children, (child, i) => {
          const clonedChild = React.cloneElement(child, {
            key: i, // eslint-disable-line react/no-array-index-key
            onClick() {
              return child.props.name;
            },
          });
          mappedChildren.push(clonedChild);
        });
        return (
          <div>
            {mappedChildren}
          </div>
        );
      }
    }

    it('merges cloned element props', () => {
      const wrapper = shallow((
        <Foo>
          <span data-foo="1">1</span>
          <div data-bar="2">2</div>
        </Foo>
      ));

      const children = wrapper.children();
      expect(children).to.have.lengthOf(2);

      const span = children.at(0);
      expect(span.is('span')).to.equal(true);
      const spanProps = span.props();
      expect(spanProps).to.have.keys({
        children: 1,
        'data-foo': 1,
        onClick: spanProps.onClick,
      });
      expect(spanProps.onClick).to.be.a('function');

      const div = children.at(1);
      expect(div.is('div')).to.equal(true);
      const divProps = div.props();
      expect(divProps).to.have.keys({
        children: 2,
        'data-bar': 2,
        onClick: divProps.onClick,
      });
      expect(divProps.onClick).to.be.a('function');
    });
  });

  describe('.root()', () => {
    it('returns the root DOM node', () => {
      class Fixture extends React.Component {
        render() {
          return <div><span /><span /></div>;
        }
      }
      const wrapper = shallow(<Fixture />);
      const root = wrapper.root();
      expect(root.is('div')).to.equal(true);
      expect(root.children().debug()).to.equal('<span />\n\n\n<span />');
    });
  });

  describe('lifecycles', () => {
    it('calls `componentDidUpdate` when component’s `setState` is called', () => {
      class Foo extends React.Component {
        constructor(props) {
          super(props);
          this.state = {
            foo: 'init',
          };
        }

        componentDidUpdate() {}

        onChange() {
          this.setState({ foo: 'onChange update' });
        }

        render() {
          return <div>{this.state.foo}</div>;
        }
      }
      const spy = sinon.spy(Foo.prototype, 'componentDidUpdate');

      const wrapper = shallow(<Foo />);
      wrapper.setState({ foo: 'wrapper setState update' });
      expect(wrapper.state('foo')).to.equal('wrapper setState update');
      expect(spy).to.have.property('callCount', 1);
      wrapper.instance().onChange();
      expect(wrapper.state('foo')).to.equal('onChange update');
      expect(spy).to.have.property('callCount', 2);
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

        componentDidUpdate() {}

        onChange() {
          // enzyme can't handle the update because `this` is a ReactComponent instance,
          // not a ShallowWrapper instance.
          this.setState({ foo: 'onChange update' });
        }

        render() {
          return (
            <div>
              {this.state.foo}
              <button onClick={this.onChange}>click</button>
            </div>
          );
        }
      }
      const spy = sinon.spy(Foo.prototype, 'componentDidUpdate');

      const wrapper = shallow(<Foo />);
      wrapper.find('button').prop('onClick')();
      expect(wrapper.state('foo')).to.equal('onChange update');
      expect(spy).to.have.property('callCount', 1);
    });

    it('calls `componentDidUpdate` when component’s `setState` is called', () => {
      class Foo extends React.Component {
        constructor(props) {
          super(props);
          this.state = {
            foo: 'init',
          };
          this.update = () => this.setState({ foo: 'update' });
        }

        componentDidMount() {
          this.update();
        }

        componentDidUpdate() {}

        render() {
          return <div>{this.state.foo}</div>;
        }
      }
      const spy = sinon.spy(Foo.prototype, 'componentDidUpdate');

      const wrapper = shallow(<Foo />);
      expect(spy).to.have.property('callCount', 1);
      expect(wrapper.state('foo')).to.equal('update');
    });

    it('does not call `componentDidMount` twice when a child component is created', () => {
      class Foo extends React.Component {
        constructor(props) {
          super(props);
          this.state = {
            foo: 'init',
          };
        }

        componentDidMount() {}

        render() {
          return (
            <div>
              <button onClick={() => this.setState({ foo: 'update2' })}>
                click
              </button>
              {this.state.foo}
            </div>
          );
        }
      }
      const spy = sinon.spy(Foo.prototype, 'componentDidMount');

      const wrapper = shallow(<Foo />);
      expect(spy).to.have.property('callCount', 1);
      wrapper.find('button').prop('onClick')();
      expect(spy).to.have.property('callCount', 1);
    });
  });
});
