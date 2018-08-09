/* globals document */
import React from 'react';
import PropTypes from 'prop-types';
import { expect } from 'chai';
import sinon from 'sinon';
import wrap from 'mocha-wrap';
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

import './_helpers/setupAdapters';
import {
  createClass,
  createContext,
  createPortal,
  Fragment,
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

    it('should call ref', () => {
      const spy = sinon.spy();
      mount(<div ref={spy} />);
      expect(spy).to.have.property('callCount', 1);
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

    it('should not throw if context is passed in but contextTypes is missing', () => {
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

    itIf(is('>= 16.3'), 'should find elements through Context elements', () => {
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

      it('should not throw if context is passed in but contextTypes is missing', () => {
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

  describe('.contains(node)', () => {
    it('should allow matches on the root node', () => {
      const a = <div className="foo" />;
      const b = <div className="foo" />;
      const c = <div className="bar" />;
      expect(mount(a).contains(b)).to.equal(true);
      expect(mount(a).contains(c)).to.equal(false);
    });

    it('should allow matches on a nested node', () => {
      const wrapper = mount((
        <div>
          <div className="foo" />
        </div>
      ));
      const b = <div className="foo" />;
      expect(wrapper.contains(b)).to.equal(true);
    });

    it('should match composite components', () => {
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

    it('should do something with arrays of nodes', () => {
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
      it('should match composite components', () => {
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

      it('should match composite components if rendered by function', () => {
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
    it('should allow matches on the root node', () => {
      const a = <div className="foo" />;
      const b = <div className="foo" />;
      const c = <div className="bar" />;
      expect(mount(a).equals(b)).to.equal(true);
      expect(mount(a).equals(c)).to.equal(false);
    });

    it('should NOT allow matches on a nested node', () => {
      const wrapper = mount((
        <div>
          <div className="foo" />
        </div>
      ));
      const b = <div className="foo" />;
      expect(wrapper.equals(b)).to.equal(false);
    });

    it('should match composite components', () => {
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

    it.skip('should not expand `node` content', () => {
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
      it('should match composite SFCs', () => {
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

      it.skip('should not expand `node` content', () => {
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

  describe('.hostNodes()', () => {
    it('should strip out any non-hostNode', () => {
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
  });

  wrap()
    .withOverride(() => getAdapter(), 'isValidElementType', () => undefined)
    .describe('.find(selector)', () => {
      it('should find an element based on a class name', () => {
        const wrapper = mount((
          <div>
            <input className="foo" />
          </div>
        ));
        expect(wrapper.find('.foo').type()).to.equal('input');
      });

      it('should find an SVG element based on a class name', () => {
        const wrapper = mount((
          <div>
            <svg className="foo" />
          </div>
        ));
        expect(wrapper.find('.foo').type()).to.equal('svg');
      });

      it('should find an element based on a tag name', () => {
        const wrapper = mount((
          <div>
            <input className="foo" />
          </div>
        ));
        expect(wrapper.find('input').props().className).to.equal('foo');
      });

      it('should find an element based on a tag name and class name', () => {
        const wrapper = mount((
          <div>
            <input className="foo" />
            <div className="foo" />
          </div>
        ));
        expect(wrapper.find('input.foo')).to.have.lengthOf(1);
      });

      it('should work on non-single nodes', () => {
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


      it('should find an element based on a tag name and id', () => {
        const wrapper = mount((
          <div>
            <input id="foo" />
          </div>
        ));
        expect(wrapper.find('input#foo')).to.have.lengthOf(1);
      });

      it('should find an element based on a tag name, id, and class name', () => {
        const wrapper = mount((
          <div>
            <input id="foo" className="bar" />
          </div>
        ));
        expect(wrapper.find('input#foo.bar')).to.have.lengthOf(1);
      });

      it('should find a component based on a constructor', () => {
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

      it('should find a component based on a component displayName', () => {
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
        it('should find a stateless component based on a component displayName', () => {
          const Foo = () => <div />;
          const wrapper = mount((
            <div>
              <Foo className="foo" />
            </div>
          ));
          expect(wrapper.find('Foo').type()).to.equal(Foo);
        });

        it('should find a stateless component based on a component displayName if rendered by function', () => {
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

      it('should find component based on a react prop', () => {
        const wrapper = mount((
          <div>
            <span htmlFor="foo" />
            <div htmlFor="bar" />
          </div>
        ));

        expect(wrapper.find('[htmlFor="foo"]')).to.have.lengthOf(1);
        expect(wrapper.find('[htmlFor]')).to.have.lengthOf(2);
      });

      it('should error sensibly if any of the search props are undefined', () => {
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

      it('should compound tag and prop selector', () => {
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

      it('should throw for non-numeric attribute values without quotes', () => {
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

      it('should support data prop selectors', () => {
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

      it('should find components with multiple matching props', () => {
        const onChange = () => ({});
        const wrapper = mount((
          <div>
            <span htmlFor="foo" onChange={onChange} preserveAspectRatio="xMaxYMax" />
          </div>
        ));

        expect(wrapper.find('span[htmlFor="foo"][onChange]')).to.have.lengthOf(1);
        expect(wrapper.find('span[htmlFor="foo"][preserveAspectRatio="xMaxYMax"]')).to.have.lengthOf(1);
      });

      it('should not find property when undefined', () => {
        const wrapper = mount((
          <div>
            <span data-foo={undefined} />
          </div>
        ));

        expect(wrapper.find('[data-foo]')).to.have.lengthOf(0);
      });

      it('should support boolean and numeric values for matching props', () => {
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

      it('should not find key or ref via property selector', () => {
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

      it('should find multiple elements based on a class name', () => {
        const wrapper = mount((
          <div>
            <input className="foo" />
            <button type="button" className="foo" />
          </div>
        ));
        expect(wrapper.find('.foo')).to.have.lengthOf(2);
      });

      it('should find multiple elements based on a tag name', () => {
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

      it('should find multiple elements based on a constructor', () => {
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

      itIf(is('>= 16.2'), 'should support fragments', () => {
        const wrapper = mount((
          <Fragment>
            <p>hello</p>
            <span>boo</span>
          </Fragment>
        ));

        expect(wrapper).to.have.lengthOf(2);
      });

      itIf(is('>= 16'), 'should find elements through portals', () => {
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

      it('should support object property selectors', () => {
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

      it('should support complex and nested object property selectors', () => {
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

      it('should throw when given empty object, null, or an array', () => {
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

      it('Should query attributes with spaces in their values', () => {
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

      itIf(is('>= 16'), 'should find elements through portals', () => {
        const containerDiv = global.document.createElement('div');

        class FooPortal extends React.Component {
          render() {
            return createPortal(
              this.props.children,
              containerDiv,
            );
          }
        }

        const wrapper = mount(<FooPortal><h1>Successful Portal!</h1></FooPortal>);
        expect(wrapper.find('h1')).to.have.lengthOf(1);
        expect(containerDiv.querySelectorAll('h1')).to.have.lengthOf(1);
      });

      describeIf(is('> 0.13'), 'stateless function components', () => {
        it('should find a component based on a constructor', () => {
          const Foo = () => <div />;
          const wrapper = mount((
            <div>
              <Foo className="foo" />
            </div>
          ));
          expect(wrapper.find(Foo).type()).to.equal(Foo);
        });

        it('should find a component based on a component displayName', () => {
          const Foo = () => <div />;
          const wrapper = mount((
            <div>
              <Foo className="foo" />
            </div>
          ));
          expect(wrapper.find('Foo').type()).to.equal(Foo);
        });

        it('should not find key via property selector', () => {
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

        it('should find descendant span inside React.Fragment', () => {
          const wrapper = mount(<NestedFragmentComponent />);
          expect(wrapper.find('.container span')).to.have.lengthOf(4);
        });

        it('should not find nonexistent p inside React.Fragment', () => {
          const wrapper = mount(<NestedFragmentComponent />);
          expect(wrapper.find('.container p')).to.have.lengthOf(0);
        });

        it('should find direct child span inside React.Fragment', () => {
          const wrapper = mount(<NestedFragmentComponent />);
          expect(wrapper.find('.container > span')).to.have.lengthOf(4);
        });

        it('should handle adjacent sibling selector inside React.Fragment', () => {
          const wrapper = mount(<NestedFragmentComponent />);
          expect(wrapper.find('.container span + div')).to.have.lengthOf(1);
        });

        it('should handle general sibling selector inside React.Fragment', () => {
          const wrapper = mount(<NestedFragmentComponent />);
          expect(wrapper.find('.container div ~ span')).to.have.lengthOf(2);
        });

        itIf(is('>= 16.4.1'), 'should handle fragments with no content', () => {
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
    });

  describe('.findWhere(predicate)', () => {
    it('should return all elements for a truthy test', () => {
      const wrapper = mount((
        <div>
          <input className="foo" />
          <input />
        </div>
      ));
      expect(wrapper.findWhere(() => true)).to.have.lengthOf(3);
    });

    it('should return no elements for a falsy test', () => {
      const wrapper = mount((
        <div>
          <input className="foo" />
          <input />
        </div>
      ));
      expect(wrapper.findWhere(() => false)).to.have.lengthOf(0);
    });

    it('should call the predicate with the wrapped node as the first argument', () => {
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

    it('should return props object when props() is called', () => {
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

    it('should return shallow rendered string when debug() is called', () => {
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

      it('should return props object when props() is called', () => {
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

      it('should return shallow rendered string when debug() is called', () => {
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
        ['foo bar', null], // second div's contents
      ];
      expect(textContents).to.eql(expected);
    });

    it('should not pass in null or false nodes', () => {
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
  });

  describe('.setProps(newProps[, callback])', () => {
    it('should set props for a component multiple times', () => {
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
      wrapper.setProps({ id: 'bar', foo: 'bla' });
      expect(wrapper.find('.bar')).to.have.lengthOf(1);
    });

    it('should call componentWillReceiveProps for new renders', () => {
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

    it('should merge newProps with oldProps', () => {
      class Foo extends React.Component {
        render() {
          return (
            <Bar {...this.props} />
          );
        }
      }
      class Bar extends React.Component {
        render() {
          return <div />;
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

    it('should use defaultProps if new props includes undefined values', () => {
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

    it('should throw if an exception occurs during render', () => {
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

    itIf(!REACT16, 'should call the callback when setProps has completed', () => {
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

    it('should call componentWillReceiveProps, shouldComponentUpdate, componentWillUpdate, and componentDidUpdate with merged newProps', () => {
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

    describeIf(is('> 0.13'), 'stateless function components', () => {
      it('should set props for a component multiple times', () => {
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

      it('should merge newProps with oldProps', () => {
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

      it('should pass in old context', () => {
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

      it('should throw if an exception occurs during render', () => {
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
    it('should set context for a component multiple times', () => {
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

    it('should throw if it is called when shallow didn’t include context', () => {
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
      it('should set context for a component multiple times', () => {
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

      it('should throw if it is called when shallow didn’t include context', () => {
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
    it('should call componentWillUnmount()', () => {
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
    it('should simulate events', () => {
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

    it('should pass in event data', () => {
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

    it('should throw a descriptive error for invalid events', () => {
      const wrapper = mount(<div>foo</div>);
      expect(wrapper.simulate.bind(wrapper, 'invalidEvent'))
        .to.throw(TypeError, "ReactWrapper::simulate() event 'invalidEvent' does not exist");
    });

    describeIf(is('> 0.13'), 'stateless function component', () => {
      it('should pass in event data', () => {
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
      it('should convert lowercase events to React camelcase', () => {
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
        it('should convert lowercase events to React camelcase', () => {
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
    });

    it('should be batched updates', () => {
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

    it('works with .parent()/.parents()/.closest()', () => {
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

      it('parent should fire onClick', () => {
        const { wrapper, onClick } = getWrapper();

        wrapper.find('.child-elem').parent().simulate('click');
        expect(onClick).toHaveBeenCalledTimes(4);
      });
    });
  });

  describe('.setState(newState[, callback])', () => {
    it('should set the state of the root node', () => {
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

    it('should call the callback when setState has completed', () => {
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
      wrapper.setState({ id: 'bar' }, () => {
        expect(wrapper.state()).to.eql({ id: 'bar' });
      });
    });

    it('should throw error when cb is not a function', () => {
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
      expect(() => wrapper.setState({ id: 'bar' }, 1)).to.throw(Error);
    });

    itIf(is('>=15 || ^16.0.0-alpha'), 'should throw error when cb is not a function', () => {
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
      expect(() => wrapper.setState({ id: 'bar' }, 1)).to.throw(Error);
    });
  });

  describe('.is(selector)', () => {
    it('should return true when selector matches current element', () => {
      const wrapper = mount(<div className="foo bar baz" />);
      expect(wrapper.is('.foo')).to.equal(true);
    });

    it('should allow for compound selectors', () => {
      const wrapper = mount(<div className="foo bar baz" />);
      expect(wrapper.is('.foo.bar')).to.equal(true);
    });

    it('should ignore insignificant whitespace', () => {
      const className = `
      foo
      `;
      const wrapper = mount(<div className={className} />);
      expect(wrapper.is('.foo')).to.equal(true);
    });

    it('should handle all significant whitespace', () => {
      const className = `foo

      bar
      baz`;
      const wrapper = mount(<div className={className} />);
      expect(wrapper.is('.foo.bar.baz')).to.equal(true);
    });

    it('should return false when selector does not match', () => {
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

    it('should not return true for HTML elements', () => {
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
    it('should return a new wrapper of just the nodes that matched the selector', () => {
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

    it('should only look in the current wrappers nodes, not their children', () => {
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
    it('should filter only the nodes of the wrapper', () => {
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

    it('should call the predicate with the wrapper as the first argument', () => {
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

    it('should handle simple text nodes', () => {
      const wrapper = mount((
        <div>some text</div>
      ));
      expect(wrapper.text()).to.equal('some text');
    });

    it('should handle nodes with mapped children', () => {
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

    it('should render composite components smartly', () => {
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

    it('should handle html entities', () => {
      matchesRender(<div>&gt;</div>);
    });

    describeIf(is('> 0.13'), 'stateless function components', () => {
      it('should handle nodes with mapped children', () => {
        const Foo = props => (
          <div>{props.items.map(x => x)}</div>
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

      it('should render composite components smartly', () => {
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

    it('should render falsy numbers', () => {
      [0, -0, '0', NaN].forEach((x) => {
        const wrapper = mount(<div>{x}</div>);
        expect(wrapper.text()).to.equal(String(x));
      });
    });
  });

  describe('.props()', () => {
    it('should return the props object', () => {
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

    it('should be allowed to be used on an inner node', () => {
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
    it('should return the props of key `name`', () => {
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

    it('should be allowed to be used on an inner node', () => {
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

    it('should return props of root rendered node', () => {
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
      it('should return props of root rendered node', () => {
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
    it('should return the state object', () => {
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

    it('should return the current state after state transitions', () => {
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

    it('should allow a state property name be passed in as an argument', () => {
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
  });

  describe('.children([selector])', () => {
    it('should return empty wrapper for node with no children', () => {
      const wrapper = mount(<div />);
      expect(wrapper.children()).to.have.lengthOf(0);
    });

    it('should return the children nodes of the root', () => {
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

    it('should not return any of the children of children', () => {
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

    it('should handle mixed children with and without arrays', () => {
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

    it('should optionally allow a selector to filter by', () => {
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

    it('should not attempt to get an instance for text nodes', () => {
      const wrapper = mount(<div>B<span />C</div>);
      const children = wrapper.children();
      expect(children).to.have.lengthOf(1);
    });

    describeIf(is('> 0.13'), 'stateless function components', () => {
      it('should handle mixed children with and without arrays', () => {
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
  });

  describe('.childAt(index)', () => {
    it('should get a wrapped node at the specified index', () => {
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
    it('should return an array of current node’s ancestors', () => {
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

    it('should work for non-leaf nodes as well', () => {
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

    it('should optionally allow a selector', () => {
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

    it('should work with components in the tree', () => {
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
  });

  describe('.parent()', () => {
    it('should return only the immediate parent of the node', () => {
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

    it('should work for multiple nodes', () => {
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
    it('should return the closest ancestor for a given selector', () => {
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

    it('should only ever return a wrapper of a single node', () => {
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

    it('should return itself if matching', () => {
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

    it('should not find a nonexistent match', () => {
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
      it('should return whether or not node has a certain class', () => {
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
      it('should return whether or not node has a certain class', () => {
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
      it('should return whether or not node has a certain class', () => {
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
      it('should return whether or not node has a certain class', () => {
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
      it('should return whether or not node has a certain class', () => {
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
    it('should call a function for each node in the wrapper', () => {
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
    it('should call a function with a wrapper for each node in the wrapper', () => {
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

    it('should return an array with the mapped values', () => {
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

    it('should call a function with a wrapper for each node in the wrapper', () => {
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

    it('should accumulate a value', () => {
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

    it('should call a function with a wrapper for each node in the wrapper in reverse', () => {
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

    it('should accumulate a value', () => {
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
    it('should return an identical wrapper if no params are set', () => {
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

    it('should return a new wrapper if begin is set', () => {
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

    it('should return a new wrapper if begin and end are set', () => {
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

    it('should return a new wrapper if begin and end are set (negative)', () => {
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
    it('should return if a node matches a selector', () => {
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

    it('should throw if called on root', () => {
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
    it('should return if a node matches a predicate', () => {
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
    it('should return if every node matches a selector', () => {
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
    it('should return if every node matches a predicate', () => {
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
    it('should return a wrapper with the mapped and flattened nodes', () => {
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
    it('should return the first node in the current set', () => {
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
    it('should return the last node in the current set', () => {
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

    it('should display a deprecation warning', () => {
      fooNode.isEmpty();
      expect(warningStub.calledWith('Enzyme::Deprecated method isEmpty() called, use exists() instead.')).to.equal(true);
    });

    it('calls exists() instead', () => {
      const existsSpy = sinon.spy();
      fooNode.exists = existsSpy;
      fooNode.isEmpty();
      expect(existsSpy).to.have.property('called', true);
    });

    it('should return true if wrapper is empty', () => {
      expect(fooNode.isEmpty()).to.equal(false);
      expect(missingNode.isEmpty()).to.equal(true);
    });
  });

  describe('.exists()', () => {
    it('has no required arguments', () => {
      expect(ReactWrapper.prototype.exists).to.have.lengthOf(0);
    });

    describe('without arguments', () => {
      it('should return true if node exists in wrapper', () => {
        const wrapper = mount(<div className="foo" />);
        expect(wrapper.find('.bar').exists()).to.equal(false);
        expect(wrapper.find('.foo').exists()).to.equal(true);
      });
    });
    describe('with argument', () => {
      it('should return .find(arg).exists() instead', () => {
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

  describe('.html()', () => {
    it('should return html of straight DOM elements', () => {
      const wrapper = mount((
        <div className="test">
          <span>Hello World!</span>
        </div>
      ));
      expect(wrapper.html()).to.equal('<div class="test"><span>Hello World!</span></div>');
    });

    it('should render out nested composite components', () => {
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
      it('should render out nested composite components', () => {
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
  });

  describe('.unmount()', () => {
    it('should call componentWillUnmount()', () => {
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
    it('should return a cheerio wrapper around the current node', () => {
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
    });

    describeIf(is('> 0.13'), 'stateless function components', () => {
      it('should return a cheerio wrapper around the current node', () => {
        const Foo = () => <div className="in-foo" />;
        const Bar = () => (
          <div className="in-bar">
            <Foo />
          </div>
        );
        const wrapper = mount(<Bar />);
        expect(wrapper.render().find('.in-foo')).to.have.lengthOf(1);
      });
    });
  });

  describe('attachTo option', () => {
    it('should attach and stuff', () => {
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

    it('should allow for multiple attaches/detaches on same node', () => {
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
    it('should call the passed function with current ShallowWrapper and returns itself', () => {
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
    it('should return the key of the node', () => {
      const wrapper = mount((
        <ul>
          {['foo', 'bar', ''].map(s => <li key={s}>{s}</li>)}
        </ul>
      )).find('li');
      expect(wrapper.at(0).key()).to.equal('foo');
      expect(wrapper.at(1).key()).to.equal('bar');
      expect(wrapper.at(2).key()).to.equal('');
    });

    it('should return null when no key is specified', () => {
      const wrapper = mount((
        <ul>
          <li>foo</li>
        </ul>
      )).find('li');
      expect(wrapper.key()).to.equal(null);
    });
  });

  describe('.matchesElement(node)', () => {
    it('should match on a root node that looks like the rendered one', () => {
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
    it('should not match on a root node that doesn\'t looks like the rendered one', () => {
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

    describeIf(is('> 0.13'), 'stateless function components', () => {
      it('should attach and stuff', () => {
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

      it('should allow for multiple attaches/detaches on same node', () => {
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

  describe('.containsMatchingElement(node)', () => {
    it('should match a root node that looks like the rendered one', () => {
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

    it('should match on a single node that looks like a rendered one', () => {
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

    it('should not match on a single node that doesn\'t looks like a rendered one', () => {
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

    it('should not differentiate between absence, null, or undefined', () => {
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
  });

  describe('.containsAllMatchingElements(nodes)', () => {
    it('should throw TypeError if non-array passed in', () => {
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

    it('should match on array of nodes that each look like rendered nodes, with nested elements', () => {
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

    it('should match on an array of nodes that all looks like one of rendered nodes', () => {
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
    it('should not match on nodes that doesn\'t all looks like one of rendered nodes', () => {
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
    it('should match on an array with at least one node that looks like a rendered nodes', () => {
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
    it('should not match on an array with no nodes that looks like a rendered nodes', () => {
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
        it('should return the displayName of the node', () => {
          class Foo extends React.Component {
            render() { return <div />; }
          }

          Foo.displayName = 'CustomWrapper';

          const wrapper = mount(<Foo />);
          expect(wrapper.name()).to.equal('CustomWrapper');
        });

        describeIf(is('> 0.13'), 'stateless function components', () => {
          it('should return the name of the node', () => {
            function SFC() {
              return <div />;
            }

            SFC.displayName = 'CustomWrapper';

            const wrapper = mount(<SFC />);
            expect(wrapper.name()).to.equal('CustomWrapper');
          });
        });

        describe('createClass', () => {
          it('should return the name of the node', () => {
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
        it('should return the name of the node', () => {
          class Foo extends React.Component {
            render() { return <div />; }
          }

          const wrapper = mount(<Foo />);
          expect(wrapper.name()).to.equal('Foo');
        });

        describeIf(is('> 0.13'), 'stateless function components', () => {
          it('should return the name of the node', () => {
            function SFC() {
              return <div />;
            }

            const wrapper = mount(<SFC />);
            expect(wrapper.name()).to.equal('SFC');
          });
        });
      });

      describe('DOM node', () => {
        it('should return the name of the node', () => {
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
    it('should be iterable', () => {
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

    it('should return the wrapped component instance', () => {
      const wrapper = mount(<Test />);
      expect(wrapper.instance()).to.be.an.instanceof(Test);
    });

    it('should throw when wrapping multiple elements', () => {
      const wrapper = mount(<Test />).find('span');
      expect(() => wrapper.instance()).to.throw(Error);
    });
  });

  describe('.getElement()', () => {
    it('returns nodes with refs as well as well', () => {
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
      expect(wrapper.getElement().key).to.equal(null);
    });
  });

  describe('.getElements()', () => {
    it('should return the wrapped elements', () => {
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

    it('should have updated output after an asynchronous setState', () => {
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

    it('should have updated output after child prop callback invokes setState', () => {
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

    it('should return the outermost DOMComponent of the root wrapper', () => {
      const wrapper = mount(<Test />);
      expect(wrapper.getDOMNode()).to.have.property('className', 'outer');
    });

    it('should return the outermost DOMComponent of the inner div wrapper', () => {
      const wrapper = mount(<Test />);
      expect(wrapper.find('.inner').getDOMNode()).to.have.property('className', 'inner');
    });

    it('should throw when wrapping multiple elements', () => {
      const wrapper = mount(<Test />).find('span');
      expect(() => wrapper.getDOMNode()).to.throw(
        Error,
        'Method “getDOMNode” is only meant to be run on a single node. 2 found instead.',
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

      it('should return the outermost DOMComponent of the root wrapper', () => {
        const wrapper = mount(<SFC />);
        expect(wrapper.getDOMNode()).to.have.property('className', 'outer');
      });

      it('should return the outermost DOMComponent of the inner div wrapper', () => {
        const wrapper = mount(<SFC />);
        expect(wrapper.find('.inner').getDOMNode()).to.have.property('className', 'inner');
      });

      it('should throw when wrapping multiple elements', () => {
        const wrapper = mount(<SFC />).find('span');
        expect(() => wrapper.getDOMNode()).to.throw(
          Error,
          'Method “getDOMNode” is only meant to be run on a single node. 2 found instead.',
        );
      });
    });
  });

  describe('#single()', () => {
    it('throws if run on multiple nodes', () => {
      const wrapper = mount(<div><i /><i /></div>).children();
      expect(wrapper).to.have.lengthOf(2);
      expect(() => wrapper.single('name!')).to.throw(
        Error,
        'Method “name!” is only meant to be run on a single node. 2 found instead.',
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

    it('should be able to get the latest state value', () => {
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

    it('should be able to get the latest state value', () => {
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
            key: i,
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
    it('should call `componentDidUpdate` when component’s `setState` is called', () => {
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

      const wrapper = mount(<Foo />);
      wrapper.setState({ foo: 'wrapper setState update' });
      expect(wrapper.state('foo')).to.equal('wrapper setState update');
      expect(spy).to.have.property('callCount', 1);
      wrapper.instance().onChange();
      expect(wrapper.state('foo')).to.equal('onChange update');
      expect(spy).to.have.property('callCount', 2);
    });

    it('should call `componentDidUpdate` when component’s `setState` is called through a bound method', () => {
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
  });
});
