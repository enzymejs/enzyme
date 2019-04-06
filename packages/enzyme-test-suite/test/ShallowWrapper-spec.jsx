import React from 'react';
import PropTypes from 'prop-types';
import { expect } from 'chai';
import sinon from 'sinon-sandbox';
import wrap from 'mocha-wrap';
import isEqual from 'lodash.isequal';
import {
  shallow,
  ShallowWrapper,
} from 'enzyme';
import shallowEntry from 'enzyme/shallow';
import ShallowWrapperEntry from 'enzyme/ShallowWrapper';
import {
  withSetStateAllowed,
} from 'enzyme/build/Utils';
import getAdapter from 'enzyme/build/getAdapter';

import './_helpers/setupAdapters';
import {
  createClass,
  createContext,
  createPortal,
  Fragment,
  forwardRef,
  PureComponent,
  useEffect,
  useState,
  Profiler,
} from './_helpers/react-compat';
import {
  describeIf,
  itIf,
} from './_helpers';
import describeMethods from './_helpers/describeMethods';
import {
  REACT16,
  is,
} from './_helpers/version';

// The shallow renderer in react 16 does not yet support batched updates. When it does,
// we should be able to go un-skip all of the tests that are skipped with this flag.
const BATCHING = !REACT16;

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

    describeIf(is('>= 0.14'), 'wrappingComponent', () => {
      class More extends React.Component {
        render() {
          return null;
        }
      }

      class StateTester extends React.Component {
        render() {
          return null;
        }
      }

      class TestProvider extends React.Component {
        getChildContext() {
          const { value, renderMore, renderStateTester } = this.props;

          return {
            testContext: value || 'Hello world!',
            renderMore: renderMore || false,
            renderStateTester: renderStateTester || false,
          };
        }

        render() {
          const { children } = this.props;

          return <span>{children}</span>;
        }
      }
      TestProvider.childContextTypes = {
        testContext: PropTypes.string,
        renderMore: PropTypes.bool,
        renderStateTester: PropTypes.bool,
      };

      class MyWrappingComponent extends React.Component {
        constructor() {
          super();
          this.state = { renderStateTester: false };
        }

        render() {
          const { children, contextValue, renderMore } = this.props;
          const { renderStateTester } = this.state;

          return (
            <div>
              <TestProvider
                value={contextValue}
                renderMore={renderMore}
                renderStateTester={renderStateTester}
              >
                <div>
                  {children}
                </div>
              </TestProvider>
            </div>
          );
        }
      }

      class MyComponent extends React.Component {
        render() {
          const {
            testContext,
            renderMore = true,
            renderStateTester,
            explicitContext,
          } = this.context;
          return (
            <div>
              <div>Context says: {testContext}{explicitContext}</div>
              {renderMore && <More />}
              {renderStateTester && <StateTester />}
            </div>
          );
        }
      }
      MyComponent.contextTypes = {
        ...TestProvider.childContextTypes,
        explicitContext: PropTypes.bool,
      };

      it('mounts the passed node as the root as per usual', () => {
        const wrapper = shallow(<MyComponent />, {
          wrappingComponent: MyWrappingComponent,
          context: {
            explicitContext: ' stop!',
          },
        });
        expect(wrapper.type()).to.equal('div');
        expect(wrapper.parent().exists()).to.equal(false);
        expect(() => wrapper.setProps({ foo: 'bar' })).not.to.throw();
      });

      it('renders the root in the wrapping component', () => {
        const wrapper = shallow(<MyComponent />, {
          wrappingComponent: MyWrappingComponent,
          context: {
            explicitContext: ' stop!',
          },
        });
        // Context will only be set properly if the root node is rendered as a descendent of the wrapping component.
        expect(wrapper.text()).to.equal('Context says: Hello world! stop!');
      });

      it('supports mounting the wrapping component with initial props', () => {
        const wrapper = shallow(<MyComponent />, {
          wrappingComponent: MyWrappingComponent,
          wrappingComponentProps: { contextValue: 'I can be set!' },
        });
        expect(wrapper.text()).to.equal('Context says: I can be set!');
      });

      describeIf(is('>= 16.3'), 'with createContext()', () => {
        let Context1;
        let Context2;
        beforeEach(() => {
          Context1 = createContext('default1');
          Context2 = createContext('default2');
        });

        function WrappingComponent(props) {
          const { value1, value2, children } = props;
          return (
            <Context1.Provider value={value1}>
              <Context2.Provider value={value2}>
                {children}
              </Context2.Provider>
            </Context1.Provider>
          );
        }

        function Component() {
          return (
            <Context1.Consumer>
              {value1 => (
                <Context2.Consumer>
                  {value2 => (
                    <div>Value 1: {value1}; Value 2: {value2}</div>
                  )}
                </Context2.Consumer>
              )}
            </Context1.Consumer>
          );
        }

        it('renders', () => {
          const wrapper = shallow(<Component />, {
            wrappingComponent: WrappingComponent,
            wrappingComponentProps: {
              value1: 'one',
              value2: 'two',
            },
          });
          const consumer1 = wrapper.find(Context1.Consumer).dive();
          const consumer2 = consumer1.find(Context2.Consumer).dive();

          expect(consumer2.text()).to.equal('Value 1: one; Value 2: two');
        });
      });

      it('throws an error if the wrappingComponent does not render its children', () => {
        class BadWrapper extends React.Component {
          render() {
            return <div />;
          }
        }
        expect(() => shallow(<MyComponent />, {
          wrappingComponent: BadWrapper,
        })).to.throw('`wrappingComponent` must render its children!');
      });

      wrap()
        .withOverrides(() => getAdapter(), () => ({
          isCustomComponent: undefined,
          RootFinder: undefined,
          wrapWithWrappingComponent: undefined,
        }))
        .describe('with an old adapter', () => {
          it('renders fine when wrappingComponent is not passed', () => {
            const wrapper = shallow(<MyComponent />);
            expect(wrapper.debug()).to.equal(`<div>
  <div>
    Context says:${' '}
  </div>
  <More />
</div>`);
          });

          it('throws an error if wrappingComponent is passed', () => {
            expect(() => shallow(<MyComponent />, {
              wrappingComponent: MyWrappingComponent,
            })).to.throw('your adapter does not support `wrappingComponent`. Try upgrading it!');
          });
        });
    });

    class RendersChildren extends React.Component {
      render() {
        const { children } = this.props;
        return children;
      }
    }

    itIf.skip(is('<=0.13'), 'throws an error if wrappingComponent is passed', () => {
      expect(() => shallow(<div />, {
        wrappingComponent: RendersChildren,
      })).to.throw('your adapter does not support `wrappingComponent`. Try upgrading it!');
    });

    describeIf.skip(is('>= 16.3'), 'uses the isValidElementType from the Adapter to validate the prop type of Component', () => {
      const Foo = () => null;
      const Bar = () => null;
      wrap()
        .withConsoleThrows()
        .withOverride(() => getAdapter(), 'isValidElementType', () => val => val === Foo)
        .it('with isValidElementType defined on the Adapter', () => {
          expect(() => {
            shallow(<Bar />);
          }).to.throw('Warning: Failed prop type: Component must be a valid element type!\n    in WrapperComponent');
        });
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

    describeIf(is('>= 16.3'), 'createContext()', () => {
      describe('rendering as root:', () => {
        let Context;

        beforeEach(() => {
          Context = createContext('cool');
        });

        describe('<Provider />', () => {
          it('can be rendered as the root', () => {
            const wrapper = shallow(
              <Context.Provider value="hello">
                <Context.Consumer>
                  {value => <div>{value}</div>}
                </Context.Consumer>
              </Context.Provider>,
            );
            expect(wrapper.debug()).to.eql(`
<ContextConsumer>
  [function]
</ContextConsumer>
            `.trim());
          });

          it('supports changing the value', () => {
            const wrapper = shallow(
              <Context.Provider value="hello">
                <Context.Consumer>
                  {value => <div>{value}</div>}
                </Context.Consumer>
              </Context.Provider>,
            );
            wrapper.setProps({ value: 'world' });
            expect(wrapper.find(Context.Consumer).dive().text()).to.eql('world');
          });
        });

        describe('<Consumer />', () => {
          function DivRenderer({ children }) {
            return <div>{children}</div>;
          }
          it('can be rendered as the root', () => {
            const wrapper = shallow(
              <Context.Consumer>
                {value => <DivRenderer>{value}</DivRenderer>}
              </Context.Consumer>,
            );
            expect(wrapper.debug()).to.eql(`
<DivRenderer>
  cool
</DivRenderer>
            `.trim());
          });

          it('supports changing the children', () => {
            const wrapper = shallow(
              <Context.Consumer>
                {value => <DivRenderer>{value}</DivRenderer>}
              </Context.Consumer>,
            );
            wrapper.setProps({ children: value => <DivRenderer>Changed: {value}</DivRenderer> });
            expect(wrapper.find(DivRenderer).dive().text()).to.eql('Changed: cool');
          });
        });
      });

      describe('dive() on Provider and Consumer', () => {
        let Provider;
        let Consumer;

        beforeEach(() => {
          ({ Provider, Consumer } = React.createContext('howdy!'));
        });

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
            const { children } = this.props;

            return (
              <Provider value="foo"><div><div />{children}</div></Provider>
            );
          }
        }

        class MyComponent extends React.Component {
          render() {
            return (
              <Provides><Consumes /></Provides>
            );
          }
        }

        it('works on a Provider', () => {
          const wrapper = shallow(<MyComponent />);
          const provides = wrapper.find(Provides).dive();
          const provider = provides.find(Provider).dive();
          expect(provider.text()).to.equal('<Consumes />');
        });

        it('always gives the default provider value if dive()ing directly to a <Consumer />', () => {
          // Diving directly on a consumer will give you the default value
          const wrapper = shallow(<MyComponent />);
          const consumes = wrapper.find(Consumes).dive();
          const consumer = consumes.find(Consumer).dive();
          expect(consumer.text()).to.equal('howdy!');
        });

        it('gives the actual <Provider /> value if one dive()s it', () => {
          const wrapper = shallow(<MyComponent />);
          const provides = wrapper.find(Provides).dive();
          const provider = provides.find(Provider).dive();
          const consumes = provider.find(Consumes).dive();
          const consumer = consumes.find(Consumer).dive();
          expect(consumer.text()).to.equal('foo');
        });

        it('does not leak values across roots', () => {
          const wrapper = shallow(<MyComponent />);
          const provides = wrapper.find(Provides).dive();
          const provider = provides.find(Provider).dive();
          expect(provider).to.have.lengthOf(1);

          const consumes = wrapper.find(Consumes).dive();
          const consumer = consumes.find(Consumer).dive();
          expect(consumer.text()).to.equal('howdy!');
        });
      });
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

        const context = { name: 'foo' };
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

  describeIf(is('>= 16.4'), 'Profiler', () => {
    function SomeComponent() {
      return (
        <Profiler id="SomeComponent" onRender={() => {}}>
          <main>
            <div className="child" />
          </main>
        </Profiler>
      );
    }

    wrap()
      .withConsoleThrows()
      .it('mounts without complaint', () => {
        expect(() => shallow(<SomeComponent />)).not.to.throw();
      });

    it('renders', () => {
      const wrapper = shallow(<SomeComponent />);
      expect(wrapper.debug()).to.equal(`<Profiler id="SomeComponent" onRender={[Function: onRender]}>
  <main>
    <div className="child" />
  </main>
</Profiler>`);
    });

    it('finds elements through Profiler elements', () => {
      const wrapper = shallow(<SomeComponent />);

      expect(wrapper.find('.child')).to.have.lengthOf(1);
    });

    it('finds Profiler element', () => {
      const Parent = () => <span><SomeComponent foo="hello" /></span>;

      const wrapper = shallow(<Parent foo="hello" />);
      const results = wrapper.find(SomeComponent);

      expect(results).to.have.lengthOf(1);
      expect(results.type()).to.equal(SomeComponent);
      expect(results.props()).to.eql({ foo: 'hello' });
    });

    it('can find Profiler by id', () => {
      const wrapper = shallow(<SomeComponent />);
      expect(wrapper.find('[id="SomeComponent"]').exists()).to.equal(true);
    });

    it('can find Profiler by display name', () => {
      const wrapper = shallow(<SomeComponent />);
      const profiler = wrapper.find('Profiler');
      expect(profiler).to.have.lengthOf(1);
      expect(profiler.type()).to.equal(Profiler);
    });

    // TODO: enable when Profiler is no longer unstable
    it.skip('recognizes render phases', () => {
      const handleRender = sinon.spy();
      function AnotherComponent() {
        return (
          <Profiler id="AnotherComponent" onRender={handleRender}>
            <div />
          </Profiler>
        );
      }

      const wrapper = shallow(<AnotherComponent />);
      expect(handleRender).to.have.property('callCount', 1);
      expect(handleRender.args[0][1]).to.equal('mount');

      wrapper.setProps({ unusedProp: true });
      expect(handleRender).to.have.property('callCount', 2);
      expect(handleRender.args[1][1]).to.equal('update');
    });

    // TODO: enable when Profiler is no longer unstable
    it.skip('measures timings', () => {
      /**
       * test environment has no access to the performance API at which point
       * the profiling API has to fallback to Date.now() which isn't precise enough
       * which results in 0 duration for these simple examples most of the time.
       * With performance API it should test for greaterThan(0) instead of least(0)
       */
      const handleRender = sinon.spy();
      function AnotherComponent() {
        return (
          <Profiler id="AnotherComponent" onRender={handleRender}>
            <div />
          </Profiler>
        );
      }

      const wrapper = shallow(<AnotherComponent />);
      expect(handleRender).to.have.property('callCount', 1);
      const [firstArgs] = handleRender.args;
      if (typeof performance === 'undefined') {
        expect(firstArgs[2]).to.be.least(0);
        expect(firstArgs[3]).to.be.least(0);
      } else {
        expect(firstArgs[2]).to.be.greaterThan(0);
        expect(firstArgs[3]).to.be.greaterThan(0);
      }

      wrapper.setProps({ unusedProp: true });
      expect(handleRender).to.have.property('callCount', 2);
      const [, secondArgs] = handleRender.args;
      if (typeof performance === 'undefined') {
        expect(secondArgs[2]).to.be.least(0);
        expect(secondArgs[3]).to.be.least(0);
      } else {
        expect(secondArgs[2]).to.be.greaterThan(0);
        expect(secondArgs[3]).to.be.greaterThan(0);
      }
    });
  });

  describeIf(is('>= 16.8.5'), 'hooks', () => {
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

  itIf(is('>= 16.2'), 'does not support fragments', () => {
    const wrapper = () => shallow((
      <Fragment>
        <p>hello</p>
        <span>boo</span>
      </Fragment>
    ));

    expect(wrapper).to.throw('ReactShallowRenderer render(): Shallow rendering works only with custom components, but the provided element type was `symbol`.');
  });

  const Wrap = shallow;
  const Wrapper = ShallowWrapper;
  describeMethods(
    { Wrap, Wrapper },
    '@@iterator',
    'at',
    'childAt',
    'children',
    'closest',
    'contains',
    'containsAllMatchingElements',
    'containsAnyMatchingElements',
    'containsMatchingElement',
    'debug',
    'equals',
    'every',
    'everyWhere',
    'exists',
    'filter',
    'filterWhere',
    'find',
    'findWhere',
    'first',
    'flatMap',
    'forEach',
    'get',
    'getElement',
    'getElements',
    'getNode',
    'getNodes',
    'getWrappingComponent',
    'hasClass',
    'hostNodes',
    'html',
    'instance',
    'is',
    'isEmpty',
    'isEmptyRender',
    'key',
    'last',
    'map',
    'matchesElement',
    'name',
    'not',
    'parent',
    'parents',
    'prop',
    'props',
    'reduce',
    'reduceRight',
    'render',
    'renderProp',
    'root',
    'setContext',
    'setProps',
    'setState',
    'simulate',
    'simulateError',
    'single',
    'slice',
    'some',
    'someWhere',
    'state',
    'tap',
    'text',
    'unmount',
    'wrap',
  );

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
            const {
              didThrow,
              throws,
            } = this.state;
            return (
              <div>
                <MaybeFragment>
                  <span>
                    <Thrower throws={throws} />
                    <div>
                      {didThrow ? 'HasThrown' : 'HasNotThrown'}
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

    describeIf(is('>= 16.6'), 'getDerivedStateFromError', () => {
      describe('errors inside an error boundary', () => {
        const errorToThrow = new EvalError('threw an error!');

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

        describe('Thrower', () => {
          it('does not throw when `throws` is `false`', () => {
            expect(() => shallow(<Thrower throws={false} />)).not.to.throw();
          });

          it('throws when `throws` is `true`', () => {
            expect(() => shallow(<Thrower throws />)).to.throw();
          });
        });

        it('catches a simulated error', () => {
          const ErrorBoundary = getErrorBoundary();

          const spy = sinon.spy(ErrorBoundary, 'getDerivedStateFromError');
          const wrapper = shallow(<ErrorBoundary />);

          expect(spy).to.have.property('callCount', 0);

          expect(() => wrapper.find(Thrower).simulateError(errorToThrow)).not.to.throw();

          expect(spy).to.have.property('callCount', 1);

          expect(spy.args).to.be.an('array').and.have.lengthOf(1);
          const [[actualError]] = spy.args;
          expect(actualError).to.equal(errorToThrow);
        });

        it('rerenders on a simulated error', () => {
          const ErrorBoundary = getErrorBoundary();

          const wrapper = shallow(<ErrorBoundary />);

          expect(wrapper.find({ children: 'HasThrown' })).to.have.lengthOf(0);
          expect(wrapper.find({ children: 'HasNotThrown' })).to.have.lengthOf(1);

          expect(() => wrapper.find(Thrower).simulateError(errorToThrow)).not.to.throw();

          expect(wrapper.find({ children: 'HasThrown' })).to.have.lengthOf(1);
          expect(wrapper.find({ children: 'HasNotThrown' })).to.have.lengthOf(0);
        });

        it('does not catch errors during shallow render', () => {
          const ErrorBoundary = getErrorBoundary();

          const spy = sinon.spy(ErrorBoundary, 'getDerivedStateFromError');
          const wrapper = shallow(<ErrorBoundary />);

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

    describeIf(is('>= 16.6'), 'getDerivedStateFromError and componentDidCatch combined', () => {

      const errorToThrow = new EvalError('threw an error!');
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

        it('does not catch errors during shallow render', () => {
          const wrapper = shallow(<ErrorBoundary />);

          expect(lifecycleSpy).to.have.property('callCount', 2);
          expect(lifecycleSpy.args).to.deep.equal([
            ['constructor'],
            ['render'],
          ]);

          expect(stateSpy).to.have.property('callCount', 0);

          lifecycleSpy.resetHistory();

          wrapper.setState({ throws: true });

          const thrower = wrapper.find(Thrower);
          expect(thrower).to.have.lengthOf(1);
          expect(thrower.props()).to.have.property('throws', true);

          expect(() => thrower.dive()).to.throw(errorToThrow);

          expect(lifecycleSpy).to.have.property('callCount', 1);
          expect(lifecycleSpy.args).to.deep.equal([
            ['render'],
          ]);
        });

        it('calls getDerivedStateFromError first and then componentDidCatch for simulated error', () => {
          const wrapper = shallow(<ErrorBoundary />);

          expect(lifecycleSpy).to.have.property('callCount', 2);
          expect(lifecycleSpy.args).to.deep.equal([
            ['constructor'],
            ['render'],
          ]);

          expect(stateSpy).to.have.property('callCount', 0);

          lifecycleSpy.resetHistory();

          expect(() => wrapper.find(Thrower).simulateError(errorToThrow)).not.to.throw();

          expect(lifecycleSpy).to.have.property('callCount', 3);
          expect(lifecycleSpy.args).to.deep.equal([
            ['getDerivedStateFromError', errorToThrow],
            ['render'],
            ['componentDidCatch', errorToThrow, expectedInfo],
          ]);

          expect(stateSpy).to.have.property('callCount', 1);
          expect(stateSpy.args).to.deep.equal([
            [{
              throws: false,
              didThrow: true,
            }],
          ]);
        });
      });

      describe('errors inside error boundary when getDerivedStateFromError does not return update', () => {
        let spy;

        beforeEach(() => {
          spy = sinon.spy();
        });

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

        it('does not catch errors during shallow render', () => {
          const wrapper = shallow(<ErrorBoundary />);

          expect(spy).to.have.property('callCount', 2);
          expect(spy.args).to.deep.equal([
            ['constructor'],
            ['render'],
          ]);

          spy.resetHistory();

          wrapper.setState({ throws: true });

          const thrower = wrapper.find(Thrower);
          expect(thrower).to.have.lengthOf(1);
          expect(thrower.props()).to.have.property('throws', true);

          expect(() => thrower.dive()).to.throw(errorToThrow);

          expect(spy).to.have.property('callCount', 1);
          expect(spy.args).to.deep.equal([
            ['render'],
          ]);
        });

        it('rerenders on a simulated error', () => {
          const wrapper = shallow(<ErrorBoundary />);

          expect(spy).to.have.property('callCount', 2);
          expect(spy.args).to.deep.equal([
            ['constructor'],
            ['render'],
          ]);

          spy.resetHistory();

          const thrower = wrapper.find(Thrower);

          expect(() => thrower.simulateError(errorToThrow)).not.to.throw(errorToThrow);

          expect(spy).to.have.property('callCount', 3);
          expect(spy.args).to.deep.equal([
            ['getDerivedStateFromError', errorToThrow],
            ['componentDidCatch', errorToThrow, expectedInfo],
            ['render'],
          ]);
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

        let cDU;
        let gDSFP;

        beforeEach(() => { // eslint-disable-line mocha/no-sibling-hooks
          cDU = sinon.spy(DummyComp.prototype, 'componentDidUpdate');
          gDSFP = sinon.spy(DummyComp, 'getDerivedStateFromProps');
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
