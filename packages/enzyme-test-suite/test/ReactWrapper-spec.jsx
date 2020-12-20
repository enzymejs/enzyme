/* globals document */
import React from 'react';
import PropTypes from 'prop-types';
import { expect } from 'chai';
import sinon from 'sinon-sandbox';
import wrap from 'mocha-wrap';
import {
  mount,
  ReactWrapper,
} from 'enzyme';
import mountEntry from 'enzyme/mount';
import ReactWrapperEntry from 'enzyme/ReactWrapper';
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
  createRef,
  forwardRef,
  Fragment,
  lazy,
  memo,
  Profiler,
  Suspense,
} from './_helpers/react-compat';
import {
  describeWithDOM,
  describeIf,
  itIf,
} from './_helpers';
import getLoadedLazyComponent from './_helpers/getLoadedLazyComponent';
import describeMethods from './_helpers/describeMethods';
import describeLifecycles from './_helpers/describeLifecycles';
import describeHooks from './_helpers/describeHooks';
import {
  is,
} from './_helpers/version';

describeWithDOM('mount', () => {
  describe('top level entry points', () => {
    expect(mountEntry).to.equal(mount);
    expect(ReactWrapperEntry).to.equal(ReactWrapper);
  });

  describe('top level wrapper', () => {
    wrap()
      .withGlobal('document', () => null)
      .withGlobal('window', () => null)
      .it('throws without a global document and window', () => {
        expect(() => mount(<div />)).to.throw(
          Error,
          'It looks like you called `mount()` without a global document being loaded.',
        );

        expect(() => new ReactWrapper(<div />)).to.throw(
          Error,
          'It looks like you called `mount()` without a global document being loaded.',
        );
      });

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

      const wrapper = mount(<Foo bar />);

      expect(wrapper.type()).to.equal(Foo);
      expect(wrapper.props()).to.deep.equal({ bar: true });
      expect(wrapper.instance()).to.be.instanceOf(Foo);
      expect(wrapper.children().at(0).type()).to.equal(Box);
      expect(wrapper.find(Box).children().props().className).to.equal('box');
      expect(wrapper.find(Box).instance()).to.be.instanceOf(Box);
      expect(wrapper.find(Box).children().at(0).props().className).to.equal('box');
      expect(wrapper.find(Box).children().props().className).to.equal('box');
      expect(wrapper.children().type()).to.equal(Box);
      expect(wrapper.children().instance()).to.be.instanceOf(Box);
      expect(wrapper.children().props().bam).to.equal(true);
    });

    it('works with numeric literals', () => {
      const wrapper = mount(<div>{50}</div>);
      expect(wrapper.debug()).to.equal(`<div>
  50
</div>`);
    });

    describeWithDOM('refs', () => {
      it('calls ref', () => {
        const spy = sinon.spy();
        mount(<div ref={spy} />);
        expect(spy).to.have.property('callCount', 1);
      });

      /* global HTMLElement */

      itIf(is('> 0.13'), 'passes an HTML element to `ref` when root rendered', () => {
        const spy = sinon.spy();
        mount(<div ref={spy} />);
        expect(spy).to.have.property('callCount', 1);

        // sanity check
        expect(document.createElement('div')).to.be.instanceOf(HTMLElement);

        const [[firstArg]] = spy.args;
        expect(firstArg).to.be.instanceOf(HTMLElement);
      });

      itIf(is('> 0.13'), 'passes an HTML element to `ref` when sub-rendered', () => {
        const spy = sinon.spy();
        class Foo extends React.Component {
          render() {
            return <div ref={spy} />;
          }
        }
        mount(<Foo />);
        expect(spy).to.have.property('callCount', 1);

        // sanity check
        expect(document.createElement('div')).to.be.instanceOf(HTMLElement);

        const [[firstArg]] = spy.args;
        expect(firstArg).to.be.instanceOf(HTMLElement);
      });
    });

    describe('wrapping invalid elements', () => {
      it('throws with combined dangerouslySetInnerHTML and children on host nodes', () => {
        /* eslint react/no-danger-with-children: 0 */
        expect(() => mount((
          <div dangerouslySetInnerHTML={{ __html: '{}' }}>child</div>
        ))).to.throw(Error, 'Can only set one of `children` or `props.dangerouslySetInnerHTML`.');
      });

      itIf(is('>= 16'), 'throws when mounting Portals', () => {
        const portal = createPortal(
          <div />,
          { nodeType: 1 },
        );

        expect(() => mount(portal)).to.throw(
          Error,
          'ReactWrapper can only wrap valid elements',
        );
      });

      it('throws when mounting plain text', () => {
        expect(() => mount('Foo')).to.throw(
          Error,
          'ReactWrapper can only wrap valid elements',
        );
      });

      it('throws when mounting multiple elements', () => {
        expect(() => mount([<div />])).to.throw(
          TypeError,
          'ReactWrapper can only wrap valid elements',
        );
      });
    });

    it('mounts built in components', () => {
      expect(() => mount(<div />)).not.to.throw();
    });

    it('mounts composite components', () => {
      class Foo extends React.Component {
        render() {
          return <div />;
        }
      }

      expect(() => mount(<Foo />)).not.to.throw();
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

      const wrapper = mount(<Foo />);
      expect(wrapper.state()).to.equal(null);
      expect(wrapper.debug()).to.equal(`
<Foo>
  <div>
    object
    null
  </div>
</Foo>
      `.trim());
      expect(() => wrapper.state('key')).to.throw('ReactWrapper::state("key") requires that `state` not be `null` or `undefined`');
    });

    describeIf(is('>= 0.14'), 'wrappingComponent', () => {
      const realCreateMountRenderer = getAdapter().createMountRenderer;

      class More extends React.Component {
        render() {
          return null;
        }
      }

      class TestProvider extends React.Component {
        getChildContext() {
          const { value, renderMore } = this.props;

          return {
            testContext: value || 'Hello world!',
            renderMore: renderMore || false,
          };
        }

        render() {
          const { children } = this.props;

          return children;
        }
      }
      TestProvider.childContextTypes = {
        testContext: PropTypes.string,
        renderMore: PropTypes.bool,
      };

      class MyWrappingComponent extends React.Component {
        render() {
          const { children, contextValue, renderMore } = this.props;

          return (
            <div>
              <TestProvider value={contextValue} renderMore={renderMore}>{children}</TestProvider>
            </div>
          );
        }
      }

      class MyComponent extends React.Component {
        render() {
          const { testContext, renderMore } = this.context;

          return (
            <div>
              <div>Context says: {testContext}</div>
              {renderMore && <More />}
            </div>
          );
        }
      }
      MyComponent.contextTypes = TestProvider.childContextTypes;

      it('mounts the passed node as the root as per usual', () => {
        const wrapper = mount(<MyComponent />, {
          wrappingComponent: MyWrappingComponent,
        });
        expect(wrapper.type()).to.equal(MyComponent);
        expect(wrapper.parent().exists()).to.equal(false);
        expect(() => wrapper.setProps({ foo: 'bar' })).not.to.throw();
      });

      it('renders the root in the wrapping component', () => {
        const wrapper = mount(<MyComponent />, {
          wrappingComponent: MyWrappingComponent,
        });
        // Context will only be set properly if the root node is rendered as a descendent of the wrapping component.
        expect(wrapper.text()).to.equal('Context says: Hello world!');
      });

      it('supports mounting the wrapping component with initial props', () => {
        const wrapper = mount(<MyComponent />, {
          wrappingComponent: MyWrappingComponent,
          wrappingComponentProps: { contextValue: 'I can be set!' },
        });
        expect(wrapper.text()).to.equal('Context says: I can be set!');
      });

      describeIf(is('>= 16.3'), 'with createContext()', () => {
        let Context1;
        let Context2;

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

        beforeEach(() => {
          Context1 = createContext('default1');
          Context2 = createContext('default2');
        });

        it('renders', () => {
          const wrapper = mount(<Component />, {
            wrappingComponent: WrappingComponent,
            wrappingComponentProps: {
              value1: 'one',
              value2: 'two',
            },
          });

          expect(wrapper.text()).to.equal('Value 1: one; Value 2: two');
        });
      });

      it('throws an error if the wrappingComponent does not render its children', () => {
        class BadWrapper extends React.Component {
          render() {
            return <div />;
          }
        }
        expect(() => mount(<MyComponent />, {
          wrappingComponent: BadWrapper,
        })).to.throw('`wrappingComponent` must render its children!');
      });

      wrap()
        .withOverrides(() => getAdapter(), () => ({
          isCustomComponent: undefined,
          RootFinder: undefined,
          wrapWithWrappingComponent: undefined,
          createMountRenderer: (...args) => {
            const renderer = realCreateMountRenderer(...args);
            delete renderer.getWrappingComponentRenderer;
            renderer.getNode = () => null;
            return renderer;
          },
        }))
        .describe('with an old adapter', () => {
          it('renders fine when wrappingComponent is not passed', () => {
            const wrapper = mount(<MyComponent />);
            expect(wrapper.debug()).to.equal('');
          });

          it('throws an error if wrappingComponent is passed', () => {
            expect(() => mount(<MyComponent />, {
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

    itIf(is('<=0.13'), 'throws an error if wrappingComponent is passed', () => {
      expect(() => mount(<div />, {
        wrappingComponent: RendersChildren,
      })).to.throw('your adapter does not support `wrappingComponent`. Try upgrading it!');
    });

    describeIf(is('>= 16.3'), 'uses the isValidElementType from the Adapter to validate the prop type of Component', () => {
      const Foo = () => null;
      const Bar = () => null;
      wrap()
        .withConsoleThrows()
        .withOverride(() => getAdapter(), 'isValidElementType', () => (val) => val === Foo)
        .it('with isValidElementType defined on the Adapter', () => {
          expect(() => {
            mount(<Bar />);
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
      const wrapper = mount(<SimpleComponent />, { context });
      expect(wrapper.text()).to.equal('foo');
    });

    it('can pass context to the child of mounted component', () => {
      const SimpleComponent = createClass({
        contextTypes: {
          name: PropTypes.string,
        },
        render() {
          const { name } = this.context;
          return <div>{name}</div>;
        },
      });
      const ComplexComponent = createClass({
        render() {
          return <div><SimpleComponent /></div>;
        },
      });

      const childContextTypes = {
        name: PropTypes.string.isRequired,
      };
      const context = { name: 'foo' };
      const wrapper = mount(<ComplexComponent />, { context, childContextTypes });
      expect(wrapper.find(SimpleComponent)).to.have.lengthOf(1);
    });

    describe('does not attempt to mutate Component.childContextTypes', () => {
      const SimpleComponent = createClass({
        displayName: 'Simple',
        render() {
          return <div />;
        },
      });

      class ClassComponent extends React.Component {
        render() {
          const { a } = this.context;
          return (
            <div>
              {a}
              <SimpleComponent />
            </div>
          );
        }
      }
      ClassComponent.contextTypes = Object.freeze({ a: PropTypes.string });

      const CreateClassComponent = createClass({
        contextTypes: ClassComponent.contextTypes,
        render: ClassComponent.prototype.render,
      });

      it('works without options', () => {
        expect(() => mount(<ClassComponent />)).not.to.throw();
        expect(() => mount(<CreateClassComponent />)).not.to.throw();
      });

      it('works with a childContextTypes option', () => {
        const options = {
          childContextTypes: { b: PropTypes.string },
          context: { a: 'hello', b: 'world' },
        };
        expect(() => mount(<ClassComponent />, options)).not.to.throw();
        expect(() => mount(<CreateClassComponent />, options)).not.to.throw();
      });
    });

    it('does not throw if context is passed in but contextTypes is missing', () => {
      const SimpleComponent = createClass({
        render() {
          const { name } = this.context;
          return <div>{name}</div>;
        },
      });

      const context = { name: 'foo' };
      expect(() => mount(<SimpleComponent />, { context })).not.to.throw();
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
      const wrapper = mount(<SimpleComponent />, { context });

      expect(wrapper.context().name).to.equal(context.name);
      expect(wrapper.context('name')).to.equal(context.name);
    });

    describeIf(is('>= 16.3'), 'createContext()', () => {
      let Context;

      beforeEach(() => {
        Context = createContext('hello');
      });

      it('finds elements through Context elements', () => {
        class Foo extends React.Component {
          render() {
            return (
              <Context.Consumer>{(value) => <span>{value}</span>}</Context.Consumer>
            );
          }
        }

        const wrapper = mount(<Context.Provider value="foo"><div><Foo /></div></Context.Provider>);

        expect(wrapper.find('span').text()).to.equal('foo');
      });

      it('can render a <Provider /> as the root', () => {
        const wrapper = mount(
          <Context.Provider value="cool">
            <Context.Consumer>{(value) => <div>{value}</div>}</Context.Consumer>
          </Context.Provider>,
        );
        expect(wrapper.text()).to.equal('cool');

        wrapper.setProps({ value: 'test' });
        expect(wrapper.text()).to.equal('test');
      });

      it('can render a <Consumer /> as the root', () => {
        const wrapper = mount(
          <Context.Consumer>{(value) => <div>{value}</div>}</Context.Consumer>,
        );
        expect(wrapper.text()).to.equal('hello');

        wrapper.setProps({
          children: (value) => <div>Value is: {value}</div>,
        });
        expect(wrapper.text()).to.equal('Value is: hello');
      });
    });

    describeIf(is('>= 16.3'), 'forwarded ref Components', () => {
      wrap().withConsoleThrows().it('mounts without complaint', () => {
        const SomeComponent = forwardRef((props, ref) => (
          <div {...props} ref={ref} />
        ));

        expect(() => mount(<SomeComponent />)).not.to.throw();
      });

      it('finds elements through forwardedRef elements', () => {
        const testRef = () => {};
        const SomeComponent = forwardRef((props, ref) => (
          <div ref={ref}>
            <span className="child1" />
            <span className="child2" />
          </div>
        ));

        const wrapper = mount(<div><SomeComponent ref={testRef} /></div>);

        expect(wrapper.find('.child2')).to.have.lengthOf(1);
      });

      it('finds forwardRef element', () => {
        const SomeComponent = forwardRef((props, ref) => (
          <div ref={ref}>
            <span className="child1" />
          </div>
        ));
        const Parent = () => <span><SomeComponent foo="hello" /></span>;

        const wrapper = mount(<Parent foo="hello" />);
        const results = wrapper.find(SomeComponent);

        expect(results).to.have.lengthOf(1);
        expect(results.props()).to.eql({ foo: 'hello' });
      });

      it('actually passes the ref', () => {
        class A extends React.PureComponent {
          render() {
            return <div>FOO</div>;
          }
        }

        class B extends React.PureComponent {
          render() {
            const { forwardedRef } = this.props;
            return <A ref={forwardedRef} />;
          }
        }

        const BForwarded = forwardRef((props, ref) => (
          <B {...props} forwardedRef={ref} />
        ));

        const ref = createRef();
        mount(<BForwarded ref={ref} />);
        expect(ref.current).to.be.an.instanceOf(A);
      });
    });

    describeIf(is('> 0.13'), 'stateless function components (SFCs)', () => {
      it('can pass in context', () => {
        const SimpleComponent = (props, { name }) => (
          <div>{name}</div>
        );
        SimpleComponent.contextTypes = { name: PropTypes.string };

        const context = { name: 'foo' };
        const wrapper = mount(<SimpleComponent />, { context });
        expect(wrapper.text()).to.equal('foo');
      });

      it('can pass context to the child of mounted component', () => {
        const SimpleComponent = (props, { name }) => (
          <div>{name}</div>
        );
        SimpleComponent.contextTypes = { name: PropTypes.string };

        const ComplexComponent = () => (
          <div><SimpleComponent /></div>
        );

        const childContextTypes = {
          name: PropTypes.string.isRequired,
        };

        const context = { name: 'foo' };
        const wrapper = mount(<ComplexComponent />, { context, childContextTypes });
        expect(wrapper.find(SimpleComponent)).to.have.lengthOf(1);
      });

      it('does not throw if context is passed in but contextTypes is missing', () => {
        const SimpleComponent = (props, { name }) => (
          <div>{name}</div>
        );

        const context = { name: 'foo' };
        expect(() => mount(<SimpleComponent />, { context })).not.to.throw();
      });

      itIf(is('< 16'), 'is introspectable through context API', () => {
        const SimpleComponent = (props, { name }) => (
          <div>{name}</div>
        );
        SimpleComponent.contextTypes = { name: PropTypes.string };

        const context = { name: 'foo' };
        const wrapper = mount(<SimpleComponent />, { context });

        expect(wrapper.context().name).to.equal(context.name);
        expect(wrapper.context('name')).to.equal(context.name);
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
      const wrapper = mount(<Foo foo="qux" />);
      expect(wrapper.type()).to.equal(Foo);
      expect(wrapper.find('.bar')).to.have.lengthOf(1);
      expect(wrapper.find('.qoo').text()).to.equal('qux');
    });

    it('supports findDOMNode with SFCs', () => {
      const Foo = ({ foo }) => (
        <div>{foo}</div>
      );

      const wrapper = mount(<Foo foo="qux" />);
      expect(wrapper.text()).to.equal('qux');
    });

    it('works with nested stateless', () => {
      const TestItem = () => (
        <div className="item">1</div>
      );
      const Test = () => (
        <div className="box">
          <TestItem test="123" />
          <TestItem />
          <TestItem />
        </div>
      );
      const wrapper = mount(<Test />);
      const children = wrapper.find('.box').children();
      expect(children).to.have.lengthOf(3);
      expect(children.at(0).props().test).to.equal('123');
      expect(wrapper.find(TestItem)).to.have.lengthOf(3);
      expect(wrapper.find(TestItem).first().props().test).to.equal('123');
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

        const wrapper = mount(<Foo foo="qux" />);
        expect(wrapper.debug()).to.equal(`<Memo(InnerFoo) foo="qux">
  <div>
    <InnerComp>
      <div>
        <span>
          Hello
        </span>
      </div>
    </InnerComp>
    <div className="bar">
      bar
    </div>
    <div className="qoo">
      qux
    </div>
  </div>
</Memo(InnerFoo)>`);
        expect(wrapper.find('InnerComp')).to.have.lengthOf(1);
        expect(wrapper.find('.bar')).to.have.lengthOf(1);
        expect(wrapper.find('.qoo').text()).to.equal('qux');
      });

      it('works with a class component', () => {
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

        const wrapper = mount(<FooMemo foo="qux" />);
        expect(wrapper.debug()).to.equal(`<Foo foo="qux">
  <div>
    <InnerComp>
      <div>
        <span>
          Hello
        </span>
      </div>
    </InnerComp>
    <div className="bar">
      bar
    </div>
    <div className="qoo">
      qux
    </div>
  </div>
</Foo>`);
        expect(wrapper.find('InnerComp')).to.have.lengthOf(1);
        expect(wrapper.find('.bar')).to.have.lengthOf(1);
        expect(wrapper.find('.qoo').text()).to.equal('qux');
      });
    });
  });

  describeIf(is('>= 16'), 'portals', () => {
    it('shows portals in mount debug tree', () => {
      const containerDiv = global.document.createElement('div');
      const Foo = () => (
        <div>
          {createPortal(
            <div className="in-portal">InPortal</div>,
            containerDiv,
          )}
        </div>
      );

      const wrapper = mount(<Foo />);
      expect(wrapper.debug()).to.equal(`<Foo>
  <div>
    <Portal containerInfo={{...}}>
      <div className="in-portal">
        InPortal
      </div>
    </Portal>
  </div>
</Foo>`);
    });

    it('shows portal container in debug tree', () => {
      const containerDiv = global.document.createElement('div');
      containerDiv.setAttribute('data-foo', 'bar');
      const Foo = () => (
        <div className="foo">
          {createPortal(
            <div className="in-portal">InPortal</div>,
            containerDiv,
          )}
        </div>
      );

      const wrapper = mount(<Foo />);
      expect(wrapper.debug({ verbose: true })).to.equal(`<Foo>
  <div className="foo">
    <Portal containerInfo={<div data-foo="bar">...</div>}>
      <div className="in-portal">
        InPortal
      </div>
    </Portal>
  </div>
</Foo>`);
    });

    it('shows nested portal children in debug tree', () => {
      const Bar = () => null;

      const containerDiv = global.document.createElement('div');
      const Foo = () => (
        <div className="foo">
          {createPortal(
            <div className="in-portal">
              <div className="nested-in-portal">
                <Bar />
              </div>
            </div>,
            containerDiv,
          )}
        </div>
      );

      const wrapper = mount(<Foo />);
      expect(wrapper.debug()).to.equal(`<Foo>
  <div className="foo">
    <Portal containerInfo={{...}}>
      <div className="in-portal">
        <div className="nested-in-portal">
          <Bar />
        </div>
      </div>
    </Portal>
  </div>
</Foo>`);
    });

    it('has top level portals in debug tree', () => {
      const containerDiv = global.document.createElement('div');
      const Foo = () => createPortal(
        <div className="in-portal">InPortal</div>,
        containerDiv,
      );

      const wrapper = mount(<Foo />);
      expect(wrapper.debug()).to.equal(`<Foo>
  <Portal containerInfo={{...}}>
    <div className="in-portal">
      InPortal
    </div>
  </Portal>
</Foo>`);
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
        expect(() => mount(<SomeComponent />)).not.to.throw();
      });

    it('renders', () => {
      const wrapper = mount(<SomeComponent />);
      expect(wrapper.debug()).to.equal(`<SomeComponent>
  <Profiler id="SomeComponent" onRender={[Function: onRender]}>
    <main>
      <div className="child" />
    </main>
  </Profiler>
</SomeComponent>`);
    });

    it('finds elements through Profiler elements', () => {
      const wrapper = mount(<SomeComponent />);

      expect(wrapper.find('.child')).to.have.lengthOf(1);
    });

    it('finds Profiler element', () => {
      const Parent = () => <span><SomeComponent foo="hello" /></span>;

      const wrapper = mount(<Parent foo="hello" />);
      const results = wrapper.find(SomeComponent);

      expect(results).to.have.lengthOf(1);
      expect(results.type()).to.equal(SomeComponent);
      expect(results.props()).to.eql({ foo: 'hello' });
    });

    it('can find Profiler by id', () => {
      const wrapper = mount(<SomeComponent />);
      expect(wrapper.find('[id="SomeComponent"]').exists()).to.equal(true);
    });

    it('can find Profiler by display name', () => {
      const wrapper = mount(<SomeComponent />);
      const profiler = wrapper.find('Profiler');
      expect(profiler).to.have.lengthOf(1);
      expect(profiler.type()).to.equal(Profiler);
    });

    it('recognizes render phases', () => {
      const handleRender = sinon.spy();
      function AnotherComponent() {
        return (
          <Profiler id="AnotherComponent" onRender={handleRender}>
            <div />
          </Profiler>
        );
      }

      const wrapper = mount(<AnotherComponent />);
      expect(handleRender).to.have.property('callCount', 1);
      expect(handleRender.args[0][1]).to.equal('mount');

      wrapper.setProps({ unusedProp: true });
      expect(handleRender).to.have.property('callCount', 2);
      expect(handleRender.args[1][1]).to.equal('update');
    });

    it('measures timings', () => {
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

      const wrapper = mount(<AnotherComponent />);
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

  itIf(is('>= 16.2'), 'supports fragments', () => {
    const wrapper = mount((
      <Fragment>
        <p>hello</p>
        <span>boo</span>
      </Fragment>
    ));

    expect(wrapper).to.have.lengthOf(2);
  });

  const Wrap = mount;
  const Wrapper = ReactWrapper;
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
        <Suspense fallback={Fallback}>
          <Component />
        </Suspense>
      );

      const wrapper = mount(<SuspenseComponent />);

      expect(wrapper.is(SuspenseComponent)).to.equal(true);
      expect(wrapper.find(Component)).to.have.lengthOf(1);
      expect(wrapper.find(Fallback)).to.have.lengthOf(0);
    });

    it('works with Suspense with multiple children', () => {
      const SuspenseComponent = () => (
        <Suspense fallback={<Fallback />}>
          <div />
          <span />
          <main />
        </Suspense>
      );

      const wrapper = mount(<SuspenseComponent />);
      expect(wrapper.debug()).to.equal(`<SuspenseComponent>
  <Suspense fallback={{...}}>
    <div />
    <span />
    <main />
  </Suspense>
</SuspenseComponent>`);
    });

    it('throws with Suspense with multiple children if options.suspenseFallback=false', () => {
      const SuspenseComponent = () => (
        <Suspense fallback={<Fallback />}>
          <div />
          <div />
        </Suspense>
      );
      expect(() => mount(<SuspenseComponent />, { suspenseFallback: false })).to.throw();
    });

    it('can mount Suspense directly', () => {
      const wrapper = mount(<Suspense fallback={Fallback} />);
      expect(wrapper.is(Suspense)).to.equal(true);
    });

    it('finds fallback when given lazy component in initial mount', () => {
      const LazyComponent = lazy(() => fakeDynamicImport(DynamicComponent));
      const SuspenseComponent = () => (
        <Suspense fallback={<Fallback />}>
          <LazyComponent />
        </Suspense>
      );

      const wrapper = mount(<SuspenseComponent />);

      expect(wrapper.is(SuspenseComponent)).to.equal(true);
      expect(wrapper.find(LazyComponent)).to.have.lengthOf(0);
      expect(wrapper.find(Fallback)).to.have.lengthOf(1);
    });

    it('return fallback string when given lazy component in initial mount and call .debug()', () => {
      const LazyComponent = lazy(() => fakeDynamicImport(DynamicComponent));
      const SuspenseComponent = () => (
        <Suspense fallback={<Fallback />}>
          <LazyComponent />
        </Suspense>
      );

      const wrapper = mount(<SuspenseComponent />);

      expect(wrapper.debug()).to.equal(`<SuspenseComponent>
  <Suspense fallback={{...}}>
    <Fallback>
      <div>
        Fallback
      </div>
    </Fallback>
  </Suspense>
</SuspenseComponent>`);
    });

    it('return wrapped component when given loaded lazy component in initial mount', () => {
      const LazyComponent = getLoadedLazyComponent(DynamicComponent);
      const SuspenseComponent = () => (
        <Suspense fallback={<Fallback />}>
          <LazyComponent />
        </Suspense>
      );

      const wrapper = mount(<SuspenseComponent />);

      expect(wrapper.is(SuspenseComponent)).to.equal(true);
      expect(wrapper.find(LazyComponent)).to.have.lengthOf(0);
      expect(wrapper.find(DynamicComponent)).to.have.lengthOf(1);
      expect(wrapper.find(Fallback)).to.have.lengthOf(0);
    });

    it('return wrapped component string when given loaded lazy component in initial mount and call .debug()', () => {
      const LazyComponent = getLoadedLazyComponent(DynamicComponent);
      const SuspenseComponent = () => (
        <Suspense fallback={<Fallback />}>
          <LazyComponent />
        </Suspense>
      );

      const wrapper = mount(<SuspenseComponent />);

      expect(wrapper.debug()).to.equal(`<SuspenseComponent>
  <Suspense fallback={{...}}>
    <DynamicComponent>
      <div>
        Dynamic Component
      </div>
    </DynamicComponent>
  </Suspense>
</SuspenseComponent>`);
    });

    it('throws if options.suspenseFallback is specified', () => {
      const LazyComponent = lazy(fakeDynamicImport(DynamicComponent));
      const SuspenseComponent = () => (
        <Suspense fallback={<Fallback />}>
          <LazyComponent />
        </Suspense>
      );
      expect(() => mount(<SuspenseComponent />, { suspenseFallback: false })).to.throw();
    });
  });

  describe('.mount()', () => {
    it('calls componentWillUnmount()', () => {
      const willMount = sinon.spy();
      const didMount = sinon.spy();
      const willUnmount = sinon.spy();

      class Foo extends React.Component {
        constructor(props) {
          super(props);
          this.componentWillUnmount = willUnmount;
          this.componentWillMount = willMount;
          this.componentDidMount = didMount;
        }

        render() {
          const { id } = this.props;
          return (
            <div className={id}>
              {id}
            </div>
          );
        }
      }
      const wrapper = mount(<Foo id="foo" />);
      expect(willMount).to.have.property('callCount', 1);
      expect(didMount).to.have.property('callCount', 1);
      expect(willUnmount).to.have.property('callCount', 0);
      wrapper.unmount();
      expect(willMount).to.have.property('callCount', 1);
      expect(didMount).to.have.property('callCount', 1);
      expect(willUnmount).to.have.property('callCount', 1);
      wrapper.mount();
      expect(willMount).to.have.property('callCount', 2);
      expect(didMount).to.have.property('callCount', 2);
      expect(willUnmount).to.have.property('callCount', 1);
    });

    it('throws on non-root', () => {
      class Foo extends React.Component {
        render() {
          return <div />;
        }
      }
      const wrapper = mount(<Foo />);
      const child = wrapper.find('div');
      expect(() => child.mount()).to.throw(Error);
    });
  });

  describe('.getDOMNode()', () => {
    class Test extends React.Component {
      render() {
        return (
          <div className="outer">
            <div className="inner">
              <span />
              <span />
            </div>
          </div>
        );
      }
    }
    class TestZero extends React.Component {
      render() {
        return <div />;
      }
    }

    it('returns the outermost DOMComponent of the root wrapper', () => {
      const wrapper = mount(<Test />);
      expect(wrapper.getDOMNode()).to.have.property('className', 'outer');
    });

    it('returns the outermost DOMComponent of the inner div wrapper', () => {
      const wrapper = mount(<Test />);
      expect(wrapper.find('.inner').getDOMNode()).to.have.property('className', 'inner');
    });

    it('throws when wrapping multiple elements', () => {
      const wrapper = mount(<Test />).find('span');
      expect(() => wrapper.getDOMNode()).to.throw(
        Error,
        'Method “getDOMNode” is meant to be run on 1 node. 2 found instead.',
      );
    });

    it('throws when wrapping zero elements', () => {
      const wrapper = mount(<TestZero />).find('span');
      expect(() => wrapper.getDOMNode()).to.throw(
        Error,
        'Method “getDOMNode” is meant to be run on 1 node. 0 found instead.',
      );
    });

    it('throws when wrapping zero elements', () => {
      const wrapper = mount(<TestZero />).find('span');
      expect(() => wrapper.getDOMNode()).to.throw(
        Error,
        'Method “getDOMNode” is meant to be run on 1 node. 0 found instead.',
      );
    });

    describeIf(is('> 0.13'), 'stateless function components (SFCs)', () => {
      const SFC = () => (
        <div className="outer">
          <div className="inner">
            <span />
            <span />
          </div>
        </div>
      );

      it('returns the outermost DOMComponent of the root wrapper', () => {
        const wrapper = mount(<SFC />);
        expect(wrapper.getDOMNode()).to.have.property('className', 'outer');
      });

      it('returns the outermost DOMComponent of the inner div wrapper', () => {
        const wrapper = mount(<SFC />);
        expect(wrapper.find('.inner').getDOMNode()).to.have.property('className', 'inner');
      });

      it('throws when wrapping multiple elements', () => {
        const wrapper = mount(<SFC />).find('span');
        expect(() => wrapper.getDOMNode()).to.throw(
          Error,
          'Method “getDOMNode” is meant to be run on 1 node. 2 found instead.',
        );
      });
    });

    it('lets you read the value of an input', () => {
      const wrapper = mount(<div><input value="0" /></div>);
      const inputNode = wrapper.find('input').getDOMNode();
      expect(inputNode.value).to.equal('0');
    });
  });

  describe('.ref(refName)', () => {
    class WithoutRef extends React.Component {
      render() { return <div />; }
    }

    class WithRef extends React.Component {
      render() { return <div ref="r" />; }
    }

    class RendersWithRef extends React.Component {
      render() { return <WithRef />; }
    }

    it('throws when called on not the root', () => {
      const wrapper = mount(<RendersWithRef />);
      const found = wrapper.find(WithRef);
      expect(found).to.have.lengthOf(1);
      expect(() => found.ref('ref')).to.throw(
        Error,
        'ReactWrapper::ref(refname) can only be called on the root',
      );
    });

    it('unavailable ref should return undefined', () => {
      const wrapper = mount(<WithoutRef />);
      const ref = wrapper.ref('not-a-ref');

      expect(ref).to.equal(undefined);
    });

    it('gets a wrapper of the node matching the provided refName', () => {
      class Foo extends React.Component {
        render() {
          return (
            <div>
              <span ref="firstRef" data-amount={2}>First</span>
              <span ref="secondRef" data-amount={4}>Second</span>
              <span ref="thirdRef" data-amount={8}>Third</span>
            </div>
          );
        }
      }
      const wrapper = mount(<Foo />);
      // React 13 and 14 return instances whereas 15+ returns actual DOM nodes. In this case,
      // the public API of enzyme is to just return what `this.refs[refName]` would be expected
      // to return for the version of react you're using.
      if (is('< 15')) {
        expect(wrapper.ref('secondRef').getDOMNode().getAttribute('data-amount')).to.equal('4');
        expect(wrapper.ref('secondRef').getDOMNode().textContent).to.equal('Second');
      } else {
        expect(wrapper.ref('secondRef').getAttribute('data-amount')).to.equal('4');
        expect(wrapper.ref('secondRef').textContent).to.equal('Second');
      }
    });
  });

  describe('.detach', () => {
    class Comp extends React.Component {
      render() {
        return <div><span>hi</span></div>;
      }
    }
    it('throws on non-root', () => {
      const div = global.document.createElement('div');
      global.document.body.appendChild(div);

      const wrapper = mount(<Comp />, { attachTo: div });
      const span = wrapper.find('span');
      expect(span).to.have.lengthOf(1);
      expect(() => span.detach()).to.throw(
        Error,
        'ReactWrapper::detach() can only be called on the root',
      );
    });

    it('throws without the attachTo option', () => {
      const wrapper = mount(<Comp />);
      expect(() => wrapper.detach()).to.throw(
        Error,
        'ReactWrapper::detach() can only be called on when the `attachTo` option was passed into `mount()`.',
      );
    });
  });

  describe('attachTo option', () => {
    it('attaches and stuff', () => {
      class Foo extends React.Component {
        render() {
          return (<div className="in-foo" />);
        }
      }
      const div = global.document.createElement('div');

      const initialBodyChildren = document.body.childNodes.length;
      global.document.body.appendChild(div);

      expect(document.body.childNodes).to.have.lengthOf(initialBodyChildren + 1);
      expect(div.childNodes).to.have.lengthOf(0);

      const wrapper = mount(<Foo />, { attachTo: div });

      expect(wrapper.find('.in-foo')).to.have.lengthOf(1);
      expect(document.body.childNodes).to.have.lengthOf(initialBodyChildren + 1);
      expect(div.childNodes).to.have.lengthOf(1);

      wrapper.detach();

      expect(document.body.childNodes).to.have.lengthOf(initialBodyChildren + 1);
      expect(div.childNodes).to.have.lengthOf(0);

      global.document.body.removeChild(div);

      expect(document.body.childNodes).to.have.lengthOf(initialBodyChildren);
      expect(div.childNodes).to.have.lengthOf(0);
    });

    it('allows for multiple attaches/detaches on same node', () => {
      class Foo extends React.Component {
        render() {
          return (<div className="in-foo" />);
        }
      }
      class Bar extends React.Component {
        render() {
          return (<section className="in-bar" />);
        }
      }
      let wrapper;
      const div = global.document.createElement('div');

      const initialBodyChildren = document.body.childNodes.length;
      global.document.body.appendChild(div);

      expect(document.body.childNodes).to.have.lengthOf(initialBodyChildren + 1);
      expect(div.childNodes).to.have.lengthOf(0);

      wrapper = mount(<Foo />, { attachTo: div });

      expect(wrapper.find('.in-foo')).to.have.lengthOf(1);
      expect(document.body.childNodes).to.have.lengthOf(initialBodyChildren + 1);
      expect(div.childNodes).to.have.lengthOf(1);

      wrapper.detach();

      wrapper = mount(<Bar />, { attachTo: div });

      expect(wrapper.find('.in-bar')).to.have.lengthOf(1);
      expect(document.body.childNodes).to.have.lengthOf(initialBodyChildren + 1);
      expect(div.childNodes).to.have.lengthOf(1);

      wrapper.detach();

      expect(document.body.childNodes).to.have.lengthOf(initialBodyChildren + 1);
      expect(div.childNodes).to.have.lengthOf(0);

      global.document.body.removeChild(div);

      expect(document.body.childNodes).to.have.lengthOf(initialBodyChildren);
      expect(div.childNodes).to.have.lengthOf(0);
    });

    it('will attach to the body successfully', () => {
      class Bar extends React.Component {
        render() {
          return (<section className="in-bar" />);
        }
      }
      const wrapper = mount(<Bar />, { attachTo: document.body });

      expect(wrapper.find('.in-bar')).to.have.lengthOf(1);
      expect(document.body.childNodes).to.have.lengthOf(1);

      wrapper.detach();

      expect(document.body.childNodes).to.have.lengthOf(0);
    });

    describeIf(is('> 0.13'), 'stateless function components (SFCs)', () => {
      it('attaches and stuff', () => {
        const Foo = () => <div className="in-foo" />;

        const div = global.document.createElement('div');
        const initialBodyChildren = document.body.childNodes.length;
        global.document.body.appendChild(div);

        expect(document.body.childNodes).to.have.lengthOf(initialBodyChildren + 1);
        expect(div.childNodes).to.have.lengthOf(0);

        const wrapper = mount(<Foo />, { attachTo: div });

        expect(wrapper.find('.in-foo')).to.have.lengthOf(1);
        expect(document.body.childNodes).to.have.lengthOf(initialBodyChildren + 1);
        expect(div.childNodes).to.have.lengthOf(1);

        wrapper.detach();

        expect(document.body.childNodes).to.have.lengthOf(initialBodyChildren + 1);
        expect(div.childNodes).to.have.lengthOf(0);

        global.document.body.removeChild(div);

        expect(document.body.childNodes).to.have.lengthOf(initialBodyChildren);
        expect(div.childNodes).to.have.lengthOf(0);
      });

      it('allows for multiple attaches/detaches on same node', () => {
        const Foo = () => <div className="in-foo" />;
        const Bar = () => <div className="in-bar" />;

        let wrapper;
        const div = global.document.createElement('div');
        const initialBodyChildren = document.body.childNodes.length;
        global.document.body.appendChild(div);

        expect(document.body.childNodes).to.have.lengthOf(initialBodyChildren + 1);
        expect(div.childNodes).to.have.lengthOf(0);

        wrapper = mount(<Foo />, { attachTo: div });

        expect(wrapper.find('.in-foo')).to.have.lengthOf(1);
        expect(document.body.childNodes).to.have.lengthOf(initialBodyChildren + 1);
        expect(div.childNodes).to.have.lengthOf(1);

        wrapper.detach();

        wrapper = mount(<Bar />, { attachTo: div });

        expect(wrapper.find('.in-bar')).to.have.lengthOf(1);
        expect(document.body.childNodes).to.have.lengthOf(initialBodyChildren + 1);
        expect(div.childNodes).to.have.lengthOf(1);

        wrapper.detach();

        expect(document.body.childNodes).to.have.lengthOf(initialBodyChildren + 1);
        expect(div.childNodes).to.have.lengthOf(0);

        global.document.body.removeChild(div);

        expect(document.body.childNodes).to.have.lengthOf(initialBodyChildren + 0);
        expect(div.childNodes).to.have.lengthOf(0);
      });

      it('will attach to the body successfully', () => {
        const Bar = () => <div className="in-bar" />;

        const wrapper = mount(<Bar />, { attachTo: document.body });

        expect(wrapper.find('.in-bar')).to.have.lengthOf(1);
        expect(document.body.childNodes).to.have.lengthOf(1);

        wrapper.detach();

        expect(document.body.childNodes).to.have.lengthOf(0);
      });
    });
  });

  it('works with class components that return null', () => {
    class Foo extends React.Component {
      render() {
        return null;
      }
    }
    const wrapper = mount(<Foo />);
    expect(wrapper).to.have.lengthOf(1);
    expect(wrapper.type()).to.equal(Foo);
    expect(wrapper.html()).to.equal(null);
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
    const wrapper = mount(<Foo />);
    expect(wrapper).to.have.lengthOf(1);
    expect(wrapper.type()).to.equal(Foo);
    expect(wrapper.children()).to.have.lengthOf(2);
    expect(wrapper.find('div')).to.have.lengthOf(2);
  });

  itIf(is('>=15 || ^16.0.0-alpha'), 'works with SFCs that return null', () => {
    const Foo = () => null;

    const wrapper = mount(<Foo />);
    expect(wrapper).to.have.lengthOf(1);
    expect(wrapper.type()).to.equal(Foo);
    expect(wrapper.html()).to.equal(null);
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
      const wrapper = mount(<Test />);
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
      const wrapper = mount(<Test />);
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

    it('is able to get the latest state value', () => {
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
      const wrapper = mount(<App />);
      const p = wrapper.find('p');
      expect(wrapper.find('p').text()).to.equal('0');
      wrapper.find(Child).prop('onClick')();
      // TOOD: this is a difference between mount and shallow
      // this is 1, because the wrapper has updated
      expect(p.text()).to.equal('1');
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

    it('is able to get the latest state value', () => {
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
      const wrapper = mount(<App />);
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
      const wrapper = mount((
        <Foo>
          <span data-foo="1">1</span>
          <div data-bar="2">2</div>
        </Foo>
      ));

      const children = wrapper.childAt(0).children();
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
