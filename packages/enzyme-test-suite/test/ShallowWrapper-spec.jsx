import React from 'react';
import PropTypes from 'prop-types';
import { expect } from 'chai';
import sinon from 'sinon-sandbox';
import wrap from 'mocha-wrap';
import inspect from 'object-inspect';

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
import { fakeDynamicImport } from 'enzyme-adapter-utils';

import './_helpers/setupAdapters';
import {
  createClass,
  createContext,
  createPortal,
  forwardRef,
  Fragment,
  lazy,
  memo,
  Profiler,
  Suspense,
  useCallback,
} from './_helpers/react-compat';
import {
  describeIf,
  itIf,
} from './_helpers';
import describeMethods from './_helpers/describeMethods';
import describeLifecycles from './_helpers/describeLifecycles';
import describeHooks from './_helpers/describeHooks';
import {
  is,
} from './_helpers/version';

describe('shallow', () => {
  describe('top level entry points', () => {
    expect(shallowEntry).to.equal(shallow);
    expect(ShallowWrapperEntry).to.equal(ShallowWrapper);
  });

  describe('top level wrapper', () => {
    it('does what i expect', () => {
      class Box extends React.Component {
        render() {
          const { children } = this.props;
          return <div className="box">{children}</div>;
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
              {(value1) => (
                <Context2.Consumer>
                  {(value2) => (
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
        .withOverride(() => getAdapter(), 'isValidElementType', () => (val) => val === Foo)
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
          const { name } = this.context;
          return <div>{name}</div>;
        },
      });

      const context = { name: 'foo' };
      const wrapper = shallow(<SimpleComponent />, { context });
      expect(wrapper.text()).to.equal('foo');
    });

    it('does not throw if context is passed in but contextTypes is missing', () => {
      const SimpleComponent = createClass({
        render() {
          const { name } = this.context;
          return <div>{name}</div>;
        },
      });

      const context = { name: 'foo' };
      expect(() => shallow(<SimpleComponent />, { context })).not.to.throw();
    });

    it('is introspectable through context API', () => {
      const SimpleComponent = createClass({
        contextTypes: {
          name: PropTypes.string,
        },
        render() {
          const { name } = this.context;
          return <div>{name}</div>;
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
              <Consumer>{(value) => <span>{value}</span>}</Consumer>
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
                  {(value) => <div>{value}</div>}
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
                  {(value) => <div>{value}</div>}
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
                {(value) => <DivRenderer>{value}</DivRenderer>}
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
                {(value) => <DivRenderer>{value}</DivRenderer>}
              </Context.Consumer>,
            );
            wrapper.setProps({ children: (value) => <DivRenderer>Changed: {value}</DivRenderer> });
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
                <Consumer>{(value) => <span>{value}</span>}</Consumer>
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

      describe('shallow() on Provider and Consumer', () => {
        let Provider;
        let Consumer;

        beforeEach(() => {
          ({ Provider, Consumer } = React.createContext('howdy!'));
        });

        class Consumes extends React.Component {
          render() {
            return (
              <span>
                <Consumer>{(value) => <span>{value}</span>}</Consumer>
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
          const provider = provides.find(Provider).shallow();
          expect(provider.text()).to.equal('<Consumes />');
        });

        it('always gives the default provider value if shallow() rendering a <Consumer /> directly', () => {
          // Diving directly on a consumer will give you the default value
          const wrapper = shallow(<MyComponent />);
          const consumes = wrapper.find(Consumes).shallow();
          const consumer = consumes.find(Consumer).shallow();
          expect(consumer.text()).to.equal('howdy!');
        });

        it('gives the actual <Provider /> value if one dive()s it', () => {
          const wrapper = shallow(<MyComponent />);
          const provides = wrapper.find(Provides).shallow();
          const provider = provides.find(Provider).shallow();
          const consumes = provider.find(Consumes).shallow();
          const consumer = consumes.find(Consumer).shallow();
          expect(consumer.text()).to.equal('foo');
        });
      });
    });

    describeIf(is('> 0.13'), 'stateless function components (SFCs)', () => {
      it('can pass in context', () => {
        const SimpleComponent = (props, { name }) => (
          <div>{name}</div>
        );
        SimpleComponent.contextTypes = { name: PropTypes.string };

        const context = { name: 'foo' };
        const wrapper = shallow(<SimpleComponent />, { context });
        expect(wrapper.text()).to.equal('foo');
      });

      it('does not throw if context is passed in but contextTypes is missing', () => {
        const SimpleComponent = (props, { name }) => (
          <div>{name}</div>
        );

        const context = { name: 'foo' };
        expect(() => shallow(<SimpleComponent />, { context })).not.to.throw();
      });

      itIf(is('< 16'), 'is introspectable through context API', () => {
        const SimpleComponent = (props, { name }) => (
          <div>{name}</div>
        );
        SimpleComponent.contextTypes = { name: PropTypes.string };

        const context = { name: 'foo' };
        const wrapper = shallow(<SimpleComponent />, { context });

        expect(wrapper.context().name).to.equal(context.name);
        expect(wrapper.context('name')).to.equal(context.name);
      });

      itIf(is('>= 16'), 'is not introspectable through context API', () => {
        const SimpleComponent = (props, { name }) => (
          <div>{name}</div>
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

        it('propagates updates to rendered children', () => {
          const wrapper = shallow(<TestComponent />, { context: { baz: 'enzyme' } });

          const fooProvider = wrapper.find(FooProvider).dive();
          const barProvider = fooProvider.find(BarProvider).dive();
          const consumer = barProvider.find(FooBarBazConsumer).dive();

          expect(consumer.context()).to.eql({ foo: 'i', bar: 'love', baz: 'enzyme' });

          fooProvider.setProps({ value: 'we' });

          const nextBarProvider = fooProvider.find(BarProvider).dive();
          nextBarProvider.setState({ value: 'maintain' });
          const nextConsumer = nextBarProvider.find(FooBarBazConsumer).dive();

          const expectedContext = { foo: 'we', bar: 'maintain', baz: 'enzyme' };
          expect(nextConsumer.context()).to.eql(expectedContext);
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

        class Provider extends React.Component {
          getChildContext() {
            return {
              foo: 'foo!',
              bar: 'bar!',
            };
          }

          render() {
            const { children } = this.props;
            return children;
          }
        }

        class Receiver extends React.Component {
          render() {
            return <div>{inspect(this.context)}</div>;
          }
        }

        // react 0.14 and 15 throw an invariant exception in this case
        itIf(is('0.13 || > 15'), 'warns and works but provides no context, without childContextTypes', () => {
          const stub = sinon.stub(console, 'warn');
          const wrapper = shallow(<Provider><Receiver /></Provider>).dive();
          expect(wrapper.debug()).to.equal(`<div>
  {}
</div>`);
          expect(stub).to.have.property('callCount', 1);
          expect(stub.args).to.eql([['Provider.getChildContext(): childContextTypes must be defined in order to use getChildContext().']]);
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
    'deprecatedInstanceProperties',
    '@@iterator',
    'at',
    'childAt',
    'children',
    'closest',
    'contains',
    'containsAllMatchingElements',
    'containsAnyMatchingElements',
    'containsMatchingElement',
    'context',
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
    'invoke',
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
  describeLifecycles(
    { Wrap, Wrapper },
    'componentDidCatch',
    'componentDidMount',
    'componentDidUpdate',
    'componentWillUnmount',
    'getDerivedStateFromError',
    'getDerivedStateFromProps',
    'getSnapshotBeforeUpdate',
    'misc',
  );
  describeHooks(
    { Wrap, Wrapper },
    'useCallback',
    'useContext',
    'useDebugValue',
    'useEffect',
    'useImperativeHandle',
    'useLayoutEffect',
    'useMemo',
    'useReducer',
    'useRef',
    'useState',
    'custom',
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
            const { name } = this.context;
            return <div>{name}</div>;
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
            const { name } = this.context;
            return <div>{name}</div>;
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
        expect(() => wrapper.find(Bar).shallow({ context })).not.to.throw();
      });

      it('is introspectable through context API', () => {
        class Bar extends React.Component {
          render() {
            const { name } = this.context;
            return <div>{name}</div>;
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
          const Bar = (props, { name }) => (
            <div>{name}</div>
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
          const Bar = (props, { name }) => (
            <div>{name}</div>
          );
          const Foo = () => (
            <div>
              <Bar />
            </div>
          );

          const context = { name: 'foo' };
          const wrapper = shallow(<Foo />);
          expect(() => wrapper.find(Bar).shallow({ context })).not.to.throw();
        });

        itIf(is('< 16'), 'is introspectable through context API', () => {
          const Bar = (props, { name }) => (
            <div>{name}</div>
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
          const Bar = (props, { name }) => (
            <div>{name}</div>
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

    describeIf(is('>= 16.6'), 'memo', () => {
      const App = () => <div>Guest</div>;

      const AppMemoized = memo && Object.assign(memo(App), { displayName: 'AppMemoized' });

      const RendersApp = () => <App />;
      const RendersAppMemoized = () => <AppMemoized />;

      it('works without memoizing', () => {
        const wrapper = shallow(<RendersApp />);
        expect(wrapper.debug()).to.equal('<App />');
        expect(wrapper.dive().debug()).to.equal(`<div>
  Guest
</div>`);
        expect(() => wrapper.dive().dive()).to.throw(TypeError);
      });

      it('works with memoizing', () => {
        const wrapper = shallow(<RendersAppMemoized />);
        expect(wrapper.debug()).to.equal('<AppMemoized />');
        expect(wrapper.dive().debug()).to.equal(`<div>
  Guest
</div>`);
        expect(() => wrapper.dive().dive()).to.throw(TypeError);
      });
    });
  });

  describeIf(is('>= 16.6'), 'Suspense & lazy', () => {
    class DynamicComponent extends React.Component {
      render() {
        return (
          <div>Dynamic Component</div>
        );
      }
    }

    class Fallback extends React.Component {
      render() {
        return (
          <div>Fallback</div>
        );
      }
    }

    it('finds Suspense and its children when no lazy component', () => {
      class Component extends React.Component {
        render() {
          return (
            <div>test</div>
          );
        }
      }

      const SuspenseComponent = () => (
        <Suspense fallback={<Fallback />}>
          <Component />
        </Suspense>
      );

      const wrapper = shallow(<SuspenseComponent />);

      expect(wrapper.is(Suspense)).to.equal(true);
      expect(wrapper.find(Component)).to.have.lengthOf(1);
      expect(wrapper.find(Fallback)).to.have.lengthOf(0);
    });

    it('works with Suspense with multiple children if options.suspenseFallback=true', () => {
      const wrapper = shallow((
        <Suspense fallback={<Fallback />}>
          <div />
          <div />
        </Suspense>
      ), { suspenseFallback: true });
      expect(wrapper.debug()).to.equal(`<Suspense fallback={{...}}>
  <div />
  <div />
</Suspense>`);
    });

    it('works with Suspense with multiple children if options.suspenseFallback=false', () => {
      const wrapper = shallow((
        <Suspense fallback={<Fallback />}>
          <div />
          <div />
        </Suspense>
      ), { suspenseFallback: false });
      expect(wrapper.debug()).to.equal(`<Suspense fallback={{...}}>
  <div />
  <div />
</Suspense>`);
    });

    it('finds LazyComponent when render component wrapping lazy component', () => {
      const LazyComponent = lazy(() => fakeDynamicImport(DynamicComponent));
      const SuspenseComponent = () => (
        <Suspense fallback={<Fallback />}>
          <LazyComponent />
        </Suspense>
      );

      const wrapper = shallow(<SuspenseComponent />);

      expect(wrapper.is(Suspense)).to.equal(true);
      expect(wrapper.find(LazyComponent)).to.have.lengthOf(1);
      expect(wrapper.find(Fallback)).to.have.lengthOf(0);
    });

    it('returns suspense and lazy component string when debug() is called', () => {
      const LazyComponent = lazy(() => fakeDynamicImport(DynamicComponent));
      const SuspenseComponent = () => (
        <Suspense fallback={<Fallback />}>
          <LazyComponent />
        </Suspense>
      );

      const wrapper = shallow(<SuspenseComponent />);

      expect(wrapper.debug()).to.equal(`<Suspense fallback={{...}}>
  <lazy />
</Suspense>`);
    });

    it('renders lazy component when render Suspense without option', () => {
      const LazyComponent = lazy(() => fakeDynamicImport(DynamicComponent));

      const wrapper = shallow((
        <Suspense fallback={<Fallback />}>
          <LazyComponent />
        </Suspense>
      ));

      expect(wrapper.find(LazyComponent)).to.have.lengthOf(1);
      expect(wrapper.find(Fallback)).to.have.lengthOf(0);
    });

    it('returns lazy component string when debug() is called', () => {
      const LazyComponent = lazy(() => fakeDynamicImport(DynamicComponent));

      const wrapper = shallow((
        <Suspense fallback={<Fallback />}>
          <LazyComponent />
        </Suspense>
      ));

      expect(wrapper.debug()).to.equal(`<Suspense fallback={{...}}>
  <lazy />
</Suspense>`);
    });

    it('replaces LazyComponent with Fallback when render Suspense if options.suspenseFallback=true', () => {
      const LazyComponent = lazy(() => fakeDynamicImport(DynamicComponent));

      const wrapper = shallow((
        <Suspense fallback={<Fallback />}>
          <LazyComponent />
        </Suspense>
      ), { suspenseFallback: true });

      expect(wrapper.find(LazyComponent)).to.have.lengthOf(0);
      expect(wrapper.find(Fallback)).to.have.lengthOf(1);
    });

    it('returns fallback component string when debug() is called if options.suspenseFallback=true', () => {
      const LazyComponent = lazy(() => fakeDynamicImport(DynamicComponent));

      const wrapper = shallow((
        <Suspense fallback={<Fallback />}>
          <LazyComponent />
        </Suspense>
      ), { suspenseFallback: true });

      expect(wrapper.debug()).to.equal(`<Suspense fallback={{...}}>
  <Fallback />
</Suspense>`);
    });

    it('throws if options.suspenseFallback is not boolean or undefined', () => {
      const LazyComponent = lazy(() => fakeDynamicImport(DynamicComponent));
      const SuspenseComponent = () => (
        <Suspense fallback={<Fallback />}>
          <LazyComponent />
        </Suspense>
      );
      expect(() => shallow(<SuspenseComponent />, { suspenseFallback: 'true' })).to.throw();
    });

    it('finds fallback after dive into functional component wrapping Suspense', () => {
      const LazyComponent = lazy(() => fakeDynamicImport(DynamicComponent));
      const SuspenseComponent = () => (
        <Suspense fallback={<Fallback />}>
          <LazyComponent />
        </Suspense>
      );

      const wrapper = shallow(<SuspenseComponent />, { suspenseFallback: true });
      const inner = wrapper.dive();

      expect(inner.find(LazyComponent)).to.have.lengthOf(0);
      expect(inner.find(Fallback)).to.have.lengthOf(1);
    });

    it('replaces nested LazyComponent with Fallback when render Suspense with options.suspenseFallback=true', () => {
      const LazyComponent = lazy(() => fakeDynamicImport(DynamicComponent));

      const wrapper = shallow((
        <Suspense fallback={<Fallback />}>
          <div className="should-be-rendered" />
          <LazyComponent />
          <div className="should-be-rendered">
            <LazyComponent />
            <div className="inner" />
          </div>
        </Suspense>
      ), { suspenseFallback: true });

      expect(wrapper.find(LazyComponent)).to.have.lengthOf(0);
      expect(wrapper.find(Fallback)).to.have.lengthOf(2);
      expect(wrapper.find('.should-be-rendered')).to.have.lengthOf(2);
      expect(wrapper.find('.should-be-rendered > .inner')).to.have.lengthOf(1);
    });

    it('does not replace LazyComponent with Fallback when render Suspense if options.suspenseFallback=false', () => {
      const LazyComponent = lazy(() => fakeDynamicImport(DynamicComponent));

      const wrapper = shallow((
        <Suspense fallback={<Fallback />}>
          <LazyComponent />
        </Suspense>
      ), { suspenseFallback: false });

      expect(wrapper.find(LazyComponent)).to.have.lengthOf(1);
      expect(wrapper.find(Fallback)).to.have.lengthOf(0);
    });

    it('does not replace nested LazyComponent with Fallback when render Suspense if option.suspenseFallback=false', () => {
      const LazyComponent = lazy(() => fakeDynamicImport(DynamicComponent));

      const wrapper = shallow((
        <Suspense fallback={<Fallback />}>
          <div className="should-be-rendered" />
          <LazyComponent />
          <div className="should-be-rendered">
            <LazyComponent />
            <div className="inner" />
          </div>
        </Suspense>
      ), { suspenseFallback: false });

      expect(wrapper.find(LazyComponent)).to.have.lengthOf(2);
      expect(wrapper.find(Fallback)).to.have.lengthOf(0);
      expect(wrapper.find('.should-be-rendered')).to.have.lengthOf(2);
      expect(wrapper.find('.should-be-rendered > .inner')).to.have.lengthOf(1);
    });

    it('throws when rendering lazy component', () => {
      const LazyComponent = lazy(() => fakeDynamicImport(DynamicComponent));
      expect(() => shallow(<LazyComponent />)).to.throw();
    });

    it('returns the correct instance if using Suspense in stateful components', () => {
      const LazyComponent = lazy(() => fakeDynamicImport(DynamicComponent));

      class Bar extends React.Component {
        render() {
          return (
            <Suspense fallback={<Fallback />}>
              <LazyComponent />
            </Suspense>
          );
        }
      }

      const wrapper = shallow(<Bar />);

      expect(wrapper.instance()).to.instanceOf(Bar);
    });

    describe('propType errors', () => {
      class MyComponent extends React.Component {
        render() {
          const { fallback, requiredString } = this.props;
          return (
            <Suspense fallback={fallback}>
              hello world {requiredString}
            </Suspense>
          );
        }
      }
      MyComponent.propTypes = {
        fallback: PropTypes.node.isRequired,
        requiredString: PropTypes.string.isRequired,
      };

      function MySFC({ fallback, requiredString }) {
        return (
          <Suspense fallback={fallback}>
            hello world {requiredString}
          </Suspense>
        );
      }
      MySFC.propTypes = MyComponent.propTypes;

      wrap()
        .withConsoleThrows()
        .it('renders with no propType errors with a string fallback', () => {
          shallow(<MyComponent requiredString="abc" fallback="loading..." />);
        });

      wrap()
        .withConsoleThrows()
        .it('renders with no propType errors with a component fallback', () => {
          shallow(<MyComponent requiredString="abc" fallback={<Fallback />} />);
        });

      describeIf(is('> 0.13'), 'stateless function components (SFCs)', () => {
        wrap()
          .withConsoleThrows()
          .it('renders with no propType errors with a string fallback', () => {
            shallow(<MySFC requiredString="abc" fallback="loading..." />);
          });

        wrap()
          .withConsoleThrows()
          .it('renders with no propType errors with a component fallback', () => {
            shallow(<MySFC requiredString="abc" fallback={<Fallback />} />);
          });
      });
    });

    // TODO: fix in v16.6 and v16.7
    describeIf(is('>= 16.8'), 'avoids regressing #2200', () => {
      const Home = lazy && lazy(() => new Promise(() => {}));

      const PageSwitchFallback = memo ? memo(() => <div aria-live="polite" aria-busy />) : {};
      PageSwitchFallback.displayName = 'PageSwitchFallback';

      const PageSwitch = memo ? memo(({ pageData }) => {
        const renderPageComponent = useCallback ? useCallback(() => {
          if (pageData === 'NOT_FOUND') return null;

          switch (pageData.key) {
            case 'home':
              return <Home />;
            default:
              return null;
          }
        }, [pageData]) : () => {};

        return (
          <Suspense fallback={<PageSwitchFallback />}>
            {renderPageComponent()}
          </Suspense>
        );
      }) : {};
      PageSwitch.displayName = 'PageSwitch';

      it('works with suspenseFallback: true', () => {
        const wrapper = shallow(<PageSwitch pageData={{ key: 'home' }} />, { suspenseFallback: true });
        expect(wrapper.find(PageSwitchFallback)).to.have.lengthOf(1);
        expect(wrapper.find(Home)).to.have.lengthOf(0);
      });

      it('works with suspenseFallback: false', () => {
        const wrapper = shallow(<PageSwitch pageData={{ key: 'home' }} />, { suspenseFallback: false });
        expect(wrapper.find(PageSwitchFallback)).to.have.lengthOf(0);
        expect(wrapper.find(Home)).to.have.lengthOf(1);
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

        Foo.contextTypes = {
          foo: PropTypes.string,
        };

        const options = {
          disableLifecycleMethods: true,
          context: {
            foo: 'foo',
          },
        };

        beforeEach(() => {
          spy.resetHistory();
        });

        it('does not call componentDidMount when mounting', () => {
          shallow(<Foo />, options);
          expect(spy.args).to.deep.equal([
            ['componentWillMount'],
            ['render'],
          ]);
        });

        it('calls expected methods when receiving new props', () => {
          const wrapper = shallow(<Foo />, options);
          expect(spy.args).to.deep.equal([
            ['componentWillMount'],
            ['render'],
          ]);
          spy.resetHistory();
          wrapper.setProps({ foo: 'foo' });
          expect(spy.args).to.deep.equal([
            ['componentWillReceiveProps'],
            ['shouldComponentUpdate'],
            ['componentWillUpdate'],
            ['render'],
          ]);
        });

        describe('setContext', () => {
          it('calls expected methods when receiving new context', () => {
            const wrapper = shallow(<Foo />, options);
            expect(spy.args).to.deep.equal([
              ['componentWillMount'],
              ['render'],
            ]);
            spy.resetHistory();

            wrapper.setContext({ foo: 'bar' });

            expect(spy.args).to.deep.equal([
              ['componentWillReceiveProps'],
              ['shouldComponentUpdate'],
              ['componentWillUpdate'],
              ['render'],
            ]);
          });
        });

        itIf(is('< 16'), 'calls expected methods for setState', () => {
          const wrapper = shallow(<Foo />, options);
          expect(spy.args).to.deep.equal([
            ['componentWillMount'],
            ['render'],
          ]);
          spy.resetHistory();
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
          const wrapper = shallow(<Foo />, options);
          expect(spy.args).to.deep.equal([
            ['componentWillMount'],
            ['render'],
          ]);
          spy.resetHistory();
          wrapper.setState({ bar: 'bar' });
          expect(spy.args).to.deep.equal([
            ['shouldComponentUpdate'],
            ['componentWillUpdate'],
            ['render'],
          ]);
        });

        it('calls expected methods when unmounting', () => {
          const wrapper = shallow(<Foo />, options);
          expect(spy.args).to.deep.equal([
            ['componentWillMount'],
            ['render'],
          ]);
          spy.resetHistory();
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
            const { foo } = this.state;
            return <div>{foo}</div>;
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

    describe('malformed lifecycle options', () => {
      it('throws on invalid `enableComponentDidUpdateOnSetState` lifecycle config', () => {
        const adapter = getAdapter();
        const { lifecycles = {} } = adapter;
        const options = {
          enableComponentDidUpdateOnSetState: !!adapter.enableComponentDidUpdateOnSetState,
          lifecycles: {
            ...lifecycles,
            componentDidUpdate: {
              ...lifecycles.componentDidUpdate,
              onSetState: !adapter.enableComponentDidUpdateOnSetState,
            },
          },
        };
        expect(() => shallow(<div />, options)).to.throw(
          TypeError,
          'the legacy enableComponentDidUpdateOnSetState option should be matched by `lifecycles: { componentDidUpdate: { onSetState: true } }`, for compatibility',
        );
      });

      it('throws on invalid `supportPrevContextArgumentOfComponentDidUpdate` lifecycle config', () => {
        const adapter = getAdapter();
        const { lifecycles = {} } = adapter;
        const options = {
          supportPrevContextArgumentOfComponentDidUpdate: !!adapter.supportPrevContextArgumentOfComponentDidUpdate,
          lifecycles: {
            ...lifecycles,
            componentDidUpdate: {
              ...lifecycles.componentDidUpdate,
              prevContext: !adapter.supportPrevContextArgumentOfComponentDidUpdate,
            },
          },
        };
        expect(() => shallow(<div />, options)).to.throw(
          TypeError,
          'the legacy supportPrevContextArgumentOfComponentDidUpdate option should be matched by `lifecycles: { componentDidUpdate: { prevContext: true } }`, for compatibility',
        );
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
        /* eslint-disable react/destructuring-assignment */
        return (
          <div>
            {this.state && this.state.showSpan && <span className="show-me" />}
            <button type="button" className="async-btn" onClick={() => this.asyncSetState()} />
            <Child callback={() => this.callbackSetState()} />
          </div>
        );
        /* eslint-enable react/destructuring-assignment */
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
        const { onClick } = this.props;
        return <button type="button" onClick={onClick}>click</button>;
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
            count: this.state.count + 1, // eslint-disable-line react/destructuring-assignment
          });
        }

        render() {
          const { count } = this.state;
          return (
            <div>
              <Child onClick={() => this.onIncrement()} />
              <p>{count}</p>
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
        const { onClick } = this.props;
        return <button type="button" onClick={onClick}>click</button>;
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
                count: this.state.count + 1, // eslint-disable-line react/destructuring-assignment
              }, resolve);
            });
          }

          render() {
            const { count } = this.state;
            return (
              <div>
                <Child onClick={() => this.onIncrement()} />
                <p>{count}</p>
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
});
