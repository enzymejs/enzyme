/* globals document */
import React from 'react';
import PropTypes from 'prop-types';
import { expect } from 'chai';
import sinon from 'sinon';
import wrap from 'mocha-wrap';
import isEqual from 'lodash.isequal';
import getData from 'html-element-map/getData';
import {
  mount,
  render,
  ReactWrapper,
} from 'enzyme';
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
  PureComponent,
} from './_helpers/react-compat';
import {
  describeWithDOM,
  describeIf,
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

const getElementPropSelector = prop => x => x.props[prop];
const getWrapperPropSelector = prop => x => x.prop(prop);

// some React versions pass undefined as an argument of setState callback.
const CALLING_SETSTATE_CALLBACK_WITH_UNDEFINED = is('^15.5');

describeWithDOM('mount', () => {
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

    it('calls ref', () => {
      const spy = sinon.spy();
      mount(<div ref={spy} />);
      expect(spy).to.have.property('callCount', 1);
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

    describeIf(is('>= 16.3'), 'uses the isValidElementType from the Adapter to validate the prop type of Component', () => {
      const Foo = () => null;
      const Bar = () => null;
      wrap()
        .withConsoleThrows()
        .withOverride(() => getAdapter(), 'isValidElementType', () => val => val === Foo)
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

    itIf(is('>= 16.3'), 'finds elements through Context elements', () => {
      const { Provider, Consumer } = createContext('');

      class Foo extends React.Component {
        render() {
          return (
            <Consumer>{value => <span>{value}</span>}</Consumer>
          );
        }
      }

      const wrapper = mount(<Provider value="foo"><div><Foo /></div></Provider>);

      expect(wrapper.find('span').text()).to.equal('foo');
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
    });

    describeIf(is('> 0.13'), 'stateless function components (SFCs)', () => {
      it('can pass in context', () => {
        const SimpleComponent = (props, context) => (
          <div>{context.name}</div>
        );
        SimpleComponent.contextTypes = { name: PropTypes.string };

        const context = { name: 'foo' };
        const wrapper = mount(<SimpleComponent />, { context });
        expect(wrapper.text()).to.equal('foo');
      });

      it('can pass context to the child of mounted component', () => {
        const SimpleComponent = (props, context) => (
          <div>{context.name}</div>
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
        const SimpleComponent = (props, context) => (
          <div>{context.name}</div>
        );

        const context = { name: 'foo' };
        expect(() => mount(<SimpleComponent />, { context })).to.not.throw();
      });

      itIf(is('< 16'), 'is introspectable through context API', () => {
        const SimpleComponent = (props, context) => (
          <div>{context.name}</div>
        );
        SimpleComponent.contextTypes = { name: PropTypes.string };

        const context = { name: 'foo' };
        const wrapper = mount(<SimpleComponent />, { context });

        expect(wrapper.context().name).to.equal(context.name);
        expect(wrapper.context('name')).to.equal(context.name);
      });

      itIf(is('< 16'), 'works with SFCs', () => {
        const Foo = ({ foo }) => (
          <div>
            <div className="bar">bar</div>
            <div className="qoo">{foo}</div>
          </div>
        );

        Foo.contextTypes = {
          _: PropTypes.string,
        };

        const wrapper = mount(<Foo foo="qux" />, {
          context: {
            _: 'foo',
          },
        });
        expect(wrapper.context('_')).to.equal('foo');
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

  describe('.contains(node)', () => {
    it('allows matches on the root node', () => {
      const a = <div className="foo" />;
      const b = <div className="foo" />;
      const c = <div className="bar" />;
      expect(mount(a).contains(b)).to.equal(true);
      expect(mount(a).contains(c)).to.equal(false);
    });

    it('allows matches on a nested node', () => {
      const wrapper = mount((
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
      const wrapper = mount((
        <div>
          <Foo />
        </div>
      ));
      const b = <Foo />;
      expect(wrapper.contains(b)).to.equal(true);
    });

    it('does something with arrays of nodes', () => {
      const wrapper = mount((
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

    describeIf(is('> 0.13'), 'stateless function components (SFCs)', () => {
      it('matches composite components', () => {
        function Foo() {
          return <div />;
        }
        const wrapper = mount((
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
        const wrapper = mount((
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

      expect(mount(a).equals(b)).to.equal(true);
      expect(mount(a).equals(c)).to.equal(false);
    });

    it('does NOT allow matches on a nested node', () => {
      const wrapper = mount((
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
      const wrapper = mount((
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

      const wrapper = mount(<Foo />).children();
      expect(wrapper.equals(<Bar />)).to.equal(true);
      expect(wrapper.equals(<Foo />)).to.equal(false);
    });

    describeIf(is('> 0.13'), 'stateless function components (SFCs)', () => {
      it('matches composite SFCs', () => {
        const Foo = () => (
          <div />
        );

        const wrapper = mount((
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

        const wrapper = mount(<Foo />).children();
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
      const twoChildren = mount(<TwoChildren />).children();
      const twoChildrenOneArrayed = mount(<TwoChildrenOneArrayed />).children();

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
      const wrapper = mount((
        <div>
          <Foo className="foo" />
          <span className="foo" />
        </div>
      ));

      const foos = wrapper.find('.foo');
      expect(foos).to.have.lengthOf(3);

      const hostNodes = foos.hostNodes();
      expect(hostNodes).to.have.lengthOf(2);
      expect(hostNodes.filter('.foo')).to.have.lengthOf(2);

      expect(hostNodes.filter('div')).to.have.lengthOf(1);
      expect(hostNodes.filter('span')).to.have.lengthOf(1);
    });

    it('does NOT allow matches on a nested node', () => {
      const wrapper = mount((
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
      const wrapper = mount((
        <div>
          <Foo />
        </div>
      ));
      const b = <div><Foo /></div>;
      expect(wrapper.equals(b)).to.equal(true);
    });

    it.skip('does not expand `node` content', () => {
      class Bar extends React.Component {
        render() { return <div />; }
      }

      class Foo extends React.Component {
        render() { return <Bar />; }
      }

      expect(mount(<Foo />).equals(<Bar />)).to.equal(true);
      expect(mount(<Foo />).equals(<Foo />)).to.equal(false);
    });

    describeIf(is('> 0.13'), 'stateless function components (SFCs)', () => {
      it('matches composite SFCs', () => {
        const Foo = () => (
          <div />
        );

        const wrapper = mount((
          <div>
            <Foo />
          </div>
        ));
        const b = <div><Foo /></div>;
        expect(wrapper.equals(b)).to.equal(true);
      });

      it.skip('does not expand `node` content', () => {
        const Bar = () => (
          <div />
        );

        const Foo = () => (
          <Bar />
        );

        expect(mount(<Foo />).equals(<Bar />)).to.equal(true);
        expect(mount(<Foo />).equals(<Foo />)).to.equal(false);
      });
    });

    it.skip('flattens arrays of children to compare', () => {
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
      const twoChildren = mount(<TwoChildren />);
      const twoChildrenOneArrayed = mount(<TwoChildrenOneArrayed />);

      expect(twoChildren.equals(twoChildrenOneArrayed.getElement())).to.equal(true);
      expect(twoChildrenOneArrayed.equals(twoChildren.getElement())).to.equal(true);
    });
  });

  describe('.find(selector)', () => {
    it('finds an element based on a class name', () => {
      const wrapper = mount((
        <div>
          <input className="foo" />
        </div>
      ));
      expect(wrapper.find('.foo').type()).to.equal('input');
    });

    it('finds an SVG element based on a class name', () => {
      const wrapper = mount((
        <div>
          <svg className="foo" />
        </div>
      ));
      expect(wrapper.find('.foo').type()).to.equal('svg');
    });

    it('finds an element based on a tag name', () => {
      const wrapper = mount((
        <div>
          <input className="foo" />
        </div>
      ));
      expect(wrapper.find('input').props().className).to.equal('foo');
    });

    it('finds an element based on a tag name and class name', () => {
      const wrapper = mount((
        <div>
          <input className="foo" />
          <div className="foo" />
        </div>
      ));
      expect(wrapper.find('input.foo')).to.have.lengthOf(1);
    });

    it('works on non-single nodes', () => {
      const wrapper = mount((
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


    it('finds an element based on a tag name and id', () => {
      const wrapper = mount((
        <div>
          <input id="foo" />
        </div>
      ));
      expect(wrapper.find('input#foo')).to.have.lengthOf(1);
    });

    it('finds an element based on a tag name, id, and class name', () => {
      const wrapper = mount((
        <div>
          <input id="foo" className="bar" />
        </div>
      ));
      expect(wrapper.find('input#foo.bar')).to.have.lengthOf(1);
    });

    it('finds a component based on a constructor', () => {
      class Foo extends React.Component {
        render() { return <div />; }
      }
      const wrapper = mount((
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
        const wrapper = mount((
          <div>
            <Foo className="foo" />
          </div>
        ));

        expect(() => wrapper.find(Foo)).to.throw(
          TypeError,
          'Enzyme::Selector expects a string, object, or valid element type (Component Constructor)',
        );
      });

    it('finds a component based on a component displayName', () => {
      class Foo extends React.Component {
        render() { return <div />; }
      }
      const wrapper = mount((
        <div>
          <Foo className="foo" />
        </div>
      ));
      expect(wrapper.find('Foo').type()).to.equal(Foo);
    });

    describeIf(is('> 0.13'), 'stateless function components (SFCs)', () => {
      it('finds a stateless component based on a component displayName', () => {
        const Foo = () => <div />;
        const wrapper = mount((
          <div>
            <Foo className="foo" />
          </div>
        ));
        expect(wrapper.find('Foo').type()).to.equal(Foo);
      });

      it('finds a stateless component based on a component displayName if rendered by function', () => {
        const Foo = () => <div />;
        const renderStatelessComponent = () => <Foo className="foo" />;
        const wrapper = mount((
          <div>
            {renderStatelessComponent()}
          </div>
        ));
        expect(wrapper.find('Foo').type()).to.equal(Foo);
      });
    });

    it('finds component based on a react prop', () => {
      const wrapper = mount((
        <div>
          <span htmlFor="foo" />
          <div htmlFor="bar" />
        </div>
      ));

      expect(wrapper.find('[htmlFor="foo"]')).to.have.lengthOf(1);
      expect(wrapper.find('[htmlFor]')).to.have.lengthOf(2);
    });

    it('errors sensibly if any of the search props are undefined', () => {
      const wrapper = mount((
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
      const wrapper = mount((
        <div>
          <span htmlFor="foo" />
        </div>
      ));

      expect(wrapper.find('span[htmlFor="foo"]')).to.have.lengthOf(1);
      expect(wrapper.find('span[htmlFor]')).to.have.lengthOf(1);
    });

    it('works with an adjacent sibling selector', () => {
      const a = 'some';
      const b = 'text';
      const wrapper = mount((
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
      const wrapper = mount((
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

    it('supports data prop selectors', () => {
      const wrapper = mount((
        <div>
          <span data-foo="bar" />
          <span data-foo-123="bar2" />
          <span data-123-foo="bar3" />
          <span data-foo_bar="bar4" />
        </div>
      ));

      expect(wrapper.find('[data-foo="bar"]')).to.have.lengthOf(1);
      expect(wrapper.find('[data-foo]')).to.have.lengthOf(1);

      expect(wrapper.find('[data-foo-123]')).to.have.lengthOf(1);
      expect(wrapper.find('[data-foo-123="bar2"]')).to.have.lengthOf(1);

      expect(wrapper.find('[data-123-foo]')).to.have.lengthOf(1);
      expect(wrapper.find('[data-123-foo="bar3"]')).to.have.lengthOf(1);

      expect(wrapper.find('[data-foo_bar]')).to.have.lengthOf(1);
      expect(wrapper.find('[data-foo_bar="bar4"]')).to.have.lengthOf(1);
    });

    it('finds components with multiple matching props', () => {
      const onChange = () => ({});
      const wrapper = mount((
        <div>
          <span htmlFor="foo" onChange={onChange} preserveAspectRatio="xMaxYMax" />
        </div>
      ));

      expect(wrapper.find('span[htmlFor="foo"][onChange]')).to.have.lengthOf(1);
      expect(wrapper.find('span[htmlFor="foo"][preserveAspectRatio="xMaxYMax"]')).to.have.lengthOf(1);
    });

    it('does not find property when undefined', () => {
      const wrapper = mount((
        <div>
          <span data-foo={undefined} />
        </div>
      ));

      expect(wrapper.find('[data-foo]')).to.have.lengthOf(0);
    });

    it('supports boolean and numeric values for matching props', () => {
      const wrapper = mount((
        <div>
          <span value={1} />
          <a value={false} />
          <a value="false" />
          <span value="true" />
          <a value="1" />
          <a value="2" />
        </div>
      ));

      expect(wrapper.find('span[value=1]')).to.have.lengthOf(1);
      expect(wrapper.find('span[value=2]')).to.have.lengthOf(0);
      expect(wrapper.find('a[value=false]')).to.have.lengthOf(1);
      expect(wrapper.find('a[value=true]')).to.have.lengthOf(0);
    });

    it('does not find key or ref via property selector', () => {
      class Foo extends React.Component {
        render() {
          const arrayOfComponents = [<div key="1" />, <div key="2" />];

          return (
            <div>
              <div ref="foo" />
              {arrayOfComponents}
            </div>
          );
        }
      }

      const wrapper = mount(<Foo />);

      expect(wrapper.find('div[ref="foo"]')).to.have.lengthOf(0);
      expect(wrapper.find('div[key="1"]')).to.have.lengthOf(0);
      expect(wrapper.find('[ref]')).to.have.lengthOf(0);
      expect(wrapper.find('[key]')).to.have.lengthOf(0);
    });

    it('finds multiple elements based on a class name', () => {
      const wrapper = mount((
        <div>
          <input className="foo" />
          <button type="button" className="foo" />
        </div>
      ));
      expect(wrapper.find('.foo')).to.have.lengthOf(2);
    });

    it('finds multiple elements based on a tag name', () => {
      const wrapper = mount((
        <div>
          <input className="foo" />
          <input />
          <button type="button" />
        </div>
      ));
      expect(wrapper.find('input')).to.have.lengthOf(2);
      expect(wrapper.find('button')).to.have.lengthOf(1);
    });

    it('finds multiple elements based on a constructor', () => {
      const wrapper = mount((
        <div>
          <input className="foo" />
          <input />
          <button type="button" />
        </div>
      ));
      expect(wrapper.find('input')).to.have.lengthOf(2);
      expect(wrapper.find('button')).to.have.lengthOf(1);
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

    it('supports object property selectors', () => {
      const wrapper = mount((
        <div>
          <input data-test="ref" className="foo" type="text" />
          <input data-test="ref" type="text" />
          <button data-test="ref" data-prop={undefined} type="button" />
          <span data-test="ref" data-prop={null} />
          <div data-test="ref" data-prop={123} />
          <input data-test="ref" data-prop={false} />
          <a data-test="ref" data-prop />
        </div>
      ));
      expect(wrapper.find({ a: 1 })).to.have.lengthOf(0);
      expect(wrapper.find({ 'data-test': 'ref' })).to.have.lengthOf(7);
      expect(wrapper.find({ className: 'foo' })).to.have.lengthOf(1);
      expect(wrapper.find({ 'data-prop': null })).to.have.lengthOf(1);
      expect(wrapper.find({ 'data-prop': 123 })).to.have.lengthOf(1);
      expect(wrapper.find({ 'data-prop': false })).to.have.lengthOf(1);
      expect(wrapper.find({ 'data-prop': true })).to.have.lengthOf(1);
    });

    it('supports complex and nested object property selectors', () => {
      const testFunction = () => ({});
      const wrapper = mount((
        <div>
          <span data-more={[{ id: 1 }]} data-test="ref" data-prop onChange={testFunction} />
          <a data-more={[{ id: 1 }]} data-test="ref" />
          <div data-more={{ item: { id: 1 } }} data-test="ref" />
          <input data-more={{ height: 20 }} data-test="ref" />
        </div>
      ));
      expect(wrapper.find({ 'data-test': 'ref' })).to.have.lengthOf(4);
      expect(wrapper.find({ 'data-more': { a: 1 } })).to.have.lengthOf(0);
      expect(wrapper.find({ 'data-more': [{ id: 1 }] })).to.have.lengthOf(2);
      expect(wrapper.find({ 'data-more': { item: { id: 1 } } })).to.have.lengthOf(1);
      expect(wrapper.find({ 'data-more': { height: 20 } })).to.have.lengthOf(1);
      expect(wrapper.find({
        'data-more': [{ id: 1 }],
        'data-test': 'ref',
        'data-prop': true,
        onChange: testFunction,
      })).to.have.lengthOf(1);
    });

    it('throws when given empty object, null, or an array', () => {
      const wrapper = mount((
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

    it('querys attributes with spaces in their values', () => {
      const wrapper = mount((
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

    describeIf(is('> 0.13'), 'stateless function components', () => {
      it('finds a component based on a constructor', () => {
        const Foo = () => <div />;
        const wrapper = mount((
          <div>
            <Foo className="foo" />
          </div>
        ));
        expect(wrapper.find(Foo).type()).to.equal(Foo);
      });

      it('finds a component based on a component displayName', () => {
        const Foo = () => <div />;
        const wrapper = mount((
          <div>
            <Foo className="foo" />
          </div>
        ));
        expect(wrapper.find('Foo').type()).to.equal(Foo);
      });

      it('does not find key via property selector', () => {
        const Foo = () => {
          const arrayOfComponents = [<div key="1" />, <div key="2" />];
          return (
            <div>
              {arrayOfComponents}
            </div>
          );
        };

        const wrapper = mount(<Foo />);

        expect(wrapper.find('div[key="1"]')).to.have.lengthOf(0);
        expect(wrapper.find('[key]')).to.have.lengthOf(0);
      });
    });

    describe('works with attribute selectors containing #', () => {
      let wrapper;
      beforeEach(() => {
        wrapper = mount((
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
        const wrapper = mount(<Foo />);
        expect(wrapper.html()).to.contain('data-custom-tag="bookIcon"'); // sanity check
        const elements = wrapper.find('[data-custom-tag="bookIcon"]');
        expect(elements).to.have.lengthOf(2);
        expect(elements.filter('i')).to.have.lengthOf(2);
      });
    });

    describeIf(is('>= 16.2'), 'with fragments', () => {
      const NestedFragmentComponent = () => (
        <div className="container">
          <React.Fragment>
            <span>A span</span>
            <span>B span</span>
            <div>A div</div>
            <React.Fragment>
              <span>C span</span>
            </React.Fragment>
          </React.Fragment>
          <span>D span</span>
        </div>
      );

      it('finds descendant span inside React.Fragment', () => {
        const wrapper = mount(<NestedFragmentComponent />);
        expect(wrapper.find('.container span')).to.have.lengthOf(4);
      });

      it('does not find nonexistent p inside React.Fragment', () => {
        const wrapper = mount(<NestedFragmentComponent />);
        expect(wrapper.find('.container p')).to.have.lengthOf(0);
      });

      it('finds direct child span inside React.Fragment', () => {
        const wrapper = mount(<NestedFragmentComponent />);
        expect(wrapper.find('.container > span')).to.have.lengthOf(4);
      });

      it('handles adjacent sibling selector inside React.Fragment', () => {
        const wrapper = mount(<NestedFragmentComponent />);
        expect(wrapper.find('.container span + div')).to.have.lengthOf(1);
      });

      it('handles general sibling selector inside React.Fragment', () => {
        const wrapper = mount(<NestedFragmentComponent />);
        expect(wrapper.find('.container div ~ span')).to.have.lengthOf(2);
      });

      itIf(is('>= 16.4.1'), 'handles fragments with no content', () => {
        const EmptyFragmentComponent = () => (
          <div className="container">
            <React.Fragment>
              <React.Fragment />
            </React.Fragment>
          </div>
        );

        const wrapper = mount(<EmptyFragmentComponent />);

        expect(wrapper.find('.container > span')).to.have.lengthOf(0);
        expect(wrapper.find('.container span')).to.have.lengthOf(0);
        expect(wrapper.children()).to.have.lengthOf(1);
      });
    });

    itIf(is('>= 16'), 'finds portals by name', () => {
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

      expect(wrapper.find('Portal')).to.have.lengthOf(1);
    });

    itIf(is('>= 16'), 'finds elements through portals', () => {
      const containerDiv = global.document.createElement('div');
      class FooPortal extends React.Component {
        render() {
          return createPortal(
            this.props.children,
            containerDiv,
          );
        }
      }

      const wrapper = mount((
        <FooPortal>
          <h1>Successful Portal!</h1>
          <span />
        </FooPortal>
      ));

      expect(wrapper.find('h1')).to.have.lengthOf(1);

      expect(wrapper.find('span')).to.have.lengthOf(1);

      expect(containerDiv.querySelectorAll('h1')).to.have.lengthOf(1);
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

        const wrapper = mount(<Foo />);
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

        const wrapper = mount(<Foo />);
        expect(wrapper.find(Component)).to.have.lengthOf(2);
        expect(wrapper.find(Component.displayName)).to.have.lengthOf(2);
      });
    });

    // in React 0.13 and 0.14, these HTML tags get moved around by the DOM, and React fails
    // they're tested in `shallow`, and in React 15+, so we can skip them here.
    const tagsWithRenderError = new Set([
      'body',
      'frame',
      'frameset',
      'head',
      'html',
      'caption',
      'td',
      'th',
      'tr',
      'col',
      'colgroup',
      'tbody',
      'thead',
      'tfoot',
    ]);
    function hasRenderError(Tag) {
      return is('< 15') && tagsWithRenderError.has(Tag);
    }

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

        itIf(!hasRenderError(Tag), `${Tag}: found with \`${name}\``, () => {
          const wrapper = mount(<Foo />);

          const rendered = wrapper.childAt(0);
          expect(rendered.type()).to.equal(Tag);
          expect(rendered.is(Tag)).to.equal(true);
          expect(wrapper.find(Tag)).to.have.lengthOf(1);
        });
      });
    });
  });

  describe('.findWhere(predicate)', () => {
    it('returns all elements for a truthy test', () => {
      const wrapper = mount((
        <div>
          <input className="foo" />
          <input />
        </div>
      ));
      expect(wrapper.findWhere(() => true)).to.have.lengthOf(3);
    });

    it('returns no elements for a falsy test', () => {
      const wrapper = mount((
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

      const wrapper = mount(<EditableText />);

      const stub = sinon.stub();
      wrapper.findWhere(stub);
      const passedNodeLengths = stub.getCalls().map(({ args: [firstArg] }) => firstArg.length);
      expect(passedNodeLengths).to.eql([1, 1]);
    });

    it('calls the predicate with the wrapped node as the first argument', () => {
      const wrapper = mount((
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
      expect(spy.args[0][0]).to.be.instanceOf(ReactWrapper);
      expect(spy.args[1][0]).to.be.instanceOf(ReactWrapper);
      expect(spy.args[2][0]).to.be.instanceOf(ReactWrapper);
      expect(spy.args[3][0]).to.be.instanceOf(ReactWrapper);
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
      const wrapper = mount(<Foo selector={selector} />);
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
                <React.Fragment>
                  <span data-foo={this.props.selector} />
                  <i data-foo={this.props.selector} />
                  <React.Fragment>
                    <i data-foo={this.props.selector} />
                  </React.Fragment>
                </React.Fragment>
                <span data-foo={this.props.selector} />
              </div>
            );
          }
        }

        const selector = 'blah';
        const wrapper = mount(<FragmentFoo selector={selector} />);
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
      const wrapper = mount(<Foo selector={selector} />);
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
      const wrapper = mount(<Foo selector={selector} />);
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
      const wrapper = mount(<Foo data={content} />);
      // TODO: shallow has children, mount does not
      expect(wrapper.props()).to.deep.equal({ data: content });
      expect(wrapper.childAt(0).props()).to.deep.equal({ 'data-foo': content, children: 'Test Component' });
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
      const wrapper = mount(<Foo data={content} />);
      expect(wrapper.debug()).to.equal((
        `<Foo data="${content}">
  <div data-foo="${content}">
    Test Component
  </div>
</Foo>`
      ));
    });

    describeIf(is('> 0.13'), 'stateless functional components', () => {
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
        const wrapper = mount(<SFC selector={selector} />);
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
        const wrapper = mount(<SFC selector={selector} />);
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
        const wrapper = mount(<SFC data={content} />);
        expect(wrapper.props()).to.deep.equal({ data: content });
        expect(wrapper.childAt(0).props()).to.deep.equal({ 'data-foo': content, children: 'Test SFC' });
      });

      it('returns shallow rendered string when debug() is called', () => {
        const SFC = function SFC({ data }) {
          return (
            <div data-foo={data}>Test SFC</div>
          );
        };

        const content = 'blah';
        const wrapper = mount(<SFC data={content} />);
        expect(wrapper.debug()).to.equal((
          `<SFC data="${content}">
  <div data-foo="${content}">
    Test SFC
  </div>
</SFC>`
        ));
      });

      it('works with a nested SFC', () => {
        const Bar = realArrowFunction(<div>Hello</div>);
        class Foo extends React.Component {
          render() { return <Bar />; }
        }
        const wrapper = mount(<Foo />);
        expect(wrapper.text()).to.equal('Hello');
      });
    });

    it('does not pass in null or false nodes', () => {
      const wrapper = mount((
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
      const hasDOMNodes = passedNodes.map(n => [n.debug(), n.getDOMNode() && true]);
      const expected = [
        [wrapper.debug(), true], // root
        ['<div className="foo bar" />', true], // first div
        ['<div>\n  foo bar\n</div>', true], // second div
        ['foo bar', null], // second div's contents
      ];
      expect(hasDOMNodes).to.eql(expected);

      // the root, plus the 2 renderable children, plus the grandchild text
      expect(stub).to.have.property('callCount', 4);
    });

    it('does not pass in null or false nodes', () => {
      const wrapper = mount((
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
      const wrapper = mount((
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

      expect(wrapper.findWhere(node => node.type() === Portal)).to.have.lengthOf(1);
    });
  });

  describe('.setProps(newProps[, callback])', () => {
    it('throws on a non-function callback', () => {
      class Foo extends React.Component {
        render() {
          return null;
        }
      }
      const wrapper = mount(<Foo />);

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
      const wrapper = mount(<Foo id="foo" />);
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

        const wrapper = mount(<Foo id="foo" foo="bar" />);

        expect(wrapper.children().debug()).to.equal(`
<div className="foo">
  bar
</div>
        `.trim());
        expect(wrapper.children().props()).to.eql({
          className: 'foo',
          children: 'bar',
        });
        expect(wrapper.instance().props).to.eql({
          id: 'foo',
          foo: 'bar',
        });

        wrapper.setProps({ id: 'bar' });

        expect(wrapper.children().debug()).to.equal(`
<div className="bar">
  bar
</div>
        `.trim());
        expect(wrapper.children().props()).to.eql({
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
        const wrapper = mount(<Foo id="foo" foo="bar" />);

        expect(wrapper.children().debug()).to.equal(`
<div className="foo">
  bar
</div>
        `.trim());
        expect(wrapper.children().props()).to.eql({
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

        expect(wrapper.children().debug()).to.equal(`
<div className="bar">
  bar
</div>
        `.trim());
        expect(wrapper.children().props()).to.eql({
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
        const wrapper = mount(<Foo id="foo" foo="bar" />);

        expect(wrapper.children().debug()).to.equal(`
<div className="foo">
  bar
</div>
        `.trim());
        expect(wrapper.children().props()).to.eql({
          className: 'foo',
          children: 'bar',
        });
        expect(wrapper.instance().props).to.eql({
          id: 'foo',
          foo: 'bar',
        });

        wrapper.setProps({ id: 'foo' });

        expect(wrapper.children().debug()).to.equal(`
<div className="foo">
  bar
</div>
        `.trim());
        expect(wrapper.children().props()).to.eql({
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
      const wrapper = mount(<Foo id="foo" />, { context });

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

      const wrapper = mount(<Foo a="a" b="b" />);
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
      const wrapper = mount(<Foo x={5} />, { context });
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

      const wrapper = mount(<Foo className="original" />, { context });

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

      const wrapper = mount(<Trainwreck user={validUser} />);

      expect(() => wrapper.setProps({ user: { name: {} } })).not.to.throw();
      expect(() => wrapper.setProps({ user: {} })).to.throw(error);
    });

    itIf(!REACT16, 'calls the callback when setProps has completed', () => {
      class Foo extends React.Component {
        render() {
          return (
            <div className={this.props.id}>
              {this.props.id}
            </div>
          );
        }
      }
      const wrapper = mount(<Foo id="foo" />);
      expect(wrapper.find('.foo')).to.have.lengthOf(1);

      wrapper[sym('__renderer__')].batchedUpdates(() => {
        wrapper.setProps({ id: 'bar', foo: 'bla' }, () => {
          expect(wrapper.find('.bar')).to.have.lengthOf(1);
        });
        expect(wrapper.find('.bar')).to.have.lengthOf(0);
      });
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

      const wrapper = mount(<Foo a="a" b="b" />);

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

    describe('setProps should not call componentDidUpdate twice', () => {
      it('first test case', () => {
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
        const wrapper = mount(<Dummy />);
        expect(spy).to.have.property('callCount', 0);
        return new Promise((resolve) => {
          wrapper.setProps({ myProp: 'Prop Value' }, resolve);
        }).then(() => {
          expect(spy).to.have.property('callCount', 1);
        });
      });
    });

    describeIf(is('> 0.13'), 'stateless function components', () => {
      it('sets props for a component multiple times', () => {
        const Foo = props => (
          <div className={props.id}>
            {props.id}
          </div>
        );

        const wrapper = mount(<Foo id="foo" />);
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

        const wrapper = mount(<Foo a="a" b="b" />);
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
        const wrapper = mount(<Foo x={5} />, { context });
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

        const wrapper = mount(<Trainwreck user={validUser} />);

        expect(() => wrapper.setProps({ user: { name: {} } })).not.to.throw();
        expect(() => wrapper.setProps({ user: {} })).to.throw(error);
      });
    });
  });

  describe('.setContext(newContext)', () => {
    it('sets context for a component multiple times', () => {
      const SimpleComponent = createClass({
        contextTypes: {
          name: PropTypes.string,
        },
        render() {
          return <div>{this.context.name}</div>;
        },
      });

      const context = { name: 'foo' };
      const wrapper = mount(<SimpleComponent />, { context });
      expect(wrapper.text()).to.equal('foo');
      wrapper.setContext({ name: 'bar' });
      expect(wrapper.text()).to.equal('bar');
      wrapper.setContext({ name: 'baz' });
      expect(wrapper.text()).to.equal('baz');
    });

    it('throws if it is called when shallow didn’t include context', () => {
      const SimpleComponent = createClass({
        contextTypes: {
          name: PropTypes.string,
        },
        render() {
          return <div>{this.context.name}</div>;
        },
      });

      const wrapper = mount(<SimpleComponent />);
      expect(() => wrapper.setContext({ name: 'bar' })).to.throw(
        Error,
        'ShallowWrapper::setContext() can only be called on a wrapper that was originally passed a context option', // eslint-disable-line max-len
      );
    });

    describeIf(is('> 0.13'), 'stateless function components', () => {
      it('sets context for a component multiple times', () => {
        const SimpleComponent = (props, context) => (
          <div>{context.name}</div>
        );
        SimpleComponent.contextTypes = { name: PropTypes.string };

        const context = { name: 'foo' };
        const wrapper = mount(<SimpleComponent />, { context });
        expect(wrapper.text()).to.equal('foo');
        wrapper.setContext({ name: 'bar' });
        expect(wrapper.text()).to.equal('bar');
        wrapper.setContext({ name: 'baz' });
        expect(wrapper.text()).to.equal('baz');
      });

      it('throws if it is called when shallow didn’t include context', () => {
        const SimpleComponent = (props, context) => (
          <div>{context.name}</div>
        );
        SimpleComponent.contextTypes = { name: PropTypes.string };

        const wrapper = mount(<SimpleComponent />);
        expect(() => wrapper.setContext({ name: 'bar' })).to.throw(
          Error,
          'ShallowWrapper::setContext() can only be called on a wrapper that was originally passed a context option', // eslint-disable-line max-len
        );
      });
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
          return (
            <div className={this.props.id}>
              {this.props.id}
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
          this.setState(({ count }) => ({ count: count + 1 }));
        }

        render() {
          const { count } = this.state;
          return (
            <a
              className={`clicks-${count}`}
              onClick={this.incrementCount}
            >
              foo
            </a>
          );
        }
      }

      const wrapper = mount(<Foo />);

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

      const wrapper = mount(<Foo />);

      wrapper.simulate('click', { someSpecialData: 'foo' });
      expect(spy).to.have.property('callCount', 1);
      expect(spy.args[0][0]).to.have.property('someSpecialData', 'foo');
    });

    it('throws a descriptive error for invalid events', () => {
      const wrapper = mount(<div>foo</div>);
      expect(wrapper.simulate.bind(wrapper, 'invalidEvent'))
        .to.throw(TypeError, "ReactWrapper::simulate() event 'invalidEvent' does not exist");
    });

    describeIf(is('> 0.13'), 'stateless function component', () => {
      it('passes in event data', () => {
        const spy = sinon.spy();
        const Foo = () => (
          <a onClick={spy}>foo</a>
        );

        const wrapper = mount(<Foo />);

        wrapper.simulate('click', { someSpecialData: 'foo' });
        expect(spy).to.have.property('callCount', 1);
        expect(spy.args[0][0]).to.have.property('someSpecialData', 'foo');
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

        const wrapper = mount(<Foo />);

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

          const wrapper = mount(<Foo />);

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

          const wrapper = mount(<Foo />);

          wrapper.simulate('animationiteration');
          expect(spy).to.have.property('callCount', 1);
        });

        it('converts lowercase events to React camelcase in stateless components', () => {
          const spy = sinon.spy();
          const Foo = () => (
            <a onAnimationIteration={spy}>foo</a>
          );

          const wrapper = mount(<Foo />);

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

          const wrapper = mount(<Foo />);

          wrapper.simulate('gotpointercapture');
          expect(spy).to.have.property('callCount', 1);
        });

        it('converts lowercase events to React camelcase in stateless components', () => {
          const spy = sinon.spy();
          const Foo = () => (
            <a onGotPointerCapture={spy}>foo</a>
          );

          const wrapper = mount(<Foo />);

          wrapper.simulate('gotpointercapture');
          expect(spy).to.have.property('callCount', 1);
        });
      });
    });

    it('has batched updates', () => {
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

      const wrapper = mount(<Foo />);
      wrapper.simulate('click');
      expect(wrapper.text()).to.equal('1');
      expect(renderCount).to.equal(2);
    });

    it('chains', () => {
      const wrapper = mount(<div />);
      expect(wrapper.simulate('click')).to.equal(wrapper);
    });

    describe('works with .parent()/.parents()/.closest()', () => {
      function getWrapper() {
        const onClick = sinon.stub();
        const wrapper = mount((
          <div className="div-elem">
            <span className="parent-elem" onClick={onClick}>
              <span className="child-elem">click me</span>
            </span>
          </div>
        ));
        return { wrapper, onClick };
      }

      it('child should fire onClick', () => {
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

      it.skip('parent should fire onClick', () => {
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
      const wrapper = mount(<Div />).find('div');
      expect(wrapper.is('div')).to.equal(true);
      expect(() => wrapper.simulateError()).to.throw();
    });

    it('throws on "not one" node', () => {
      const wrapper = mount(<Spans />);

      const spans = wrapper.find('span');
      expect(spans).to.have.lengthOf(2);
      expect(() => spans.simulateError()).to.throw();

      const navs = wrapper.find('nav');
      expect(navs).to.have.lengthOf(0);
      expect(() => navs.simulateError()).to.throw();
    });

    it('throws when the renderer lacks `simulateError`', () => {
      const wrapper = mount(<Nested />);
      delete wrapper[sym('__renderer__')].simulateError;
      expect(() => wrapper.simulateError()).to.throw();
      try {
        wrapper.simulateError();
      } catch (e) {
        expect(e).not.to.equal(undefined);
      }
    });

    it('calls through to renderer’s `simulateError`', () => {
      const wrapper = mount(<Nested />).find(Div);
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
      expect(hierarchy).to.have.lengthOf(2);
      const [divNode, spanNode] = hierarchy;
      expect(divNode).to.contain.keys({
        type: Div,
        nodeType: 'class',
        rendered: {
          type: Spans,
          nodeType: 'class',
          rendered: null,
        },
      });
      expect(spanNode).to.contain.keys({
        type: Spans,
        nodeType: 'class',
        rendered: null,
      });
    });
  });

  describe('.setState(newState[, callback])', () => {
    it('throws on a non-function callback', () => {
      class Foo extends React.Component {
        render() {
          return null;
        }
      }
      const wrapper = mount(<Foo />);

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
      const wrapper = mount(<Foo />);
      expect(wrapper.find('.foo')).to.have.lengthOf(1);
      wrapper.setState({ id: 'bar' });
      expect(wrapper.find('.bar')).to.have.lengthOf(1);
    });

    it('allows setState inside of componentDidMount', () => {
      // NOTE: this test is a test to ensure that the following issue is
      // fixed: https://github.com/airbnb/enzyme/issues/27
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
      const wrapper = mount(<MySharona />);
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
      const wrapper = mount(<Foo />);
      expect(wrapper.state()).to.eql({ id: 'foo' });
      return new Promise((resolve) => {
        wrapper.setState({ id: 'bar' }, function callback(...args) {
          expect(wrapper.state()).to.eql({ id: 'bar' });
          expect(this).to.equal(wrapper.instance());
          expect(this.state).to.eql({ id: 'bar' });
          expect(wrapper.find('div').prop('className')).to.eql('bar');
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

      const wrapper = mount(<Foo />);
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

      const wrapper = mount(<Foo />);

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

        const wrapper = mount(<A />, { disableLifecycleMethods: true });

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

        const wrapper = mount(<B />, { disableLifecycleMethods: true });

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


    describeIf(is('> 0.13'), 'stateless function components', () => {
      it('throws when trying to access state', () => {
        const Foo = () => (
          <div>abc</div>
        );

        const wrapper = mount(<Foo />);

        expect(() => wrapper.state()).to.throw(
          Error,
          'ReactWrapper::state() can only be called on class components',
        );
      });

      it('throws when trying to set state', () => {
        const Foo = () => (
          <div>abc</div>
        );

        const wrapper = mount(<Foo />);

        expect(() => wrapper.setState({ a: 1 })).to.throw(
          Error,
          'ReactWrapper::setState() can only be called on class components',
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
      const wrapper = mount(<Foo />);
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

      const wrapper = mount(<Foo />);
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

      expect(mount(<Comp />).debug()).to.equal('<Comp />');
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

      it('sets the state of the parent', () => {
        const wrapper = mount(<Parent />);

        expect(wrapper.text().trim()).to.eql('1 - a');

        return new Promise((resolve) => {
          wrapper.setState({ childProp: 2 }, () => {
            expect(wrapper.text().trim()).to.eql('2 - a');
            resolve();
          });
        });
      });

      it('sets the state of the child', () => {
        const wrapper = mount(<Parent />);

        expect(wrapper.text().trim()).to.eql('1 - a');

        return new Promise((resolve) => {
          wrapper.find(Child).setState({ state: 'b' }, () => {
            expect(wrapper.text().trim()).to.eql('1 - b');
            resolve();
          });
        });
      });

      itIf(is('> 0.13'), 'sets the state of a class child with a root SFC', () => {
        function SFC(props) {
          return <Parent {...props} />;
        }

        const wrapper = mount(<SFC />);

        expect(wrapper.text().trim()).to.eql('1 - a');

        return new Promise((resolve) => {
          wrapper.find(Child).setState({ state: 'b' }, () => {
            expect(wrapper.text().trim()).to.eql('1 - b');
            resolve();
          });
        });
      });
    });
  });

  describe('.is(selector)', () => {
    it('returns true when selector matches current element', () => {
      const wrapper = mount(<div className="foo bar baz" />);
      expect(wrapper.is('.foo')).to.equal(true);
    });

    it('allows for compound selectors', () => {
      const wrapper = mount(<div className="foo bar baz" />);
      expect(wrapper.is('.foo.bar')).to.equal(true);
    });

    it('ignores insignificant whitespace', () => {
      const className = `
      foo
      `;
      const wrapper = mount(<div className={className} />);
      expect(wrapper.is('.foo')).to.equal(true);
    });

    it('handles all significant whitespace', () => {
      const className = `foo

      bar
      baz`;
      const wrapper = mount(<div className={className} />);
      expect(wrapper.is('.foo.bar.baz')).to.equal(true);
    });

    it('returns false when selector does not match', () => {
      const wrapper = mount(<div className="bar baz" />);
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
      const wrapper = mount(<Foo />);
      expect(wrapper.isEmptyRender()).to.equal(data.expectResponse);
    });

    itWithData(emptyRenderValues, 'when an ES2015 class component returns: ', (data) => {
      class Foo extends React.Component {
        render() {
          return data.value;
        }
      }
      const wrapper = mount(<Foo />);
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

      it('returns true for nested elements that return null', () => {
        const wrapper = mount((
          <RenderChildren>
            <RenderNull />
          </RenderChildren>
        ));

        expect(wrapper.isEmptyRender()).to.equal(true);
      });

      it('returns false for multiple nested elements that all return null', () => {
        const wrapper = mount((
          <RenderChildren>
            <div />
          </RenderChildren>
        ));

        expect(wrapper.isEmptyRender()).to.equal(false);
      });

      it('returns false for multiple nested elements where one fringe returns a non null value', () => {
        const wrapper = mount((
          <RenderChildren>
            <div>Hello</div>
          </RenderChildren>
        ));

        expect(wrapper.isEmptyRender()).to.equal(false);
      });

      itIf(is('>= 16'), 'returns false for multiple nested elements that all return null', () => {
        const wrapper = mount((
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
        const wrapper = mount((
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

      itIf(is('>= 16'), 'returns true for multiple nested elements where all values are null', () => {
        const wrapper = mount((
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

        expect(wrapper.isEmptyRender()).to.equal(true);
      });
    });

    it('does not return true for HTML elements', () => {
      const wrapper = mount(<div className="bar baz" />);
      expect(wrapper.isEmptyRender()).to.equal(false);
    });

    describeIf(is('>=15 || ^16.0.0-alpha'), 'stateless function components', () => {
      itWithData(emptyRenderValues, 'when a component returns: ', (data) => {
        function Foo() {
          return data.value;
        }
        const wrapper = mount(<Foo />);
        expect(wrapper.isEmptyRender()).to.equal(data.expectResponse);
      });
    });
  });

  describe('.not(selector)', () => {
    it('filters to things not matching a selector', () => {
      const wrapper = mount((
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
      const wrapper = mount((
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

    it('only looks in the current wrapper’s nodes, not their children', () => {
      const wrapper = mount((
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
      const wrapper = mount((
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

    it('calls the predicate with the wrapper as the first argument', () => {
      const wrapper = mount((
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
      expect(spy.args[0][0]).to.be.instanceOf(ReactWrapper);
      expect(spy.args[1][0]).to.be.instanceOf(ReactWrapper);
      expect(spy.args[2][0]).to.be.instanceOf(ReactWrapper);
      expect(spy.args[0][0].hasClass('bar')).to.equal(true);
      expect(spy.args[1][0].hasClass('baz')).to.equal(true);
      expect(spy.args[2][0].hasClass('bux')).to.equal(true);
    });
  });

  describe('.text()', () => {
    const matchesRender = function matchesRender(node) {
      const actual = mount(node).text();
      const expected = render(node).text();
      expect(expected).to.equal(actual);
    };

    it('handles simple text nodes', () => {
      const wrapper = mount((
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

    it('renders composite components smartly', () => {
      class Foo extends React.Component {
        render() { return <div>foo</div>; }
      }
      const wrapper = mount((
        <div>
          <Foo />
          <div>test</div>
        </div>
      ));
      expect(wrapper.text()).to.equal('footest');
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

      const wrapper = mount(Space);

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
      const wrapper = mount(<Foo />);
      const charCodes = wrapper.text().split('').map(x => x.charCodeAt(0));
      expect(charCodes).to.eql([
        0x00a0, // non-breaking space
        0x20, // normal space
        0x00a0, // non-breaking space
      ]);
    });

    describeIf(is('> 0.13'), 'stateless function components', () => {
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

      it('renders composite components smartly', () => {
        const Foo = () => (
          <div>foo</div>
        );

        const wrapper = mount((
          <div>
            <Foo />
            <div>test</div>
          </div>
        ));
        expect(wrapper.text()).to.equal('footest');
      });
    });

    it('renders falsy numbers', () => {
      [0, -0, '0', NaN].forEach((x) => {
        const wrapper = mount(<div>{x}</div>);
        expect(wrapper.text()).to.equal(String(x));
      });
    });

    describe('text content with curly braces', () => {
      it('handles literal strings', () => {
        const wrapper = mount(<div><div>{'{}'}</div></div>);
        expect(wrapper.text()).to.equal('{}');
      });

      it('handles innerHTML', () => {
        const wrapper = mount((
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
        const classWrapper = mount(<FragmentClassExample />);
        expect(classWrapper.text()).to.include('Foo');
        expect(classWrapper.text()).to.include('Bar');
      });

      it('correctly gets text for both children for const', () => {
        const constWrapper = mount(<FragmentConstExample />);
        expect(constWrapper.text()).to.include('Foo');
        expect(constWrapper.text()).to.include('Bar');
      });
    });
  });

  describe('.props()', () => {
    it('returns the props object', () => {
      const fn = () => ({});
      const wrapper = mount((
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
      const wrapper = mount((
        <div className="bax">
          <div className="baz" onClick={fn} />
          <div className="foo" id="fooId" />
        </div>
      ));

      expect(wrapper.find('.baz').props().onClick).to.equal(fn);
      expect(wrapper.find('.foo').props().id).to.equal('fooId');
    });

    it('called on root should return props of root node', () => {
      class Foo extends React.Component {
        render() {
          return (
            <div className={this.props.bar} id={this.props.foo} />
          );
        }
      }

      const wrapper = mount(<Foo foo="hi" bar="bye" />);

      expect(wrapper.props()).to.eql({ bar: 'bye', foo: 'hi' });
    });

    describeIf(is('> 0.13'), 'stateless function components', () => {
      it('called on root should return props of root node', () => {
        const Foo = ({ bar, foo }) => (
          <div className={bar} id={foo} />
        );

        const wrapper = mount(<Foo foo="hi" bar="bye" />);

        expect(wrapper.props()).to.eql({ bar: 'bye', foo: 'hi' });
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
        const wrapper = mount(<SloppyReceiver />);
        expect(wrapper.childAt(0).props()).to.be.an('object').that.has.all.keys({
          'data-is-global': true,
          'data-is-undefined': false,
        });
      });

      it('does not provide a `this` to a strict-mode SFC', () => {
        const wrapper = mount(<StrictReceiver />);
        expect(wrapper.childAt(0).props()).to.be.an('object').that.has.all.keys({
          'data-is-global': false,
          'data-is-undefined': true,
        });
      });
    });
  });

  describe('.prop(name)', () => {
    it('returns the props of key `name`', () => {
      const fn = () => ({});
      const wrapper = mount((
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
      const wrapper = mount((
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

      const wrapper = mount(<Foo foo="hi" bar="bye" />);

      expect(wrapper.prop('className')).to.equal(undefined);
      expect(wrapper.prop('id')).to.equal(undefined);
      expect(wrapper.prop('foo')).to.equal('hi');
      expect(wrapper.prop('bar')).to.equal('bye');
    });

    describeIf(is('> 0.13'), 'stateless function components', () => {
      it('returns props of root rendered node', () => {
        const Foo = ({ bar, foo }) => (
          <div className={bar} id={foo} />
        );

        const wrapper = mount(<Foo foo="hi" bar="bye" />);

        expect(wrapper.prop('className')).to.equal(undefined);
        expect(wrapper.prop('id')).to.equal(undefined);
        expect(wrapper.prop('foo')).to.equal('hi');
        expect(wrapper.prop('bar')).to.equal('bye');
      });
    });
  });

  describe('.state(name)', () => {
    it('returns the state object', () => {
      class Foo extends React.Component {
        constructor(props) {
          super(props);
          this.state = { foo: 'foo' };
        }

        render() { return <div>{this.state.foo}</div>; }
      }
      const wrapper = mount(<Foo />);
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
      const wrapper = mount(<Foo />);
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
      const wrapper = mount(<Foo />);
      expect(wrapper.state('foo')).to.equal('foo');
    });

    it('throws on host nodes', () => {
      const wrapper = mount(<div><span /></div>);

      expect(() => wrapper.state()).to.throw(Error, 'ReactWrapper::state() can only be called on class components');
    });

    itIf(is('>= 16'), 'throws on Portals', () => {
      const containerDiv = global.document.createElement('div');
      const portal = createPortal(
        <div />,
        containerDiv,
      );

      const wrapper = mount(<div>{portal}</div>);
      expect(() => wrapper.state()).to.throw(Error, 'ReactWrapper::state() can only be called on class components');
    });

    describeIf(is('> 0.13'), 'stateless function components', () => {
      it('throws on SFCs', () => {
        function Foo() {
          return <div />;
        }

        const wrapper = mount(<Foo />);
        expect(() => wrapper.state()).to.throw(Error, 'ReactWrapper::state() can only be called on class components');
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

      it('gets the state of the parent', () => {
        const wrapper = mount(<Parent />);

        expect(wrapper.state()).to.eql({ childProp: 1 });
      });

      it('gets the state of the child', () => {
        const wrapper = mount(<Parent />);

        expect(wrapper.find(Child).state()).to.eql({ state: 'a' });
      });
    });
  });

  describe('.children([selector])', () => {
    it('returns empty wrapper for node with no children', () => {
      const wrapper = mount(<div />);
      expect(wrapper.children()).to.have.lengthOf(0);
    });

    it('returns the children nodes of the root', () => {
      const wrapper = mount((
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
      const wrapper = mount((
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
      const wrapper = mount((
        <Foo
          items={[
            <i key={1} className="bar">abc</i>,
            <i key={2} className="baz">def</i>,
          ]}
        />
      ));
      expect(wrapper.children().children()).to.have.lengthOf(3);
      expect(wrapper.children().children().at(0).hasClass('foo')).to.equal(true);
      expect(wrapper.children().children().at(1).hasClass('bar')).to.equal(true);
      expect(wrapper.children().children().at(2).hasClass('baz')).to.equal(true);
    });

    it('optionally allows a selector to filter by', () => {
      const wrapper = mount((
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

    it('does not attempt to get an instance for text nodes', () => {
      const wrapper = mount(<div>B<span />C</div>);
      const children = wrapper.children();
      expect(children).to.have.lengthOf(1);
    });

    describeIf(is('> 0.13'), 'stateless function components', () => {
      it('handles mixed children with and without arrays', () => {
        const Foo = props => (
          <div>
            <span className="foo" />
            {props.items.map(x => x)}
          </div>
        );

        const wrapper = mount((
          <Foo
            items={[
              <i key={1} className="bar">abc</i>,
              <i key={2} className="baz">def</i>,
            ]}
          />
        ));
        expect(wrapper.children().children()).to.have.lengthOf(3);
        expect(wrapper.children().children().at(0).hasClass('foo')).to.equal(true);
        expect(wrapper.children().children().at(1).hasClass('bar')).to.equal(true);
        expect(wrapper.children().children().at(2).hasClass('baz')).to.equal(true);
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

      const wrapper = mount(<Foo />);
      const children = wrapper.children();
      const textNodes = children.map(x => x.text());
      expect(textNodes).to.eql(['Foo Bar Foo Bar Foo']);
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

      const wrapper = mount((
        <JustificationRow>
          <div>foo</div>
          <div>bar</div>
          <div>baz</div>
        </JustificationRow>
      )).children();

      expect(wrapper.children().map(x => x.debug())).to.eql([
        `<span>
  <div>
    foo
  </div>
</span>`,
        // ' ', // TODO: fixme: difference between shallow and mount
        `<span>
  <div>
    bar
  </div>
</span>`,
        // ' ', // TODO: fixme: difference between shallow and mount
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
      const wrapper = mount((
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
      const wrapper = mount((
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
      const wrapper = mount((
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
      const wrapper = mount((
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

    it('works with components in the tree', () => {
      const Foo = createClass({
        render() {
          return <div className="bar" />;
        },
      });
      const wrapper = mount((
        <div className="root">
          <Foo />
        </div>
      ));
      const root = wrapper.find('.root');
      expect(root).to.have.lengthOf(1);
      expect(root.hasClass('root')).to.equal(true);
      expect(root.hasClass('bar')).to.equal(false);

      const bar = root.find('.bar');
      expect(bar).to.have.lengthOf(1);
      expect(bar.parents('.root')).to.have.lengthOf(1);
    });

    it('finds parents up a tree through a custom component boundary', () => {
      class CustomForm extends React.Component {
        render() {
          const { children } = this.props;
          return (
            <form>
              {children}
            </form>
          );
        }
      }

      const wrapper = mount((
        <div>
          <CustomForm>
            <input />
          </CustomForm>
        </div>
      ));

      const formDown = wrapper.find('form');
      expect(formDown).to.have.lengthOf(1);

      const input = wrapper.find('input');
      expect(input).to.have.lengthOf(1);
      const formUp = input.parents('form');
      expect(formUp).to.have.lengthOf(1);
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

      const wrapper = mount(<Test />);

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
      const wrapper = mount((
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

    it('works for multiple nodes', () => {
      const wrapper = mount((
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
  });

  describe('.closest(selector)', () => {
    it('returns the closest ancestor for a given selector', () => {
      const wrapper = mount((
        <div className="foo">
          <div className="foo baz">
            <div className="bax">
              <div className="bar" />
            </div>
          </div>
        </div>
      ));

      const closestFoo = wrapper.find('.bar').closest('.foo');
      expect(closestFoo.hasClass('baz')).to.equal(true);
      expect(closestFoo).to.have.lengthOf(1);
    });

    it('only ever returns a wrapper of a single node', () => {
      const wrapper = mount((
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
      const wrapper = mount((
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
      const wrapper = mount((
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
    context('When using a DOM component', () => {
      it('returns whether or not node has a certain class', () => {
        const wrapper = mount(<div className="foo bar baz some-long-string FoOo" />);

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
        const Foo = () => <div className="foo bar baz some-long-string FoOo" />;
        const wrapper = mount(<Foo />);

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

    context('When using a Composite class component', () => {
      it('returns whether or not node has a certain class', () => {
        class Foo extends React.Component {
          render() {
            return (<div className="foo bar baz some-long-string FoOo" />);
          }
        }
        const wrapper = mount(<Foo />);

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

    context('When using nested composite components', () => {
      it('returns whether or not node has a certain class', () => {
        class Foo extends React.Component {
          render() {
            return (<div className="foo bar baz some-long-string FoOo" />);
          }
        }
        class Bar extends React.Component {
          render() {
            return <Foo />;
          }
        }
        const wrapper = mount(<Bar />);

        expect(wrapper.hasClass('foo')).to.equal(false);
        expect(wrapper.hasClass('bar')).to.equal(false);
        expect(wrapper.hasClass('baz')).to.equal(false);
        expect(wrapper.hasClass('some-long-string')).to.equal(false);
        expect(wrapper.hasClass('FoOo')).to.equal(false);
        expect(wrapper.hasClass('doesnt-exist')).to.equal(false);

        // NOTE(lmr): the fact that this no longer works is a semantically
        // meaningfull deviation in behavior. But this will be remedied with the ".root()" change
        expect(wrapper.children().hasClass('foo')).to.equal(false);
        expect(wrapper.children().hasClass('bar')).to.equal(false);
        expect(wrapper.children().hasClass('baz')).to.equal(false);
        expect(wrapper.children().hasClass('some-long-string')).to.equal(false);
        expect(wrapper.children().hasClass('FoOo')).to.equal(false);
        expect(wrapper.children().hasClass('doesnt-exist')).to.equal(false);
      });
    });

    context('When using a Composite component that renders null', () => {
      it('returns whether or not node has a certain class', () => {
        class Foo extends React.Component {
          render() {
            return null;
          }
        }
        const wrapper = mount(<Foo />);

        expect(wrapper.hasClass('foo')).to.equal(false);
      });
    });

    it('works with a non-string `className` prop', () => {
      class Foo extends React.Component {
        render() {
          return <div {...this.props} />;
        }
      }
      const wrapper = mount(<Foo className={{ classA: true, classB: false }} />);
      expect(wrapper.hasClass('foo')).to.equal(false);
    });
  });

  describe('.forEach(fn)', () => {
    it('calls a function for each node in the wrapper', () => {
      const wrapper = mount((
        <div>
          <div className="foo bax" />
          <div className="foo bar" />
          <div className="foo baz" />
        </div>
      ));
      const spy = sinon.spy();

      wrapper.find('.foo').forEach(spy);

      expect(spy).to.have.property('callCount', 3);
      expect(spy.args[0][0]).to.be.instanceOf(ReactWrapper);
      expect(spy.args[0][0].hasClass('bax')).to.equal(true);
      expect(spy.args[0][1]).to.equal(0);
      expect(spy.args[1][0]).to.be.instanceOf(ReactWrapper);
      expect(spy.args[1][0].hasClass('bar')).to.equal(true);
      expect(spy.args[1][1]).to.equal(1);
      expect(spy.args[2][0]).to.be.instanceOf(ReactWrapper);
      expect(spy.args[2][0].hasClass('baz')).to.equal(true);
      expect(spy.args[2][1]).to.equal(2);
    });
  });

  describe('.map(fn)', () => {
    it('calls a function with a wrapper for each node in the wrapper', () => {
      const wrapper = mount((
        <div>
          <div className="foo bax" />
          <div className="foo bar" />
          <div className="foo baz" />
        </div>
      ));
      const spy = sinon.spy();

      wrapper.find('.foo').map(spy);

      expect(spy).to.have.property('callCount', 3);
      expect(spy.args[0][0]).to.be.instanceOf(ReactWrapper);
      expect(spy.args[0][0].hasClass('bax')).to.equal(true);
      expect(spy.args[0][1]).to.equal(0);
      expect(spy.args[1][0]).to.be.instanceOf(ReactWrapper);
      expect(spy.args[1][0].hasClass('bar')).to.equal(true);
      expect(spy.args[1][1]).to.equal(1);
      expect(spy.args[2][0]).to.be.instanceOf(ReactWrapper);
      expect(spy.args[2][0].hasClass('baz')).to.equal(true);
      expect(spy.args[2][1]).to.equal(2);
    });

    it('returns an array with the mapped values', () => {
      const wrapper = mount((
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
      expect(ReactWrapper.prototype.reduce).to.have.lengthOf(1);
    });

    it('calls a function with a wrapper for each node in the wrapper', () => {
      const wrapper = mount((
        <div>
          <div className="foo bax" />
          <div className="foo bar" />
          <div className="foo baz" />
        </div>
      ));
      const spy = sinon.spy(n => n + 1);

      wrapper.find('.foo').reduce(spy, 0);

      expect(spy).to.have.property('callCount', 3);
      expect(spy.args[0][1]).to.be.instanceOf(ReactWrapper);
      expect(spy.args[0][1].hasClass('bax')).to.equal(true);
      expect(spy.args[1][1]).to.be.instanceOf(ReactWrapper);
      expect(spy.args[1][1].hasClass('bar')).to.equal(true);
      expect(spy.args[2][1]).to.be.instanceOf(ReactWrapper);
      expect(spy.args[2][1].hasClass('baz')).to.equal(true);
    });

    it('accumulates a value', () => {
      const wrapper = mount((
        <div>
          <div id="bax" className="foo qoo" />
          <div id="bar" className="foo boo" />
          <div id="baz" className="foo hoo" />
        </div>
      ));
      const result = wrapper.find('.foo').reduce((obj, n) => {
        obj[n.prop('id')] = n.prop('className');
        return obj;
      }, {});

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
      const wrapper = mount((
        <div>
          {one}
          {two}
          {three}
        </div>
      ));
      const counter = (<noscript id="counter" />);
      const result = wrapper
        .find('.foo')
        .reduce((acc, n) => [].concat(acc, n, new ReactWrapper(counter)))
        .map(getWrapperPropSelector('id'));

      expect(result).to.eql([one, two, counter, three, counter].map(getElementPropSelector('id')));
    });
  });

  describe('.reduceRight(fn[, initialValue])', () => {
    it('has the right length', () => {
      expect(ReactWrapper.prototype.reduceRight).to.have.lengthOf(1);
    });

    it('calls a function with a wrapper for each node in the wrapper in reverse', () => {
      const wrapper = mount((
        <div>
          <div className="foo bax" />
          <div className="foo bar" />
          <div className="foo baz" />
        </div>
      ));
      const spy = sinon.spy(n => n + 1);

      wrapper.find('.foo').reduceRight(spy, 0);

      expect(spy).to.have.property('callCount', 3);
      expect(spy.args[0][1]).to.be.instanceOf(ReactWrapper);
      expect(spy.args[0][1].hasClass('baz')).to.equal(true);
      expect(spy.args[1][1]).to.be.instanceOf(ReactWrapper);
      expect(spy.args[1][1].hasClass('bar')).to.equal(true);
      expect(spy.args[2][1]).to.be.instanceOf(ReactWrapper);
      expect(spy.args[2][1].hasClass('bax')).to.equal(true);
    });

    it('accumulates a value', () => {
      const wrapper = mount((
        <div>
          <div id="bax" className="foo qoo" />
          <div id="bar" className="foo boo" />
          <div id="baz" className="foo hoo" />
        </div>
      ));
      const result = wrapper.find('.foo').reduceRight((obj, n) => {
        obj[n.prop('id')] = n.prop('className');
        return obj;
      }, {});

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
      const wrapper = mount((
        <div>
          {one}
          {two}
          {three}
        </div>
      ));

      const counter = (<noscript id="counter" />);
      const result = wrapper
        .find('.foo')
        .reduceRight((acc, n) => [].concat(acc, n, new ReactWrapper(counter)))
        .map(getWrapperPropSelector('id'));

      expect(result).to.eql([three, two, counter, one, counter].map(getElementPropSelector('id')));
    });
  });

  describe('.slice([begin[, end]])', () => {
    it('returns an identical wrapper if no params are set', () => {
      const wrapper = mount((
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
      const wrapper = mount((
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
      const wrapper = mount((
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
      const wrapper = mount((
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
      const wrapper = mount((
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
      const wrapper = mount((
        <div>
          <div className="foo" />
        </div>
      ));
      expect(() => wrapper.some('.foo')).to.throw(
        Error,
        'ReactWrapper::some() can not be called on the root',
      );
    });
  });

  describe('.someWhere(predicate)', () => {
    it('returns if a node matches a predicate', () => {
      const wrapper = mount((
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
      const wrapper = mount((
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
      const wrapper = mount((
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
      const wrapper = mount((
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

      const nodes = wrapper.find('.foo').flatMap(w => w.children().getNodesInternal());

      expect(nodes).to.have.lengthOf(6);
      expect(nodes.at(0).hasClass('bar')).to.equal(true);
      expect(nodes.at(1).hasClass('bar')).to.equal(true);
      expect(nodes.at(2).hasClass('baz')).to.equal(true);
      expect(nodes.at(3).hasClass('baz')).to.equal(true);
      expect(nodes.at(4).hasClass('bax')).to.equal(true);
      expect(nodes.at(5).hasClass('bax')).to.equal(true);
    });
  });

  describe('.first()', () => {
    it('returns the first node in the current set', () => {
      const wrapper = mount((
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
      const wrapper = mount((
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
      const wrapper = mount(<div className="foo" />);
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
      expect(existsSpy).to.have.property('called', true);
    });

    it('returns true if wrapper is empty', () => {
      expect(fooNode.isEmpty()).to.equal(false);
      expect(missingNode.isEmpty()).to.equal(true);
    });
  });

  describe('.exists()', () => {
    it('has no required arguments', () => {
      expect(ReactWrapper.prototype.exists).to.have.lengthOf(0);
    });

    describe('without arguments', () => {
      it('returns true if node exists in wrapper', () => {
        const wrapper = mount(<div className="foo" />);
        expect(wrapper.find('.bar').exists()).to.equal(false);
        expect(wrapper.find('.foo').exists()).to.equal(true);
      });
    });
    describe('with argument', () => {
      it('throws on invalid EnzymeSelector', () => {
        const wrapper = mount(<div />);

        expect(() => wrapper.exists(null)).to.throw(TypeError);
        expect(() => wrapper.exists(undefined)).to.throw(TypeError);
        expect(() => wrapper.exists(45)).to.throw(TypeError);
        expect(() => wrapper.exists({})).to.throw(TypeError);
      });
      it('returns .find(arg).exists() instead', () => {
        const wrapper = mount(<div />);
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
      const wrapper = mount((
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
      const wrapper = mount((
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
      const wrapper = mount((
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
      const wrapper = mount(<Foo />);
      expect(wrapper.get(0).key).to.equal(null);
    });
  });

  describe('.ref(refName)', () => {
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

  describe('.debug()', () => {
    it('passes through to the debugNodes function', () => {
      expect(mount(<div />).debug()).to.equal('<div />');
    });
  });

  describe('.html()', () => {
    it('returns html of straight DOM elements', () => {
      const wrapper = mount((
        <div className="test">
          <span>Hello World!</span>
        </div>
      ));
      expect(wrapper.html()).to.equal('<div class="test"><span>Hello World!</span></div>');
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
      const wrapper = mount(<Bar />);
      expect(wrapper.html()).to.equal('<div class="in-bar"><div class="in-foo"></div></div>');
      expect(wrapper.find(Foo).html()).to.equal('<div class="in-foo"></div>');
    });

    describeIf(is('> 0.13'), 'stateless function components', () => {
      it('renders out nested composite components', () => {
        const Foo = () => <div className="in-foo" />;
        const Bar = () => (
          <div className="in-bar">
            <Foo />
          </div>
        );

        const wrapper = mount(<Bar />);
        expect(wrapper.html()).to.equal('<div class="in-bar"><div class="in-foo"></div></div>');
        expect(wrapper.find(Foo).html()).to.equal('<div class="in-foo"></div>');
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

      it('correctly renders html for both children for class', () => {
        const classWrapper = mount(<FragmentClassExample />);
        expect(classWrapper.html()).to.equal('<div><span>Foo</span></div><div><span>Bar</span></div>');
      });

      it('correctly renders html for both children for const', () => {
        const constWrapper = mount(<FragmentConstExample />);
        expect(constWrapper.html()).to.equal('<div><span>Foo</span></div><div><span>Bar</span></div>');
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
      const wrapper = mount(<Foo id="foo" />);
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

      const wrapper = mount(<Bar />);

      expect(wrapper.render().find('.in-foo')).to.have.lengthOf(1);

      const rendered = wrapper.render();
      expect(rendered.is('.in-bar')).to.equal(true);
      expect(rendered).to.have.lengthOf(1);

      const renderedFoo = wrapper.find(Foo).render();
      expect(renderedFoo.is('.in-foo')).to.equal(true);
      expect(renderedFoo.is('.in-bar')).to.equal(false);
      expect(renderedFoo.find('.in-bar')).to.have.lengthOf(0);
    });

    describeIf(is('> 0.13'), 'stateless function components', () => {
      it('returns a cheerio wrapper around the current node', () => {
        const Foo = () => (
          <div className="in-foo" />
        );

        const Bar = () => (
          <div className="in-bar">
            <Foo />
          </div>
        );

        const wrapper = mount(<Bar />);

        expect(wrapper.render().find('.in-foo')).to.have.lengthOf(1);
        expect(wrapper.render().is('.in-bar')).to.equal(true);

        const renderedFoo = wrapper.find(Foo).render();
        expect(renderedFoo.is('.in-foo')).to.equal(true);
        expect(renderedFoo.is('.in-bar')).to.equal(false);
        expect(renderedFoo.find('.in-bar')).to.have.lengthOf(0);
      });
    });
  });

  describe('.renderProp()', () => {
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

      const wrapperA = mount(<div><Bar render={() => <div><Foo /></div>} /></div>);
      const renderPropWrapperA = wrapperA.find(Bar).renderProp('render')();
      expect(renderPropWrapperA.find(Foo)).to.have.lengthOf(1);

      const wrapperB = mount(<div><Bar render={() => <Foo />} /></div>);
      const renderPropWrapperB = wrapperB.find(Bar).renderProp('render')();
      expect(renderPropWrapperB.find(Foo)).to.have.lengthOf(1);

      const stub = sinon.stub().returns(<div />);
      const wrapperC = mount(<div><Bar render={stub} /></div>);
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

      const wrapper = mount(<Div />).childAt(0);
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

        const wrapper = mount(<div><Bar render={() => <div><Foo /></div>} /></div>);
        expect(() => wrapper.find(Bar).renderProp('render')).to.throw(RangeError);
      });
  });

  describe('lifecycle methods', () => {
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
        const wrapper = mount(<CWRP {...prevProps} />);
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
        const wrapper = mount(<U_CWRP {...prevProps} />);
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

      it('calls GDSFP when expected', () => {
        const prevProps = { a: 1 };
        const state = { state: true };
        const wrapper = mount(<GDSFP {...prevProps} />);
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
    });

    describeIf(is('>= 16'), 'componentDidCatch', () => {
      describe('errors inside an error boundary', () => {
        const errorToThrow = new EvalError('threw an error!');
        // in React 16.0 - 16.2, and some older nodes, the actual error thrown isn't reported.
        const reactError = new Error('An error was thrown inside one of your components, but React doesn\'t know what it was. This is likely due to browser flakiness. React does its best to preserve the "Pause on exceptions" behavior of the DevTools, which requires some DEV-mode only tricks. It\'s possible that these don\'t work in your browser. Try triggering the error in production mode, or switching to a modern browser. If you suspect that this is actually an issue with React, please file an issue.');
        const properErrorMessage = error => error instanceof Error && (
          error.message === errorToThrow.message
          || error.message === reactError.message
        );

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

        function ErrorSFC(props) {
          return <ErrorBoundary {...props} />;
        }

        describe('Thrower', () => {
          it('does not throw when `throws` is `false`', () => {
            expect(() => mount(<Thrower throws={false} />)).not.to.throw();
          });

          it('throws when `throws` is `true`', () => {
            expect(() => mount(<Thrower throws />)).to.throw();
            try {
              mount(<Thrower throws />);
              expect(true).to.equal(false, 'this line should not be reached');
            } catch (e) {
              expect(e).to.satisfy(properErrorMessage);
            }
          });
        });

        it('catches a simulated error', () => {
          const spy = sinon.spy();
          const wrapper = mount(<ErrorBoundary spy={spy} />);

          expect(spy).to.have.property('callCount', 0);

          expect(() => wrapper.find(Thrower).simulateError(errorToThrow)).not.to.throw();

          expect(spy).to.have.property('callCount', 1);

          expect(spy.args).to.be.an('array').and.have.lengthOf(1);
          const [[actualError, info]] = spy.args;
          expect(actualError).to.equal(errorToThrow);
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
          const wrapper = mount(<ErrorBoundary spy={sinon.stub()} />);

          expect(wrapper.find({ children: 'HasThrown' })).to.have.lengthOf(0);
          expect(wrapper.find({ children: 'HasNotThrown' })).to.have.lengthOf(1);

          expect(() => wrapper.find(Thrower).simulateError(errorToThrow)).not.to.throw();

          expect(wrapper.find({ children: 'HasThrown' })).to.have.lengthOf(1);
          expect(wrapper.find({ children: 'HasNotThrown' })).to.have.lengthOf(0);
        });

        it('rerenders on a simulated error with an SFC root', () => {
          const wrapper = mount(<ErrorSFC spy={sinon.stub()} />);

          expect(wrapper.find({ children: 'HasThrown' })).to.have.lengthOf(0);
          expect(wrapper.find({ children: 'HasNotThrown' })).to.have.lengthOf(1);

          expect(() => wrapper.find(Thrower).simulateError(errorToThrow)).not.to.throw();

          expect(wrapper.find({ children: 'HasThrown' })).to.have.lengthOf(1);
          expect(wrapper.find({ children: 'HasNotThrown' })).to.have.lengthOf(0);
        });

        it('catches errors during render', () => {
          const spy = sinon.spy();
          const wrapper = mount(<ErrorBoundary spy={spy} />);

          expect(spy).to.have.property('callCount', 0);

          wrapper.setState({ throws: true });

          expect(spy).to.have.property('callCount', 1);

          expect(spy.args).to.be.an('array').and.have.lengthOf(1);
          const [[actualError, info]] = spy.args;
          expect(actualError).to.satisfy(properErrorMessage);
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

        it('works when the root is an SFC', () => {
          const spy = sinon.spy();
          const wrapper = mount(<ErrorSFC spy={spy} />);

          expect(spy).to.have.property('callCount', 0);

          wrapper.find(ErrorBoundary).setState({ throws: true });

          expect(spy).to.have.property('callCount', 1);

          expect(spy.args).to.be.an('array').and.have.lengthOf(1);
          const [[actualError, info]] = spy.args;
          expect(actualError).to.satisfy(properErrorMessage);
          expect(info).to.deep.equal({
            componentStack: `
    in Thrower (created by ErrorBoundary)
    in span (created by ErrorBoundary)${hasFragments ? '' : `
    in main (created by ErrorBoundary)`}
    in div (created by ErrorBoundary)
    in ErrorBoundary (created by ErrorSFC)
    in ErrorSFC (created by WrapperComponent)
    in WrapperComponent`,
          });
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
        mount(<Foo />);
        expect(spy.args).to.deep.equal([
          ['componentWillMount'],
          ['render'],
          ['componentDidMount'],
        ]);
      });

      it('is batching updates', () => {
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
        const result = mount(<Foo />);
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

        const wrapper = mount(
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

        const wrapper = mount(<Foo a="a" b="b" />);

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

        const wrapper = mount(<Foo foo="bar" />);
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

      it('does not provoke another renders to call setState in componentWillReceiveProps', () => {
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
        const result = mount(<Foo />);
        expect(spy).to.have.property('callCount', 1);
        result.setProps({ name: 'bar' });
        expect(spy).to.have.property('callCount', 2);
        expect(result.state('count')).to.equal(1);
      });

      it('provokes an another render to call setState twice in componentWillUpdate', () => {
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
        const result = mount(<Foo />);
        expect(spy).to.have.property('callCount', 1);
        result.setProps({ name: 'bar' });
        expect(spy).to.have.property('callCount', 3);
        expect(result.state('count')).to.equal(1);
      });

      it('provokes an another render to call setState twice in componentDidUpdate', () => {
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
        const result = mount(<Foo />);
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

        const wrapper = mount(
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
        const wrapper = mount(<Foo />);
        expect(wrapper.instance().state.foo).to.equal('bar');
        wrapper.setState({ foo: 'baz' });
        expect(wrapper.instance().state.foo).to.equal('baz');
        expect(spy.args).to.deep.equal([['render'], ['shouldComponentUpdate']]);
      });

      it('provokes an another render to call setState twice in componentWillUpdate', () => {
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
        const result = mount(<Foo />);
        expect(spy).to.have.property('callCount', 1);
        result.setState({ name: 'bar' });
        expect(spy).to.have.property('callCount', 3);
        expect(result.state('count')).to.equal(1);
      });

      it('provokes an another render to call setState twice in componentDidUpdate', () => {
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
        const result = mount(<Foo />);
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
        const wrapper = mount(
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
        const wrapper = mount(
          <Foo />,
          {
            context: { foo: 'bar' },
          },
        );
        wrapper.setContext({ foo: 'baz' });
        expect(spy.args).to.deep.equal([['render'], ['shouldComponentUpdate']]);
      });

      it('provokes an another render to call setState twice in componentWillUpdate', () => {
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
        const result = mount(
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

      it('provokes an another render to call setState twice in componentDidUpdate', () => {
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
        const result = mount(
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
        const wrapper = mount(<Foo />);
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
            this.setState({ foo: 'onChange update' });
          }

          render() {
            return <div>{this.state.foo}</div>;
          }
        }
        const spy = sinon.spy(Foo.prototype, 'componentDidUpdate');

        const wrapper = mount(<Foo />);
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

        const wrapper = mount(<Foo />);
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

        const wrapper = mount(<Foo />);
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

        const wrapper = mount(<Foo />);
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
        const wrapper = mount(<Foo id={1} />);
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
        const wrapper = mount(<Test onUpdate={updateSpy} />);
        wrapper.instance().setDeepEqualState();
        expect(updateSpy).to.have.property('callCount', 1);
      });

      it('rerenders when setState is called with an object that doesnt have deep equality', () => {
        const updateSpy = sinon.spy();
        const wrapper = mount(<Test onUpdate={updateSpy} />);
        wrapper.instance().setDeepDifferentState();
        expect(updateSpy).to.have.property('callCount', 1);
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
        const wrapper = mount(<Foo id={1} />);
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
        const wrapper = mount(<Foo name="foo" />);
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

    describeIf(is('> 0.13'), 'stateless function components', () => {
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

  describe('.tap()', () => {
    it('calls the passed function with current ReactWrapper and returns itself', () => {
      const spy = sinon.spy();
      const wrapper = mount((
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
      const wrapper = mount((
        <ul>
          {['foo', 'bar', ''].map(s => <li key={s}>{s}</li>)}
        </ul>
      )).find('li');
      expect(wrapper.at(0).key()).to.equal('foo');
      expect(wrapper.at(1).key()).to.equal('bar');
      expect(wrapper.at(2).key()).to.equal('');
    });

    it('returns null when no key is specified', () => {
      const wrapper = mount((
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
      const wrapper = mount((
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
      const wrapper = mount((
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
      const wrapper = mount(<Test />);
      expect(wrapper.children().matchesElement(<h1>test</h1>)).to.equal(true);
    });
  });

  describe('.containsMatchingElement(node)', () => {
    it('matches a root node that looks like the rendered one', () => {
      const spy1 = sinon.spy();
      const spy2 = sinon.spy();
      const wrapper = mount((
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
      const wrapper = mount((
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
      const wrapper = mount((
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
      const wrapper = mount((
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
      const wrapper = mount((
        <li>
          <a> All Operations </a>
        </li>
      ));

      expect(wrapper.containsMatchingElement(<a> All Operations </a>)).to.equal(true);
    });

    it('works with leading and trailing newlines', () => {
      const wrapper = mount((
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
      const wrapper = mount((
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
      const wrapper = mount((
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
      const wrapper = mount((
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
      const wrapper = mount((
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
      const wrapper = mount((
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
      const wrapper = mount((
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

          Foo.displayName = 'CustomWrapper';

          const wrapper = mount(<Foo />);
          expect(wrapper.name()).to.equal('CustomWrapper');
        });

        describeIf(is('> 0.13'), 'stateless function components', () => {
          it('returns the name of the node', () => {
            function SFC() {
              return <div />;
            }

            SFC.displayName = 'CustomWrapper';

            const wrapper = mount(<SFC />);
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

            const wrapper = mount(<Foo />);
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

              const wrapper = mount(<Foo />);

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

          const wrapper = mount(<Foo />);
          expect(wrapper.name()).to.equal('Foo');
        });

        describeIf(is('> 0.13'), 'stateless function components', () => {
          it('returns the name of the node', () => {
            function SFC() {
              return <div />;
            }

            const wrapper = mount(<SFC />);
            expect(wrapper.name()).to.equal('SFC');
          });
        });
      });

      describe('DOM node', () => {
        it('returns the name of the node', () => {
          const wrapper = mount(<div />);
          expect(wrapper.name()).to.equal('div');
        });
      });

      describe('.ref()', () => {
        it('unavailable ref should return undefined', () => {
          class WithoutRef extends React.Component {
            render() { return <div />; }
          }
          const wrapper = mount(<WithoutRef />);
          const ref = wrapper.ref('not-a-ref');

          expect(ref).to.equal(undefined);
        });
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
      const wrapper = mount(<Foo />);
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
      const wrapper = mount(<Foo />);

      const iter = wrapper[ITERATOR_SYMBOL]();
      expect(iter).to.have.property(ITERATOR_SYMBOL).and.be.a('function');
      expect(iter[ITERATOR_SYMBOL]()).to.equal(iter);
    });
  });

  describe('.instance()', () => {
    class Test extends React.Component {
      render() {
        return (
          <div>
            <span />
            <span />
          </div>
        );
      }
    }

    it('returns the wrapped component instance', () => {
      const wrapper = mount(<Test />);
      expect(wrapper.instance()).to.be.an.instanceof(Test);
    });

    it('throws when wrapping multiple elements', () => {
      const wrapper = mount(<Test />).find('span');
      expect(() => wrapper.instance()).to.throw(Error);
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
      const wrapper = mount(<Foo />);
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
      const wrapper = mount(<Foo />);
      const element = wrapper.find('.foo').instance();
      expect(wrapper.instance().setRef).to.have.property('current', element);
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
      const wrapper = mount(<Foo />);
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
      const wrapper = mount(<Foo />);
      expect(wrapper.getElement()).to.have.property('key', null);
    });
  });

  describe('.getElements()', () => {
    it('returns the wrapped elements', () => {
      class Test extends React.Component {
        render() {
          return (
            <div>
              <span />
              <span />
            </div>
          );
        }
      }

      const wrapper = mount(<Test />);
      expect(wrapper.find('span').getElements()).to.have.lengthOf(2);
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

  describe('#single()', () => {
    it('throws if run on multiple nodes', () => {
      const wrapper = mount(<div><i /><i /></div>).children();
      expect(wrapper).to.have.lengthOf(2);
      expect(() => wrapper.single('name!')).to.throw(
        Error,
        'Method “name!” is meant to be run on 1 node. 2 found instead.',
      );
    });

    it('works with a name', () => {
      const wrapper = mount(<div />);
      wrapper.single('foo', (node) => {
        expect(node).to.equal(wrapper.getNodeInternal());
      });
    });

    it('works without a name', () => {
      const wrapper = mount(<div />);
      wrapper.single((node) => {
        expect(node).to.equal(wrapper.getNodeInternal());
      });
    });
  });

  describe('setState through a props method', () => {
    class Child extends React.Component {
      render() {
        return <button onClick={this.props.onClick}>click</button>;
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
        return <button onClick={this.props.onClick}>click</button>;
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
      const wrapper = mount(<App />);
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

    it('returns itself when it is already a ReactWrapper', () => {
      const wrapperDiv = mount(<div />);
      const wrapperFoo = mount(<Foo />);
      expect(wrapperDiv.wrap(wrapperFoo)).to.equal(wrapperFoo);
      expect(wrapperFoo.wrap(wrapperDiv)).to.equal(wrapperDiv);
    });

    it('wraps when it is not already a ReactWrapper', () => {
      const wrapper = mount(<Foo />);
      const el = wrapper.find('a').at(1);
      const wrappedEl = wrapper.wrap(el.getElement());
      expect(wrappedEl).to.be.instanceOf(ReactWrapper);
      expect(wrappedEl.props()).to.eql(el.props());

      // TODO: enable this instead of that:
      // expect(wrappedEl.mount().debug()).to.equal(el.debug());
      expect(wrappedEl.debug()).to.equal('<a href="#2" />');
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

  describe('.root()', () => {
    it('returns the root component instance', () => {
      class Fixture extends React.Component {
        render() {
          return <div><span /><span /></div>;
        }
      }
      const wrapper = mount(<Fixture />);
      const root = wrapper.root();
      expect(root.is(Fixture)).to.equal(true);
      expect(root.childAt(0).children().debug()).to.equal('<span />\n\n\n<span />');
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

      const wrapper = mount(<Foo />);
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

      const wrapper = mount(<Foo />);
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

      const wrapper = mount(<Foo />);
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

      const wrapper = mount(<Foo />);
      expect(spy).to.have.property('callCount', 1);
      wrapper.find('button').prop('onClick')();
      expect(spy).to.have.property('callCount', 1);
    });
  });
});
