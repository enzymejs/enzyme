import React from 'react';
import { expect } from 'chai';
import { shallow, render, ShallowWrapper } from '../src/';
import sinon from 'sinon';
import { describeIf, itIf, itWithData, generateEmptyRenderData } from './_helpers';
import { REACT013, REACT15 } from '../src/version';

describe('shallow', () => {

  describe('context', () => {
    it('can pass in context', () => {
      const SimpleComponent = React.createClass({
        contextTypes: {
          name: React.PropTypes.string,
        },
        render() {
          return <div>{this.context.name}</div>;
        },
      });

      const context = { name: 'foo' };
      const wrapper = shallow(<SimpleComponent />, { context });
      expect(wrapper.text()).to.equal('foo');
    });

    it('should not throw if context is passed in but contextTypes is missing', () => {
      const SimpleComponent = React.createClass({
        render() {
          return <div>{this.context.name}</div>;
        },
      });

      const context = { name: 'foo' };
      expect(() => shallow(<SimpleComponent />, { context })).to.not.throw(Error);
    });

    it('is instrospectable through context API', () => {
      const SimpleComponent = React.createClass({
        contextTypes: {
          name: React.PropTypes.string,
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

    describeIf(!REACT013, 'stateless function components', () => {
      it('can pass in context', () => {
        const SimpleComponent = (props, context) => (
          <div>{context.name}</div>
        );
        SimpleComponent.contextTypes = { name: React.PropTypes.string };

        const context = { name: 'foo' };
        const wrapper = shallow(<SimpleComponent />, { context });
        expect(wrapper.text()).to.equal('foo');
      });

      it('should not throw if context is passed in but contextTypes is missing', () => {
        const SimpleComponent = (props, context) => (
          <div>{context.name}</div>
        );

        const context = { name: 'foo' };
        expect(() => shallow(<SimpleComponent />, { context })).not.to.throw(Error);
      });

      it('is instrospectable through context API', () => {
        const SimpleComponent = (props, context) => (
          <div>{context.name}</div>
        );
        SimpleComponent.contextTypes = { name: React.PropTypes.string };

        const wrapper = shallow(<SimpleComponent />, { context });

        expect(wrapper.context().name).to.equal(context.name);
        expect(wrapper.context('name')).to.equal(context.name);
      });
    });
  });

  describeIf(!REACT013, 'stateless function components', () => {
    it('works with stateless components', () => {
      const Foo = ({ foo }) => (
        <div>
          <div className="bar">bar</div>
          <div className="qoo">{foo}</div>
        </div>
      );
      const wrapper = shallow(<Foo foo="qux" />);
      expect(wrapper.type()).to.equal('div');
      expect(wrapper.find('.bar')).to.have.length(1);
      expect(wrapper.find('.qoo').text()).to.equal('qux');
    });
  });

  describe('.instance()', () => {

    it('should return the component instance', () => {
      class Foo extends React.Component {
        render() { return <div />; }
      }

      const wrapper = shallow(<Foo />);
      expect(wrapper.instance()).to.be.instanceof(Foo);
      expect(wrapper.instance().render).to.equal(Foo.prototype.render);
    });

    it('should throw if called on something other than the root node', () => {
      class Foo extends React.Component {
        render() { return <div><a /></div>; }
      }

      const wrapper = shallow(<Foo />);
      const div = wrapper.find('div');

      expect(() => div.instance()).to.throw();
    });

  });

  describe('.contains(node)', () => {

    it('should allow matches on the root node', () => {
      const a = <div className="foo" />;
      const b = <div className="foo" />;
      const c = <div className="bar" />;
      expect(shallow(a).contains(b)).to.equal(true);
      expect(shallow(a).contains(c)).to.equal(false);
    });

    it('should allow matches on a nested node', () => {
      const wrapper = shallow(
        <div>
          <div className="foo" />
        </div>
      );
      const b = <div className="foo" />;
      expect(wrapper.contains(b)).to.equal(true);
    });

    it('should match composite components', () => {
      class Foo extends React.Component {
        render() { return <div />; }
      }
      const wrapper = shallow(
        <div>
          <Foo />
        </div>
      );
      const b = <Foo />;
      expect(wrapper.contains(b)).to.equal(true);
    });

    it('should work with strings', () => {
      const wrapper = shallow(<div>foo</div>);

      expect(wrapper.contains('foo')).to.equal(true);
      expect(wrapper.contains('bar')).to.equal(false);
    });

    it('should work with numbers', () => {
      const wrapper = shallow(<div>{1}</div>);

      expect(wrapper.contains(1)).to.equal(true);
      expect(wrapper.contains(2)).to.equal(false);
      expect(wrapper.contains('1')).to.equal(false);
    });

    it('should work with nested strings & numbers', () => {
      const wrapper = shallow(
        <div>
          <div>
            <div>{5}</div>
          </div>
          <div>foo</div>
        </div>
      );

      expect(wrapper.contains('foo')).to.equal(true);
      expect(wrapper.contains(<div>foo</div>)).to.equal(true);

      expect(wrapper.contains(5)).to.equal(true);
      expect(wrapper.contains(<div>{5}</div>)).to.equal(true);
    });

    it('should do something with arrays of nodes', () => {
      const wrapper = shallow(
        <div>
          <span>Hello</span>
          <div>Goodbye</div>
          <span>More</span>
        </div>
      );
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

    it('should throw on invalid argument', () => {
      const wrapper = shallow(<div></div>);

      expect(() => wrapper.contains({})).to.throw();
      expect(() => wrapper.contains(() => ({}))).to.throw();
    });

    describeIf(!REACT013, 'stateless function components', () => {
      it('should match composite components', () => {
        const Foo = () => (
          <div />
        );

        const wrapper = shallow(
          <div>
            <Foo />
          </div>
        );
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
      expect(shallow(a).equals(b)).to.equal(true);
      expect(shallow(a).equals(c)).to.equal(false);
    });

    it('should NOT allow matches on a nested node', () => {
      const wrapper = shallow(
        <div>
          <div className="foo" />
        </div>
      );
      const b = <div className="foo" />;
      expect(wrapper.equals(b)).to.equal(false);
    });

    it('should match composite components', () => {
      class Foo extends React.Component {
        render() { return <div />; }
      }
      const wrapper = shallow(
        <div>
          <Foo />
        </div>
      );
      const b = <div><Foo /></div>;
      expect(wrapper.equals(b)).to.equal(true);
    });

    it('should not expand `node` content', () => {
      class Bar extends React.Component {
        render() { return <div />; }
      }

      class Foo extends React.Component {
        render() { return <Bar />; }
      }

      expect(shallow(<Foo />).equals(<Bar />)).to.equal(true);
      expect(shallow(<Foo />).equals(<Foo />)).to.equal(false);
    });

    describeIf(!REACT013, 'stateless components', () => {
      it('should match composite stateless components', () => {
        const Foo = () => (
          <div />
        );

        const wrapper = shallow(
          <div>
            <Foo />
          </div>
        );
        const b = <div><Foo /></div>;
        expect(wrapper.equals(b)).to.equal(true);
      });

      it('should not expand `node` content', () => {
        const Bar = () => (
          <div />
        );

        const Foo = () => (
          <Bar />
        );

        expect(shallow(<Foo />).equals(<Bar />)).to.equal(true);
        expect(shallow(<Foo />).equals(<Foo />)).to.equal(false);
      });
    });

  });

  describe('.find(selector)', () => {

    it('should be able to match the root DOM element', () => {
      const wrapper = shallow(<div id="ttt" className="ttt">hello</div>);
      expect(wrapper.find('#ttt')).to.have.length(1);
      expect(wrapper.find('.ttt')).to.have.length(1);
    });

    it('should find an element based on a class name', () => {
      const wrapper = shallow(
        <div>
          <input className="foo" />
        </div>
      );
      expect(wrapper.find('.foo').type()).to.equal('input');
    });

    it('should find an element based on a tag name and class name', () => {
      const wrapper = shallow(
        <div>
          <input className="foo" />
        </div>
      );
      expect(wrapper.find('input.foo').length).to.equal(1);
    });

    it('should find an element based on a tag name and id', () => {
      const wrapper = shallow(
        <div>
          <input id="foo" />
        </div>
      );
      expect(wrapper.find('input#foo').length).to.equal(1);
    });

    it('should find an element based on a tag name, id, and class name', () => {
      const wrapper = shallow(
        <div>
          <input id="foo" className="bar" />
        </div>
      );
      expect(wrapper.find('input#foo.bar').length).to.equal(1);
    });

    it('should find an element based on a tag name', () => {
      const wrapper = shallow(
        <div>
          <input className="foo" />
          <button className="bar">Button</button>
          <textarea className="magic"></textarea>
          <select className="reality"></select>
        </div>
      );
      expect(wrapper.find('input').props().className).to.equal('foo');
      expect(wrapper.find('button').props().className).to.equal('bar');
      expect(wrapper.find('textarea').props().className).to.equal('magic');
      expect(wrapper.find('select').props().className).to.equal('reality');
    });

    it('should find a component based on a constructor', () => {
      class Foo extends React.Component {
        render() { return <div />; }
      }
      const wrapper = shallow(
        <div>
          <Foo className="foo" />
        </div>
      );
      expect(wrapper.find(Foo).type()).to.equal(Foo);
    });

    it('should find a component based on a display name', () => {
      class Foo extends React.Component {
        render() { return <div />; }
      }
      const wrapper = shallow(
        <div>
          <Foo className="foo" />
        </div>
      );
      expect(wrapper.find('Foo').type()).to.equal(Foo);
    });

    it('should find multiple elements based on a class name', () => {
      const wrapper = shallow(
        <div>
          <input className="foo" />
          <button className="foo" />
        </div>
      );
      expect(wrapper.find('.foo').length).to.equal(2);
    });

    it('should find multiple elements based on a tag name', () => {
      const wrapper = shallow(
        <div>
          <input className="foo" />
          <input />
          <button />
        </div>
      );
      expect(wrapper.find('input').length).to.equal(2);
      expect(wrapper.find('button').length).to.equal(1);
    });

    it('should find component based on a react prop', () => {
      const wrapper = shallow(
        <div>
          <span title="foo" />
        </div>
      );

      expect(wrapper.find('[title="foo"]')).to.have.length(1);
      expect(wrapper.find('[title]')).to.have.length(1);
    });

    it('should error sensibly if prop selector without quotes', () => {
      const wrapper = shallow(
        <div>
          <input type="text" />
          <input type="hidden" />
        </div>
      );

      expect(() => wrapper.find('[type=text]')).to.throw();
    });

    it('should compound tag and prop selector', () => {
      const wrapper = shallow(
        <div>
          <span preserveAspectRatio="xMaxYMax" />
        </div>
      );

      expect(wrapper.find('span[preserveAspectRatio="xMaxYMax"]')).to.have.length(1);
      expect(wrapper.find('span[preserveAspectRatio]')).to.have.length(1);
    });

    it('should support data prop selectors', () => {
      const wrapper = shallow(
        <div>
          <span data-foo="bar" />
        </div>
      );

      expect(wrapper.find('[data-foo="bar"]')).to.have.length(1);
      expect(wrapper.find('[data-foo]')).to.have.length(1);
    });

    it('should find components with multiple matching react props', () => {
      function noop() {}
      const wrapper = shallow(
        <div>
          <span htmlFor="foo" onChange={noop} preserveAspectRatio="xMaxYMax" />
        </div>
      );

      expect(wrapper.find('span[htmlFor="foo"][onChange]')).to.have.length(1);
      expect(wrapper.find('span[htmlFor="foo"][preserveAspectRatio="xMaxYMax"]')).to.have.length(1);
      expect(wrapper.find('[htmlFor][preserveAspectRatio]')).to.have.length(1);
    });

    it('should support boolean and numeric values for matching props', () => {
      const wrapper = shallow(
        <div>
          <span value={1} />
          <a value={false} />
        </div>
      );

      expect(wrapper.find('span[value=1]')).to.have.length(1);
      expect(wrapper.find('span[value=2]')).to.have.length(0);
      expect(wrapper.find('a[value=false]')).to.have.length(1);
      expect(wrapper.find('a[value=true]')).to.have.length(0);
    });

    it('should not find key or ref via property selector', () => {
      const arrayOfComponents = [<div key="1" />, <div key="2" />];
      const wrapper = shallow(
        <div>
          <div ref="foo" />
          {arrayOfComponents}
        </div>
      );

      expect(wrapper.find('div[ref="foo"]')).to.have.length(0);
      expect(wrapper.find('div[key="1"]')).to.have.length(0);
      expect(wrapper.find('[ref]')).to.have.length(0);
      expect(wrapper.find('[key]')).to.have.length(0);
    });

    it('should find multiple elements based on a constructor', () => {
      const wrapper = shallow(
        <div>
          <input className="foo" />
          <input />
          <button />
        </div>
      );
      expect(wrapper.find('input').length).to.equal(2);
      expect(wrapper.find('button').length).to.equal(1);
    });

    it('should support object property selectors', () => {
      const wrapper = shallow(
        <div>
          <input data-test="ref" className="foo" type="text" />
          <input data-test="ref" type="text" />
          <button data-test="ref" prop={undefined} />
          <span data-test="ref" prop={null} />
          <div data-test="ref" prop={123} />
          <input data-test="ref" prop={false} />
          <a data-test="ref" prop />
        </div>
      );
      expect(wrapper.find({ a: 1 })).to.have.length(0);
      expect(wrapper.find({ 'data-test': 'ref' })).to.have.length(7);
      expect(wrapper.find({ className: 'foo' })).to.have.length(1);
      expect(wrapper.find({ prop: undefined })).to.have.length(1);
      expect(wrapper.find({ prop: null })).to.have.length(1);
      expect(wrapper.find({ prop: 123 })).to.have.length(1);
      expect(wrapper.find({ prop: false })).to.have.length(1);
      expect(wrapper.find({ prop: true })).to.have.length(1);
    });

    it('should support complex and nested object property selectors', () => {
      const testFunction = () => ({});
      const wrapper = shallow(
        <div>
          <span more={[{ id: 1 }]} data-test="ref" prop onChange={testFunction} />
          <a more={[{ id: 1 }]} data-test="ref" />
          <div more={{ item: { id: 1 } }} data-test="ref" />
          <input style={{ height: 20 }} data-test="ref" />
        </div>
      );
      expect(wrapper.find({ 'data-test': 'ref' })).to.have.length(4);
      expect(wrapper.find({ more: { a: 1 } })).to.have.length(0);
      expect(wrapper.find({ more: [{ id: 1 }] })).to.have.length(2);
      expect(wrapper.find({ more: { item: { id: 1 } } })).to.have.length(1);
      expect(wrapper.find({ style: { height: 20 } })).to.have.length(1);
      expect(wrapper
        .find({ more: [{ id: 1 }], 'data-test': 'ref', prop: true, onChange: testFunction })
      ).to.have.length(1);
    });

    it('should throw when given empty object, null, or an array', () => {
      const wrapper = shallow(
        <div>
          <input className="foo" type="text" />
        </div>
      );
      expect(() => wrapper.find({})).to.throw(Error);
      expect(() => wrapper.find([])).to.throw(Error);
      expect(() => wrapper.find(null)).to.throw(Error);
    });

    describeIf(!REACT013, 'stateless function components', () => {
      it('should find a component based on a constructor', () => {
        const Foo = () => (
          <div />
        );
        const wrapper = shallow(
          <div>
            <Foo className="foo" />
          </div>
        );
        expect(wrapper.find(Foo).type()).to.equal(Foo);
      });

      it('should find a component based on a display name', () => {
        const Foo = () => (
          <div />
        );
        const wrapper = shallow(
          <div>
            <Foo className="foo" />
          </div>
        );
        expect(wrapper.find('Foo').type()).to.equal(Foo);
      });
    });
  });

  describe('.findWhere(predicate)', () => {

    it('should return all elements for a truthy test', () => {
      const wrapper = shallow(
        <div>
          <input className="foo" />
          <input />
        </div>
      );
      expect(wrapper.findWhere(() => true).length).to.equal(3);
    });

    it('should return no elements for a falsy test', () => {
      const wrapper = shallow(
        <div>
          <input className="foo" />
          <input />
        </div>
      );
      expect(wrapper.findWhere(() => false).length).to.equal(0);
    });

    it('should call the predicate with the wrapped node as the first argument', () => {
      const wrapper = shallow(
        <div>
          <div className="foo bar" />
          <div className="foo baz" />
          <div className="foo bux" />
        </div>
      );

      const stub = sinon.stub();
      stub.returns(true);
      const spy = sinon.spy(stub);
      wrapper.findWhere(spy);
      expect(spy.callCount).to.equal(4);
      expect(spy.args[0][0]).to.be.instanceOf(ShallowWrapper);
      expect(spy.args[1][0]).to.be.instanceOf(ShallowWrapper);
      expect(spy.args[2][0]).to.be.instanceOf(ShallowWrapper);
      expect(spy.args[3][0]).to.be.instanceOf(ShallowWrapper);
      expect(spy.args[1][0].hasClass('bar')).to.equal(true);
      expect(spy.args[2][0].hasClass('baz')).to.equal(true);
      expect(spy.args[3][0].hasClass('bux')).to.equal(true);
    });

    describeIf(!REACT013, 'stateless function components', () => {
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
        expect(foundNotSpan).to.have.length(0);
      });
    });

    it('should not pass in null or false nodes', () => {
      const wrapper = shallow(
        <div>
          <div className="foo bar" />
          {null}
          {false}
        </div>
      );
      const stub = sinon.stub();
      stub.returns(true);
      const spy = sinon.spy(stub);
      wrapper.findWhere(spy);
      expect(spy.callCount).to.equal(2);
    });

  });

  describe('.setProps(newProps)', () => {

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
      const wrapper = shallow(<Foo id="foo" />);
      expect(wrapper.find('.foo').length).to.equal(1);
      wrapper.setProps({ id: 'bar', foo: 'bla' });
      expect(wrapper.find('.bar').length).to.equal(1);
    });

    it('should call componentWillReceiveProps for new renders', () => {

      const spy = sinon.spy();

      class Foo extends React.Component {
        constructor(props) {
          super(props);
          this.componentWillReceiveProps = spy;
        }
        render() {
          return (
            <div className={this.props.id}>
              {this.props.id}
            </div>
          );
        }
      }
      const nextProps = { id: 'bar', foo: 'bla' };
      const wrapper = shallow(<Foo id="foo" />);
      expect(spy.calledOnce).to.equal(false);
      wrapper.setProps(nextProps);
      expect(spy.calledOnce).to.equal(true);
      expect(spy.calledWith(nextProps)).to.equal(true);
    });

    it('should merge newProps with oldProps', () => {
      class Foo extends React.Component {
        render() {
          return (
            <div {...this.props} />
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

    it('should pass in old context', () => {
      class Foo extends React.Component {
        render() {
          return (
            <div>{this.context.x}</div>
          );
        }
      }

      Foo.contextTypes = { x: React.PropTypes.string };

      const context = { x: 'yolo' };
      const wrapper = shallow(<Foo x={5} />, { context });
      expect(wrapper.first('div').text()).to.equal('yolo');

      wrapper.setProps({ x: 5 }); // Just force a re-render
      expect(wrapper.first('div').text()).to.equal('yolo');
    });

    describeIf(!REACT013, 'stateless function components', () => {
      it('should set props for a component multiple times', () => {
        const Foo = (props) => (
          <div className={props.id}>
            {props.id}
          </div>
        );

        const wrapper = shallow(<Foo id="foo" />);
        expect(wrapper.find('.foo').length).to.equal(1);
        wrapper.setProps({ id: 'bar', foo: 'bla' });
        expect(wrapper.find('.bar').length).to.equal(1);
      });

      it('should merge newProps with oldProps', () => {
        const Foo = (props) => (
          <div {...props} />
        );

        const wrapper = shallow(<Foo a="a" b="b" />);
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
        Foo.contextTypes = { x: React.PropTypes.string };

        const context = { x: 'yolo' };
        const wrapper = shallow(<Foo x={5} />, { context });
        expect(wrapper.first('div').text()).to.equal('yolo');

        wrapper.setProps({ x: 5 }); // Just force a re-render
        expect(wrapper.first('div').text()).to.equal('yolo');
      });
    });
  });

  describe('.setContext(newContext)', () => {
    const SimpleComponent = React.createClass({
      contextTypes: {
        name: React.PropTypes.string,
      },
      render() {
        return <div>{this.context.name}</div>;
      },
    });

    it('should set context for a component multiple times', () => {
      const context = { name: 'foo' };
      const wrapper = shallow(<SimpleComponent />, { context });
      expect(wrapper.text()).to.equal('foo');
      wrapper.setContext({ name: 'bar' });
      expect(wrapper.text()).to.equal('bar');
      wrapper.setContext({ name: 'baz' });
      expect(wrapper.text()).to.equal('baz');
    });

    it('should throw if it is called when shallow didnt include context', () => {
      const wrapper = shallow(<SimpleComponent />);
      expect(() => wrapper.setContext({ name: 'bar' })).to.throw(Error);
    });

    describeIf(!REACT013, 'stateless function components', () => {
      const SFC = (props, context) => (
        <div>{context.name}</div>
      );
      SFC.contextTypes = { name: React.PropTypes.string };

      it('should set context for a component multiple times', () => {
        const context = { name: 'foo' };
        const wrapper = shallow(<SFC />, { context });
        expect(wrapper.text()).to.equal('foo');
        wrapper.setContext({ name: 'bar' });
        expect(wrapper.text()).to.equal('bar');
        wrapper.setContext({ name: 'baz' });
        expect(wrapper.text()).to.equal('baz');
      });

      it('should throw if it is called when shallow didnt include context', () => {
        const wrapper = shallow(<SFC />);
        expect(() => wrapper.setContext({ name: 'bar' })).to.throw(Error);
      });
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
          this.setState({ count: this.state.count + 1 });
        }

        render() {
          return (
            <a
              className={`clicks-${this.state.count}`}
              onClick={this.incrementCount}
            >foo</a>
          );
        }
      }

      const wrapper = shallow(<Foo />);

      expect(wrapper.find('.clicks-0').length).to.equal(1);
      wrapper.simulate('click');
      expect(wrapper.find('.clicks-1').length).to.equal(1);

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

      const wrapper = shallow(<Foo />);
      const a = {};
      const b = {};

      wrapper.simulate('click', a, b);
      expect(spy.args[0][0]).to.equal(a);
      expect(spy.args[0][1]).to.equal(b);
    });

    describeIf(!REACT013, 'stateless function components', () => {
      it('should simulate events', () => {
        const spy = sinon.spy();
        const Foo = (props) => (
          <a onClick={props.onClick}>foo</a>
        );

        const wrapper = shallow(<Foo onClick={spy} />);

        expect(spy.calledOnce).to.equal(false);
        wrapper.find('a').simulate('click');
        expect(spy.calledOnce).to.equal(true);
      });


      it('should pass in event data', () => {
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

        const wrapper = shallow(<Foo />);

        wrapper.simulate('dblclick');
        expect(spy.calledOnce).to.equal(true);

        wrapper.simulate('click');
        expect(clickSpy.calledOnce).to.equal(true);
      });

      describeIf(!REACT013, 'normalizing mouseenter', () => {
        it('should convert lowercase events to React camelcase', () => {
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
          expect(spy.calledOnce).to.equal(true);
        });

        it('should convert lowercase events to React camelcase in stateless components', () => {
          const spy = sinon.spy();
          const Foo = () => (
            <a onMouseEnter={spy}>foo</a>
          );

          const wrapper = shallow(<Foo />);

          wrapper.simulate('mouseenter');
          expect(spy.calledOnce).to.equal(true);
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
          ++renderCount;
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

  });

  describe('.setState(newState)', () => {
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
      const wrapper = shallow(<Foo />);
      expect(wrapper.find('.foo').length).to.equal(1);
      wrapper.setState({ id: 'bar' });
      expect(wrapper.find('.bar').length).to.equal(1);
    });

    describeIf(!REACT013, 'stateless function components', () => {
      it('should throw when trying to access state', () => {
        const Foo = () => (
          <div>abc</div>
        );

        const wrapper = shallow(<Foo />);

        expect(() => wrapper.state()).to.throw();
      });

      it('should throw when trying to set state', () => {
        const Foo = () => (
          <div>abc</div>
        );

        const wrapper = shallow(<Foo />);

        expect(() => wrapper.setState({ a: 1 })).to.throw();
      });
    });
  });

  describe('.is(selector)', () => {
    it('should return true when selector matches current element', () => {
      const wrapper = shallow(<div className="foo bar baz" />);
      expect(wrapper.is('.foo')).to.equal(true);
    });

    it('should allow for compound selectors', () => {
      const wrapper = shallow(<div className="foo bar baz" />);
      expect(wrapper.is('.foo.bar')).to.equal(true);
    });

    it('should ignore insignificant whitespace', () => {
      const className = `foo
      `;
      const wrapper = shallow(<div className={className} />);
      expect(wrapper.is('.foo')).to.equal(true);
    });

    it('should handle all significant whitespace', () => {
      const className = `foo

      bar
      baz`;
      const wrapper = shallow(<div className={className} />);
      expect(wrapper.is('.foo.bar.baz')).to.equal(true);
    });

    it('should return false when selector does not match', () => {
      const wrapper = shallow(<div className="bar baz" />);
      expect(wrapper.is('.foo')).to.equal(false);
    });
  });

  describe('.isEmptyRender()', () => {
    const emptyRenderValues = generateEmptyRenderData();

    itWithData(emptyRenderValues, 'when a React class component returns: ', (data) => {
      const Foo = React.createClass({
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

    it('should not return true for HTML elements', () => {
      const wrapper = shallow(<div className="bar baz" />);
      expect(wrapper.isEmptyRender()).to.equal(false);
    });

    describeIf(REACT15, 'stateless function components', () => {
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
      const wrapper = shallow(
        <div>
          <div className="foo bar baz" />
          <div className="foo" />
          <div className="bar baz" />
          <div className="baz" />
          <div className="foo bar" />
        </div>
      );

      expect(wrapper.find('.foo').not('.bar').length).to.equal(1);
      expect(wrapper.find('.baz').not('.foo').length).to.equal(2);
      expect(wrapper.find('.foo').not('div').length).to.equal(0);
    });
  });

  describe('.filter(selector)', () => {
    it('should return a new wrapper of just the nodes that matched the selector', () => {
      const wrapper = shallow(
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
      );

      expect(wrapper.find('.foo').filter('.bar').length).to.equal(3);
      expect(wrapper.find('.bar').filter('.foo').length).to.equal(3);
      expect(wrapper.find('.bar').filter('.bax').length).to.equal(0);
      expect(wrapper.find('.foo').filter('.baz.bar').length).to.equal(2);
    });

    it('should only look in the current wrappers nodes, not their children', () => {
      const wrapper = shallow(
        <div>
          <div className="foo">
            <div className="bar" />
          </div>
          <div className="foo bar" />
        </div>
      );

      expect(wrapper.find('.foo').filter('.bar').length).to.equal(1);
    });
  });

  describe('.filterWhere(predicate)', () => {
    it('should filter only the nodes of the wrapper', () => {
      const wrapper = shallow(
        <div>
          <div className="foo bar" />
          <div className="foo baz" />
          <div className="foo bux" />
        </div>
      );

      const stub = sinon.stub();
      stub.onCall(0).returns(false);
      stub.onCall(1).returns(true);
      stub.onCall(2).returns(false);

      const baz = wrapper.find('.foo').filterWhere(stub);
      expect(baz.length).to.equal(1);
      expect(baz.hasClass('baz')).to.equal(true);
    });

    it('should call the predicate with the wrapped node as the first argument', () => {
      const wrapper = shallow(
        <div>
          <div className="foo bar" />
          <div className="foo baz" />
          <div className="foo bux" />
        </div>
      );

      const stub = sinon.stub();
      stub.returns(true);
      const spy = sinon.spy(stub);
      wrapper.find('.foo').filterWhere(spy);
      expect(spy.callCount).to.equal(3);
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

    it('should handle simple text nodes', () => {
      const wrapper = shallow(
        <div>some text</div>
      );
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
      matchesRender(
        <Foo
          items={[
            <i key={1}>abc</i>,
            <i key={2}>def</i>,
            <i key={3}>hij</i>,
          ]}
        />
      );
    });

    it('should render composite components dumbly', () => {
      class Foo extends React.Component {
        render() { return <div />; }
      }
      const wrapper = shallow(
        <div>
          <Foo />
          <div>test</div>
        </div>
      );
      expect(wrapper.text()).to.equal('<Foo />test');
    });

    it('should handle html entities', () => {
      matchesRender(<div>&gt;</div>);
    });

    describeIf(!REACT013, 'stateless function components', () => {
      it('should handle nodes with mapped children', () => {
        const Foo = (props) => (
          <div>
            {props.items.map(x => x)}
          </div>
        );
        matchesRender(<Foo items={['abc', 'def', 'hij']} />);
        matchesRender(
          <Foo
            items={[
              <i key={1}>abc</i>,
              <i key={2}>def</i>,
              <i key={3}>hij</i>,
            ]}
          />
        );
      });

      it('should render composite components dumbly', () => {
        const Foo = () => (
          <div />
        );

        const wrapper = shallow(
          <div>
            <Foo />
            <div>test</div>
          </div>
        );
        expect(wrapper.text()).to.equal('<Foo />test');
      });
    });

  });

  describe('.props()', () => {

    it('should return the props object', () => {
      const fn = () => ({});
      const wrapper = shallow(
        <div id="fooId" className="bax" onClick={fn} >
          <div className="baz" />
          <div className="foo" />
        </div>
      );

      expect(wrapper.props().className).to.equal('bax');
      expect(wrapper.props().onClick).to.equal(fn);
      expect(wrapper.props().id).to.equal('fooId');

    });

    it('should be allowed to be used on an inner node', () => {
      const fn = () => ({});
      const wrapper = shallow(
        <div className="bax">
          <div className="baz" onClick={fn} />
          <div className="foo" id="fooId" />
        </div>
      );

      expect(wrapper.find('.baz').props().onClick).to.equal(fn);
      expect(wrapper.find('.foo').props().id).to.equal('fooId');
    });

    it('should return props of root rendered node', () => {
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

    describeIf(!REACT013, 'stateless function components', () => {
      it('should return props of root rendered node', () => {
        const Foo = ({ bar, foo }) => (
          <div className={bar} id={foo} />
        );

        const wrapper = shallow(<Foo foo="hi" bar="bye" />);

        expect(wrapper.props()).to.eql({ className: 'bye', id: 'hi' });
      });
    });
  });

  describe('.prop(name)', () => {

    it('should return the props of key `name`', () => {
      const fn = () => ({});
      const wrapper = shallow(
        <div id="fooId" className="bax" onClick={fn} >
          <div className="baz" />
          <div className="foo" />
        </div>
      );

      expect(wrapper.prop('className')).to.equal('bax');
      expect(wrapper.prop('onClick')).to.equal(fn);
      expect(wrapper.prop('id')).to.equal('fooId');

    });

    it('should be allowed to be used on an inner node', () => {
      const fn = () => ({});
      const wrapper = shallow(
        <div className="bax">
          <div className="baz" onClick={fn} />
          <div className="foo" id="fooId" />
        </div>
      );

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

      const wrapper = shallow(<Foo foo="hi" bar="bye" />);

      expect(wrapper.prop('className')).to.equal('bye');
      expect(wrapper.prop('id')).to.equal('hi');
      expect(wrapper.prop('foo')).to.equal(undefined);
      expect(wrapper.prop('bar')).to.equal(undefined);
    });

    describeIf(!REACT013, 'stateless function components', () => {
      it('should return props of root rendered node', () => {
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

  describe('.state(name)', () => {

    it('should return the state object', () => {
      class Foo extends React.Component {
        constructor(props) {
          super(props);
          this.state = { foo: 'foo' };
        }
        render() { return <div />; }
      }
      const wrapper = shallow(<Foo />);
      expect(wrapper.state()).to.eql({ foo: 'foo' });
    });

    it('should return the current state after state transitions', () => {
      class Foo extends React.Component {
        constructor(props) {
          super(props);
          this.state = { foo: 'foo' };
        }
        render() { return <div />; }
      }
      const wrapper = shallow(<Foo />);
      wrapper.setState({ foo: 'bar' });
      expect(wrapper.state()).to.eql({ foo: 'bar' });
    });

    it('should allow a state property name be passed in as an argument', () => {
      class Foo extends React.Component {
        constructor(props) {
          super(props);
          this.state = { foo: 'foo' };
        }
        render() { return <div />; }
      }
      const wrapper = shallow(<Foo />);
      expect(wrapper.state('foo')).to.equal('foo');
    });
  });

  describe('.children([selector])', () => {
    it('should return empty wrapper for node with no children', () => {
      const wrapper = shallow(<div />);
      expect(wrapper.children().length).to.equal(0);
    });

    it('should skip the falsy children', () => {
      const wrapper = shallow(
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
      );
      expect(wrapper.childAt(0).children().length).to.equal(1);
      expect(wrapper.childAt(1).children().length).to.equal(1);
      expect(wrapper.childAt(2).children().length).to.equal(1);
    });

    it('should return the children nodes of the root', () => {
      const wrapper = shallow(
        <div>
          <div className="foo" />
          <div className="bar" />
          <div className="baz" />
        </div>
      );
      expect(wrapper.children().length).to.equal(3);
      expect(wrapper.children().at(0).hasClass('foo')).to.equal(true);
      expect(wrapper.children().at(1).hasClass('bar')).to.equal(true);
      expect(wrapper.children().at(2).hasClass('baz')).to.equal(true);
    });

    it('should not return any of the children of children', () => {
      const wrapper = shallow(
        <div>
          <div className="foo">
            <div className="bar" />
          </div>
          <div className="baz" />
        </div>
      );
      expect(wrapper.children().length).to.equal(2);
      expect(wrapper.children().at(0).hasClass('foo')).to.equal(true);
      expect(wrapper.children().at(1).hasClass('baz')).to.equal(true);
    });

    it('should handle mixed children with and without arrays', () => {
      class Foo extends React.Component {
        render() {
          return (
            <div>
              <span className="foo"></span>
              {this.props.items.map(x => x)}
            </div>
          );
        }
      }
      const wrapper = shallow(
        <Foo
          items={[
            <i key={1} className="bar">abc</i>,
            <i key={2} className="baz">def</i>,
          ]}
        />
      );
      expect(wrapper.children().length).to.equal(3);
      expect(wrapper.children().at(0).hasClass('foo')).to.equal(true);
      expect(wrapper.children().at(1).hasClass('bar')).to.equal(true);
      expect(wrapper.children().at(2).hasClass('baz')).to.equal(true);
    });

    it('should optionally allow a selector to filter by', () => {
      const wrapper = shallow(
        <div>
          <div className="foo" />
          <div className="bar bip" />
          <div className="baz bip" />
        </div>
      );
      const children = wrapper.children('.bip');
      expect(children.length).to.equal(2);
      expect(children.at(0).hasClass('bar')).to.equal(true);
      expect(children.at(1).hasClass('baz')).to.equal(true);
    });

    describeIf(!REACT013, 'stateless function components', () => {
      it('should handle mixed children with and without arrays', () => {
        const Foo = (props) => (
          <div>
            <span className="foo"></span>
            {props.items.map(x => x)}
          </div>
        );

        const wrapper = shallow(
          <Foo
            items={[
              <i key={1} className="bar">abc</i>,
              <i key={2} className="baz">def</i>,
            ]}
          />
        );
        expect(wrapper.children().length).to.equal(3);
        expect(wrapper.children().at(0).hasClass('foo')).to.equal(true);
        expect(wrapper.children().at(1).hasClass('bar')).to.equal(true);
        expect(wrapper.children().at(2).hasClass('baz')).to.equal(true);
      });
    });

  });

  describe('.childAt(index)', () => {
    it('should get a wrapped node at the specified index', () => {
      const wrapper = shallow(
        <div>
          <div className="bar" />
          <div className="baz" />
        </div>
      );

      expect(wrapper.childAt(0).hasClass('bar')).to.equal(true);
      expect(wrapper.childAt(1).hasClass('baz')).to.equal(true);
    });
  });

  describe('.parents([selector])', () => {
    it('should return an array of current nodes ancestors', () => {
      const wrapper = shallow(
        <div className="bax">
          <div className="foo">
            <div className="bar">
              <div className="baz" />
            </div>
          </div>
        </div>
      );

      const parents = wrapper.find('.baz').parents();

      expect(parents.length).to.equal(3);
      expect(parents.at(0).hasClass('bar')).to.equal(true);
      expect(parents.at(1).hasClass('foo')).to.equal(true);
      expect(parents.at(2).hasClass('bax')).to.equal(true);

    });

    it('should work for non-leaf nodes as well', () => {
      const wrapper = shallow(
        <div className="bax">
          <div className="foo">
            <div className="bar">
              <div className="baz" />
            </div>
          </div>
        </div>
      );

      const parents = wrapper.find('.bar').parents();

      expect(parents.length).to.equal(2);
      expect(parents.at(0).hasClass('foo')).to.equal(true);
      expect(parents.at(1).hasClass('bax')).to.equal(true);
    });

    it('should optionally allow a selector', () => {
      const wrapper = shallow(
        <div className="bax foo">
          <div className="foo">
            <div className="bar">
              <div className="baz" />
            </div>
          </div>
        </div>
      );

      const parents = wrapper.find('.baz').parents('.foo');

      expect(parents.length).to.equal(2);
      expect(parents.at(0).hasClass('foo')).to.equal(true);
      expect(parents.at(1).hasClass('bax')).to.equal(true);
    });
  });

  describe('.parent()', () => {
    it('should return only the immediate parent of the node', () => {
      const wrapper = shallow(
        <div className="bax">
          <div className="foo">
            <div className="bar">
              <div className="baz" />
            </div>
          </div>
        </div>
      );

      expect(wrapper.find('.baz').parent().hasClass('bar')).to.equal(true);
    });

    it('should work when the sibling node has children', () => {
      const wrapper = shallow(
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
      );

      expect(wrapper.find('.baz').parent().hasClass('bar')).to.equal(true);
    });

    it('should work for multiple nodes', () => {
      const wrapper = shallow(
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
      );

      const parents = wrapper.find('.baz').parent();
      expect(parents).to.have.length(3);
      expect(parents.at(0).hasClass('foo')).to.equal(true);
      expect(parents.at(1).hasClass('bar')).to.equal(true);
      expect(parents.at(2).hasClass('bax')).to.equal(true);
    });
  });

  describe('.closest(selector)', () => {
    it('should return the closest ancestor for a given selector', () => {
      const wrapper = shallow(
        <div className="foo">
          <div className="foo baz">
            <div className="bax">
              <div className="bar" />
            </div>
          </div>
        </div>
      );

      const closestFoo = wrapper.find('.bar').closest('.foo');
      expect(closestFoo.hasClass('baz')).to.equal(true);
      expect(closestFoo.length).to.equal(1);
    });

    it('should only ever return a wrapper of a single node', () => {
      const wrapper = shallow(
        <div className="bax">
          <div className="foo">
            <div className="bar">
              <div className="baz" />
            </div>
          </div>
        </div>
      );

      expect(wrapper.find('.baz').parent().hasClass('bar')).to.equal(true);
    });

    it('should return itself if matching', () => {
      const wrapper = shallow(
        <div className="bax">
          <div className="foo">
            <div className="baz">
              <div className="bux baz" />
            </div>
          </div>
        </div>
      );

      expect(wrapper.find('.bux').closest('.baz').hasClass('bux')).to.equal(true);
    });
  });

  describe('.hasClass(className)', () => {
    it('should return whether or not node has a certain class', () => {
      const wrapper = shallow(
        <div className="foo bar baz some-long-string FoOo" />
      );

      expect(wrapper.hasClass('foo')).to.equal(true);
      expect(wrapper.hasClass('bar')).to.equal(true);
      expect(wrapper.hasClass('baz')).to.equal(true);
      expect(wrapper.hasClass('some-long-string')).to.equal(true);
      expect(wrapper.hasClass('FoOo')).to.equal(true);
      expect(wrapper.hasClass('doesnt-exist')).to.equal(false);
    });
  });

  describe('.forEach(fn)', () => {
    it('should call a function for each node in the wrapper', () => {
      const wrapper = shallow(
        <div>
          <div className="foo bax" />
          <div className="foo bar" />
          <div className="foo baz" />
        </div>
      );
      const spy = sinon.spy();

      wrapper.find('.foo').forEach(spy);

      expect(spy.callCount).to.equal(3);
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
    it('should call a function with a wrapper for each node in the wrapper', () => {
      const wrapper = shallow(
        <div>
          <div className="foo bax" />
          <div className="foo bar" />
          <div className="foo baz" />
        </div>
      );
      const spy = sinon.spy();

      wrapper.find('.foo').map(spy);

      expect(spy.callCount).to.equal(3);
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

    it('should return an array with the mapped values', () => {
      const wrapper = shallow(
        <div>
          <div className="foo bax" />
          <div className="foo bar" />
          <div className="foo baz" />
        </div>
      );
      const result = wrapper.find('.foo').map(w => w.props().className);

      expect(result).to.eql([
        'foo bax',
        'foo bar',
        'foo baz',
      ]);
    });
  });

  describe('.reduce(fn[, initialValue])', () => {
    it('should call a function with a wrapper for each node in the wrapper', () => {
      const wrapper = shallow(
        <div>
          <div className="foo bax" />
          <div className="foo bar" />
          <div className="foo baz" />
        </div>
      );
      const spy = sinon.spy(n => n + 1);

      wrapper.find('.foo').reduce(spy, 0);

      expect(spy.callCount).to.equal(3);
      expect(spy.args[0][1]).to.be.instanceOf(ShallowWrapper);
      expect(spy.args[0][1].hasClass('bax')).to.equal(true);
      expect(spy.args[1][1]).to.be.instanceOf(ShallowWrapper);
      expect(spy.args[1][1].hasClass('bar')).to.equal(true);
      expect(spy.args[2][1]).to.be.instanceOf(ShallowWrapper);
      expect(spy.args[2][1].hasClass('baz')).to.equal(true);
    });

    it('should accumulate a value', () => {
      const wrapper = shallow(
        <div>
          <div id="bax" className="foo qoo" />
          <div id="bar" className="foo boo" />
          <div id="baz" className="foo hoo" />
        </div>
      );
      const result = wrapper.find('.foo').reduce(
        (obj, n) => {
          obj[n.prop('id')] = n.prop('className');
          return obj;
        },
        {}
      );

      expect(result).to.eql({
        bax: 'foo qoo',
        bar: 'foo boo',
        baz: 'foo hoo',
      });
    });
  });

  describe('.reduceRight(fn[, initialValue])', () => {
    it('should call a function with a wrapper for each node in the wrapper in reverse', () => {
      const wrapper = shallow(
        <div>
          <div className="foo bax" />
          <div className="foo bar" />
          <div className="foo baz" />
        </div>
      );
      const spy = sinon.spy(n => n + 1);

      wrapper.find('.foo').reduceRight(spy, 0);

      expect(spy.callCount).to.equal(3);
      expect(spy.args[0][1]).to.be.instanceOf(ShallowWrapper);
      expect(spy.args[0][1].hasClass('baz')).to.equal(true);
      expect(spy.args[1][1]).to.be.instanceOf(ShallowWrapper);
      expect(spy.args[1][1].hasClass('bar')).to.equal(true);
      expect(spy.args[2][1]).to.be.instanceOf(ShallowWrapper);
      expect(spy.args[2][1].hasClass('bax')).to.equal(true);
    });

    it('should accumulate a value', () => {
      const wrapper = shallow(
        <div>
          <div id="bax" className="foo qoo" />
          <div id="bar" className="foo boo" />
          <div id="baz" className="foo hoo" />
        </div>
      );
      const result = wrapper.find('.foo').reduceRight(
        (obj, n) => {
          obj[n.prop('id')] = n.prop('className');
          return obj;
        },
        {}
      );

      expect(result).to.eql({
        bax: 'foo qoo',
        bar: 'foo boo',
        baz: 'foo hoo',
      });
    });
  });

  describe('.some(selector)', () => {
    it('should return if a node matches a selector', () => {
      const wrapper = shallow(
        <div>
          <div className="foo qoo" />
          <div className="foo boo" />
          <div className="foo hoo" />
        </div>
      );
      expect(wrapper.find('.foo').some('.qoo')).to.equal(true);
      expect(wrapper.find('.foo').some('.foo')).to.equal(true);
      expect(wrapper.find('.foo').some('.bar')).to.equal(false);
    });
  });

  describe('.someWhere(predicate)', () => {
    it('should return if a node matches a predicate', () => {
      const wrapper = shallow(
        <div>
          <div className="foo qoo" />
          <div className="foo boo" />
          <div className="foo hoo" />
        </div>
      );
      expect(wrapper.find('.foo').someWhere(n => n.hasClass('qoo'))).to.equal(true);
      expect(wrapper.find('.foo').someWhere(n => n.hasClass('foo'))).to.equal(true);
      expect(wrapper.find('.foo').someWhere(n => n.hasClass('bar'))).to.equal(false);
    });
  });

  describe('.every(selector)', () => {
    it('should return if every node matches a selector', () => {
      const wrapper = shallow(
        <div>
          <div className="foo qoo" />
          <div className="foo boo" />
          <div className="foo hoo" />
        </div>
      );
      expect(wrapper.find('.foo').every('.foo')).to.equal(true);
      expect(wrapper.find('.foo').every('.qoo')).to.equal(false);
      expect(wrapper.find('.foo').every('.bar')).to.equal(false);
    });
  });

  describe('.everyWhere(predicate)', () => {
    it('should return if every node matches a predicate', () => {
      const wrapper = shallow(
        <div>
          <div className="foo qoo" />
          <div className="foo boo" />
          <div className="foo hoo" />
        </div>
      );
      expect(wrapper.find('.foo').everyWhere(n => n.hasClass('foo'))).to.equal(true);
      expect(wrapper.find('.foo').everyWhere(n => n.hasClass('qoo'))).to.equal(false);
      expect(wrapper.find('.foo').everyWhere(n => n.hasClass('bar'))).to.equal(false);
    });
  });

  describe('.flatMap(fn)', () => {
    it('should return a wrapper with the mapped and flattened nodes', () => {
      const wrapper = shallow(
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
      );

      const nodes = wrapper.find('.foo').flatMap(w => w.children().nodes);

      expect(nodes.length).to.equal(6);
      expect(nodes.at(0).hasClass('bar')).to.equal(true);
      expect(nodes.at(1).hasClass('bar')).to.equal(true);
      expect(nodes.at(2).hasClass('baz')).to.equal(true);
      expect(nodes.at(3).hasClass('baz')).to.equal(true);
      expect(nodes.at(4).hasClass('bax')).to.equal(true);
      expect(nodes.at(5).hasClass('bax')).to.equal(true);
    });
  });

  describe('.shallow()', () => {
    it('should return a shallow rendered instance of the current node', () => {
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
      expect(wrapper.find('.in-bar')).to.have.length(0);
      expect(wrapper.find(Bar)).to.have.length(1);
      expect(wrapper.find(Bar).shallow().find('.in-bar')).to.have.length(1);
    });

    describe('context', () => {
      it('can pass in context', () => {
        class Bar extends React.Component {
          render() {
            return <div>{this.context.name}</div>;
          }
        }
        Bar.contextTypes = {
          name: React.PropTypes.string,
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
        expect(wrapper.find(Bar)).to.have.length(1);
        expect(wrapper.find(Bar).shallow({ context }).text()).to.equal('foo');
      });

      it('should not throw if context is passed in but contextTypes is missing', () => {
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
        expect(() => wrapper.find(Bar).shallow({ context })).to.not.throw(Error);
      });

      it('is instrospectable through context API', () => {
        class Bar extends React.Component {
          render() {
            return <div>{this.context.name}</div>;
          }
        }
        Bar.contextTypes = {
          name: React.PropTypes.string,
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
    });

    describeIf(!REACT013, 'stateless function components', () => {
      it('should return a shallow rendered instance of the current node', () => {
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
        expect(wrapper.find('.in-bar')).to.have.length(0);
        expect(wrapper.find(Bar)).to.have.length(1);
        expect(wrapper.find(Bar).shallow().find('.in-bar')).to.have.length(1);
      });

      describe('context', () => {
        it('can pass in context', () => {
          const Bar = (props, context) => (
            <div>{context.name}</div>
          );
          Bar.contextTypes = { name: React.PropTypes.string };
          const Foo = () => (
            <div>
              <Bar />
            </div>
          );

          const context = { name: 'foo' };
          const wrapper = shallow(<Foo />);
          expect(wrapper.find(Bar).shallow({ context }).text()).to.equal('foo');
        });

        it('should not throw if context is passed in but contextTypes is missing', () => {
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
          expect(() => wrapper.find(Bar).shallow({ context })).to.not.throw(Error);
        });

        it('is instrospectable through context API', () => {
          const Bar = (props, context) => (
            <div>{context.name}</div>
          );
          Bar.contextTypes = { name: React.PropTypes.string };
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
      });
    });

  });

  describe('.first()', () => {
    it('should return the first node in the current set', () => {
      const wrapper = shallow(
        <div>
          <div className="bar baz" />
          <div className="bar" />
          <div className="bar" />
          <div className="bar" />
        </div>
      );
      expect(wrapper.find('.bar').first().hasClass('baz')).to.equal(true);
    });
  });

  describe('.last()', () => {
    it('should return the last node in the current set', () => {
      const wrapper = shallow(
        <div>
          <div className="bar" />
          <div className="bar" />
          <div className="bar" />
          <div className="bar baz" />
        </div>
      );
      expect(wrapper.find('.bar').last().hasClass('baz')).to.equal(true);
    });
  });

  describe('.isEmpty()', () => {
    it('should return true iff wrapper is empty', () => {
      const wrapper = shallow(
        <div className="foo" />
      );
      expect(wrapper.find('.bar').isEmpty()).to.equal(true);
      expect(wrapper.find('.foo').isEmpty()).to.equal(false);
    });
  });

  describe('.at(index)', () => {
    it('gets a wrapper of the node at the specified index', () => {
      const wrapper = shallow(
        <div>
          <div className="bar foo" />
          <div className="bar bax" />
          <div className="bar bux" />
          <div className="bar baz" />
        </div>
      );
      expect(wrapper.find('.bar').at(0).hasClass('foo')).to.equal(true);
      expect(wrapper.find('.bar').at(1).hasClass('bax')).to.equal(true);
      expect(wrapper.find('.bar').at(2).hasClass('bux')).to.equal(true);
      expect(wrapper.find('.bar').at(3).hasClass('baz')).to.equal(true);
    });
  });

  describe('.get(index)', () => {
    it('gets the node at the specified index', () => {
      const wrapper = shallow(
        <div>
          <div className="bar foo" />
          <div className="bar bax" />
          <div className="bar bux" />
          <div className="bar baz" />
        </div>
      );
      expect(wrapper.find('.bar').get(0)).to.equal(wrapper.find('.foo').node);
      expect(wrapper.find('.bar').get(1)).to.equal(wrapper.find('.bax').node);
      expect(wrapper.find('.bar').get(2)).to.equal(wrapper.find('.bux').node);
      expect(wrapper.find('.bar').get(3)).to.equal(wrapper.find('.baz').node);
    });
  });

  describe('.debug()', () => {
    it('should pass through to the debugNodes function', () => {
      expect(shallow(<div />).debug()).to.equal('<div />');
    });
  });

  describe('.html()', () => {
    it('should return html of straight DOM elements', () => {
      const wrapper = shallow(
        <div className="test">
          <span>Hello World!</span>
        </div>
      );
      expect(wrapper.html()).to.equal(
        '<div class="test"><span>Hello World!</span></div>'
      );
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
      const wrapper = shallow(<Bar />);
      expect(wrapper.html()).to.equal(
        '<div class="in-bar"><div class="in-foo"></div></div>'
      );
      expect(wrapper.find(Foo).html()).to.equal(
        '<div class="in-foo"></div>'
      );
    });

    describeIf(!REACT013, 'stateless function components', () => {
      it('should render out nested composite components', () => {
        const Foo = () => (
          <div className="in-foo" />
        );
        const Bar = () => (
          <div className="in-bar">
            <Foo />
          </div>
        );

        const wrapper = shallow(<Bar />);
        expect(wrapper.html()).to.equal(
          '<div class="in-bar"><div class="in-foo"></div></div>'
        );
        expect(wrapper.find(Foo).html()).to.equal(
          '<div class="in-foo"></div>'
        );
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
      const wrapper = shallow(<Foo id="foo" />);
      expect(spy.calledOnce).to.equal(false);
      wrapper.unmount();
      expect(spy.calledOnce).to.equal(true);
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
      const wrapper = shallow(<Bar />);
      expect(wrapper.render().find('.in-bar')).to.have.length(1);
      const renderedFoo = wrapper.find(Foo).render();
      expect(renderedFoo.find('.in-foo')).to.have.length(1);
      expect(renderedFoo.find('.in-bar')).to.have.length(0);
    });

    describeIf(!REACT013, 'stateless function components', () => {
      it('should return a cheerio wrapper around the current node', () => {
        const Foo = () => (
          <div className="in-foo" />
        );
        const Bar = () => (
          <div className="in-bar">
            <Foo />
          </div>
        );

        const wrapper = shallow(<Bar />);
        expect(wrapper.render().find('.in-bar')).to.have.length(1);
        const renderedFoo = wrapper.find(Foo).render();
        expect(renderedFoo.find('.in-foo')).to.have.length(1);
        expect(renderedFoo.find('.in-bar')).to.have.length(0);
      });
    });

  });

  describe('lifecycleExperimental', () => {
    context('mounting phase', () => {
      it('should call componentWillMount and componentDidMount', () => {
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
        shallow(<Foo />, { lifecycleExperimental: true });
        expect(spy.args).to.deep.equal([
          ['componentWillMount'],
          ['render'],
          ['componentDidMount'],
        ]);
      });

      it('should be batching updates', () => {
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
        const result = shallow(<Foo />, { lifecycleExperimental: true });
        expect(result.state('count')).to.equal(2);
        expect(spy.callCount).to.equal(2);
      });
    });

    context('updating props', () => {

      it('should call shouldComponentUpdate, componentWillUpdate and componentDidUpdate', () => {
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
            return <div>foo</div>;
          }
        }
        Foo.contextTypes = {
          foo: React.PropTypes.string,
        };

        const wrapper = shallow(
          <Foo foo="bar" />,
          {
            context: { foo: 'context' },
            lifecycleExperimental: true,
          }
        );
        wrapper.setProps({ foo: 'baz' });
        expect(spy.args).to.deep.equal(
          [
            [
              'render',
            ],
            [
              'componentWillReceiveProps',
              { foo: 'bar' }, { foo: 'baz' },
              { foo: 'context' },
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
              { foo: 'context' },
            ],
          ]
        );
      });

      it('should cancel rendering when Component returns false in shouldComponentUpdate', () => {
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

        const wrapper = shallow(<Foo foo="bar" />, { lifecycleExperimental: true });
        wrapper.setProps({ foo: 'baz' });
        expect(spy.args).to.deep.equal([['render'], ['shouldComponentUpdate']]);
      });

      it('should not provoke another renders to call setState in componentWillReceiveProps', () => {
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
        const result = shallow(<Foo />, { lifecycleExperimental: true });
        expect(spy).to.have.property('callCount', 1);
        result.setProps({ name: 'bar' });
        expect(spy).to.have.property('callCount', 2);
        expect(result.state('count')).to.equal(1);
      });

      it('should provoke an another render to call setState twice in componentWillUpdate', () => {
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
        const result = shallow(<Foo />, { lifecycleExperimental: true });
        expect(spy).to.have.property('callCount', 1);
        result.setProps({ name: 'bar' });
        expect(spy).to.have.property('callCount', 3);
        expect(result.state('count')).to.equal(1);
      });

      it('should provoke an another render to call setState twice in componentDidUpdate', () => {
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
        const result = shallow(<Foo />, { lifecycleExperimental: true });
        expect(spy).to.have.property('callCount', 1);
        result.setProps({ name: 'bar' });
        expect(spy).to.have.property('callCount', 3);
        expect(result.state('count')).to.equal(1);
      });

    });

    context('updating state', () => {

      it('should call shouldComponentUpdate, componentWillUpdate and componentDidUpdate', () => {
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
            return <div>foo</div>;
          }
        }
        Foo.contextTypes = {
          foo: React.PropTypes.string,
        };

        const wrapper = shallow(
          <Foo foo="props" />,
          {
            context: { foo: 'context' },
            lifecycleExperimental: true,
          }
        );
        wrapper.setState({ foo: 'baz' });
        expect(spy.args).to.deep.equal([
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
            { foo: 'context' },
          ],
        ]);
      });

      it('should cancel rendering when Component returns false in shouldComponentUpdate', () => {
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
            return <div>foo</div>;
          }
        }
        const wrapper = shallow(<Foo />, { lifecycleExperimental: true });
        wrapper.setState({ foo: 'baz' });
        expect(spy.args).to.deep.equal([['render'], ['shouldComponentUpdate']]);
      });

      it('should provoke an another render to call setState twice in componentWillUpdate', () => {
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
        const result = shallow(<Foo />, { lifecycleExperimental: true });
        expect(spy).to.have.property('callCount', 1);
        result.setState({ name: 'bar' });
        expect(spy).to.have.property('callCount', 3);
        expect(result.state('count')).to.equal(1);
      });

      it('should provoke an another render to call setState twice in componentDidUpdate', () => {
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
        const result = shallow(<Foo />, { lifecycleExperimental: true });
        expect(spy).to.have.property('callCount', 1);
        result.setState({ name: 'bar' });
        expect(spy).to.have.property('callCount', 3);
        expect(result.state('count')).to.equal(1);
      });

    });

    context('updating context', () => {

      it('should call shouldComponentUpdate, componentWillUpdate and componentDidUpdate', () => {
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
            return <div>foo</div>;
          }
        }
        Foo.contextTypes = {
          foo: React.PropTypes.string,
        };
        const wrapper = shallow(
          <Foo foo="props" />,
          {
            context: { foo: 'bar' },
            lifecycleExperimental: true,
          }
        );
        wrapper.setContext({ foo: 'baz' });
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
            { foo: 'bar' },
          ],
        ]);
      });

      it('should cancel rendering when Component returns false in shouldComponentUpdate', () => {
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
          foo: React.PropTypes.string,
        };
        const wrapper = shallow(
          <Foo />,
          {
            context: { foo: 'bar' },
            lifecycleExperimental: true,
          }
        );
        wrapper.setContext({ foo: 'baz' });
        expect(spy.args).to.deep.equal([['render'], ['shouldComponentUpdate']]);
      });

      it('should provoke an another render to call setState twice in componentWillUpdate', () => {
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
            lifecycleExperimental: true,
          }
        );
        expect(spy).to.have.property('callCount', 1);
        result.setContext({ foo: 'baz' });
        expect(spy).to.have.property('callCount', 3);
        expect(result.state('count')).to.equal(1);
      });

      it('should provoke an another render to call setState twice in componentDidUpdate', () => {
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
            lifecycleExperimental: true,
          }
        );
        expect(spy).to.have.property('callCount', 1);
        result.setContext({ foo: 'baz' });
        expect(spy).to.have.property('callCount', 3);
        expect(result.state('count')).to.equal(1);
      });

    });

    context('unmounting phase', () => {

      it('should calll componentWillUnmount', () => {
        const spy = sinon.spy();
        class Foo extends React.Component {
          componentWillUnmount() {
            spy();
          }
          render() {
            return <div>foo</div>;
          }
        }
        const wrapper = shallow(<Foo />, { lifecycleExperimental: true });
        wrapper.unmount();
        expect(spy).to.have.property('callCount', 1);
      });
    });

    it('should not call when lifecycleExperimental flag is false', () => {
      const spy = sinon.spy();
      class Foo extends React.Component {
        componentDidMount() {
          spy();
        }
        render() {
          return <div>foo</div>;
        }
      }
      shallow(<Foo />, { lifecycleExperimental: false });
      expect(spy).to.have.property('callCount', 0);
    });

    it('should call shouldComponentUpdate when lifecycleExperimental flag is false', () => {
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
          return <div>foo</div>;
        }
      }
      const wrapper = shallow(
        <Foo foo="foo" />,
        {
          context: { foo: 'foo' },
          lifecycleExperimental: false,
        }
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

  it('works with class components that return null', () => {
    class Foo extends React.Component {
      render() {
        return null;
      }
    }
    const wrapper = shallow(<Foo />);
    expect(wrapper).to.have.length(1);
    expect(wrapper.html()).to.equal(null);
    expect(wrapper.type()).to.equal(null);
    const rendered = wrapper.render();
    expect(rendered.length).to.equal(0);
    expect(rendered.html()).to.equal(null);
  });

  itIf(REACT15, 'works with SFCs that return null', () => {
    const Foo = () => null;

    const wrapper = shallow(<Foo />);
    expect(wrapper).to.have.length(1);
    expect(wrapper.html()).to.equal(null);
    expect(wrapper.type()).to.equal(null);
    const rendered = wrapper.render();
    expect(rendered.length).to.equal(0);
    expect(rendered.html()).to.equal(null);
  });

  describe('.tap()', () => {
    it('should call the passed function with current ShallowWrapper and returns itself', () => {
      const spy = sinon.spy();
      const wrapper = shallow(
        <ul>
          <li>xxx</li>
          <li>yyy</li>
          <li>zzz</li>
        </ul>
      ).find('li');
      const result = wrapper.tap(spy);
      expect(spy.calledWith(wrapper)).to.equal(true);
      expect(result).to.equal(wrapper);
    });
  });

  describe('.key()', () => {
    it('should return the key of the node', () => {
      const wrapper = shallow(
        <ul>
          {['foo', 'bar'].map(s => <li key={s}>{s}</li>)}
        </ul>
      ).find('li');
      expect(wrapper.at(0).key()).to.equal('foo');
      expect(wrapper.at(1).key()).to.equal('bar');
    });
  });

  describe('.matchesElement(node)', () => {
    it('should match on a root node that looks like the rendered one', () => {
      const spy = sinon.spy();
      const wrapper = shallow(
        <div>
          <div onClick={spy} style={{ fontSize: 12, color: 'red' }}>Hello World</div>
        </div>
      ).first();
      expect(wrapper.matchesElement(<div><div>Hello World</div></div>)).to.equal(true);
      expect(wrapper.matchesElement(
        <div>
          <div onClick={spy} style={{ fontSize: 12, color: 'red' }}>Hello World</div>
        </div>
      )).to.equal(true);
      expect(wrapper.matchesElement(
        <div>
          <div onClick={spy}>Hello World</div>
        </div>
      )).to.equal(true);
      expect(wrapper.matchesElement(
        <div>
          <div style={{ fontSize: 12, color: 'red' }}>Hello World</div>
        </div>
      )).to.equal(true);
      expect(spy.callCount).to.equal(0);
    });
    it('should not match on a root node that doesn\'t looks like the rendered one', () => {
      const spy = sinon.spy();
      const spy2 = sinon.spy();
      const wrapper = shallow(
        <div>
          <div onClick={spy} style={{ fontSize: 12, color: 'red' }}>Hello World</div>
        </div>
      ).first();
      expect(wrapper.matchesElement(<div><div>Bonjour le monde</div></div>)).to.equal(false);
      expect(wrapper.matchesElement(
        <div>
          <div onClick={spy} style={{ fontSize: 12, color: 'blue' }}>Hello World</div>
        </div>
      )).to.equal(false);
      expect(wrapper.matchesElement(
        <div>
          <div onClick={spy2}>Hello World</div>
        </div>
      )).to.equal(false);
      expect(wrapper.matchesElement(
        <div>
          <div style={{ fontSize: 13, color: 'red' }}>Hello World</div>
        </div>
      )).to.equal(false);
      expect(spy.callCount).to.equal(0);
      expect(spy2.callCount).to.equal(0);
    });
  });

  describe('.containsMatchingElement(node)', () => {
    it('should match a root node that looks like the rendered one', () => {
      const spy1 = sinon.spy();
      const spy2 = sinon.spy();
      const wrapper = shallow(
        <div>
          <div onClick={spy1} style={{ fontSize: 12, color: 'red' }}>Hello World</div>
          <div onClick={spy2} style={{ fontSize: 13, color: 'blue' }}>Goodbye World</div>
        </div>
      );
      expect(wrapper.containsMatchingElement(
        <div>
          <div>Hello World</div>
          <div>Goodbye World</div>
        </div>
      )).to.equal(true);
      expect(wrapper.containsMatchingElement(
        <div>
          <div onClick={spy1} style={{ fontSize: 12, color: 'red' }}>Hello World</div>
          <div onClick={spy2} style={{ fontSize: 13, color: 'blue' }}>Goodbye World</div>
        </div>
      )).to.equal(true);
      expect(wrapper.containsMatchingElement(
        <div>
          <div onClick={spy1}>Hello World</div>
          <div style={{ fontSize: 13, color: 'blue' }}>Goodbye World</div>
        </div>
      )).to.equal(true);
      expect(wrapper.containsMatchingElement(
        <div>
          <div style={{ fontSize: 12, color: 'red' }}>Hello World</div>
          <div onClick={spy2}>Goodbye World</div>
        </div>
      )).to.equal(true);
      expect(wrapper.containsMatchingElement(
        <div>
          <div>Hello World</div>
          <div onClick={spy2} style={{ fontSize: 13, color: 'blue' }}>Goodbye World</div>
        </div>
      )).to.equal(true);
      expect(wrapper.containsMatchingElement(
        <div>
          <div>Hello World</div>
          <div style={{ fontSize: 13, color: 'blue' }}>Goodbye World</div>
        </div>
      )).to.equal(true);
      expect(spy1.callCount).to.equal(0);
      expect(spy2.callCount).to.equal(0);
    });
    it('should match on a single node that looks like a rendered one', () => {
      const spy1 = sinon.spy();
      const spy2 = sinon.spy();
      const wrapper = shallow(
        <div>
          <div onClick={spy1} style={{ fontSize: 12, color: 'red' }}>Hello World</div>
          <div onClick={spy2} style={{ fontSize: 13, color: 'blue' }}>Goodbye World</div>
        </div>
      );
      expect(wrapper.containsMatchingElement(
        <div>Hello World</div>
      )).to.equal(true);
      expect(wrapper.containsMatchingElement(
        <div>Goodbye World</div>
      )).to.equal(true);
      expect(wrapper.containsMatchingElement(
        <div onClick={spy1} style={{ fontSize: 12, color: 'red' }}>Hello World</div>
      )).to.equal(true);
      expect(wrapper.containsMatchingElement(
        <div style={{ fontSize: 12, color: 'red' }}>Hello World</div>
      )).to.equal(true);
      expect(wrapper.containsMatchingElement(
        <div onClick={spy2} style={{ fontSize: 13, color: 'blue' }}>Goodbye World</div>
      )).to.equal(true);
      expect(wrapper.containsMatchingElement(
        <div onClick={spy2}>Goodbye World</div>
      )).to.equal(true);
      expect(spy1.callCount).to.equal(0);
      expect(spy2.callCount).to.equal(0);
    });
    it('should not match on a single node that doesn\'t looks like a rendered one', () => {
      const spy1 = sinon.spy();
      const spy2 = sinon.spy();
      const wrapper = shallow(
        <div>
          <div onClick={spy1} style={{ fontSize: 12, color: 'red' }}>Hello World</div>
          <div onClick={spy2} style={{ fontSize: 13, color: 'blue' }}>Goodbye World</div>
        </div>
      );
      expect(wrapper.containsMatchingElement(
        <div>Bonjour le monde</div>
      )).to.equal(false);
      expect(wrapper.containsMatchingElement(
        <div onClick={spy2}>Au revoir le monde</div>
      )).to.equal(false);
    });
  });
  describe('.containsAllMatchingElements(nodes)', () => {
    it('should match on an array of nodes that all looks like one of rendered nodes', () => {
      const spy1 = sinon.spy();
      const spy2 = sinon.spy();
      const wrapper = shallow(
        <div>
          <div onClick={spy1} style={{ fontSize: 12, color: 'red' }}>Hello World</div>
          <div onClick={spy2} style={{ fontSize: 13, color: 'blue' }}>Goodbye World</div>
        </div>
      );
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
      expect(spy1.callCount).to.equal(0);
      expect(spy2.callCount).to.equal(0);
    });
    it('should not match on nodes that doesn\'t all looks like one of rendered nodes', () => {
      const spy1 = sinon.spy();
      const spy2 = sinon.spy();
      const wrapper = shallow(
        <div>
          <div onClick={spy1} style={{ fontSize: 12, color: 'red' }}>Hello World</div>
          <div onClick={spy2} style={{ fontSize: 13, color: 'blue' }}>Goodbye World</div>
        </div>
      );
      expect(wrapper.containsAllMatchingElements([
        <div onClick={spy1} style={{ fontSize: 12, color: 'red' }}>Hello World</div>,
        <div onClick={spy1} style={{ fontSize: 12, color: 'red' }}>Bonjour le monde</div>,
        <div onClick={spy2}>Goodbye World</div>,
      ])).to.equal(false);
      expect(spy1.callCount).to.equal(0);
      expect(spy2.callCount).to.equal(0);
    });
  });

  describe('.containsAnyMatchingElements(nodes)', () => {
    it('should match on an array with at least one node that looks like a rendered nodes', () => {
      const spy1 = sinon.spy();
      const spy2 = sinon.spy();
      const wrapper = shallow(
        <div>
          <div onClick={spy1} style={{ fontSize: 12, color: 'red' }}>Hello World</div>
          <div onClick={spy2} style={{ fontSize: 13, color: 'blue' }}>Goodbye World</div>
        </div>
      );
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
      expect(spy1.callCount).to.equal(0);
      expect(spy2.callCount).to.equal(0);
    });
    it('should not match on an array with no nodes that looks like a rendered nodes', () => {
      const spy1 = sinon.spy();
      const spy2 = sinon.spy();
      const wrapper = shallow(
        <div>
          <div onClick={spy1} style={{ fontSize: 12, color: 'red' }}>Hello World</div>
          <div onClick={spy2} style={{ fontSize: 13, color: 'blue' }}>Goodbye World</div>
        </div>
      );
      expect(wrapper.containsAnyMatchingElements([
        <div onClick={spy1} style={{ fontSize: 12, color: 'red' }}>Bonjour le monde</div>,
        <div onClick={spy2}>Au revoir le monde</div>,
      ])).to.equal(false);
      expect(spy1.callCount).to.equal(0);
      expect(spy2.callCount).to.equal(0);
    });
  });
  describe('.name()', () => {
    describe('node with displayName', () => {
      it('should return the displayName of the node', () => {
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

      describeIf(!REACT013, 'stateless function components', () => {
        it('should return the name of the node', () => {
          function SFC() {
            return <div />;
          }
          const Wrapper = () => <SFC />;

          SFC.displayName = 'CustomWrapper';

          const wrapper = shallow(<Wrapper />);
          expect(wrapper.name()).to.equal('CustomWrapper');
        });
      });

      describe('React.createClass', () => {
        it('should return the name of the node', () => {
          const Foo = React.createClass({
            displayName: 'CustomWrapper',
            render() {
              return <div />;
            },
          });
          const Wrapper = React.createClass({
            render() {
              return <Foo />;
            },
          });

          const wrapper = shallow(<Wrapper />);
          expect(wrapper.name()).to.equal('CustomWrapper');
        });
      });
    });

    describe('node without displayName', () => {
      it('should return the name of the node', () => {
        class Foo extends React.Component {
          render() { return <div />; }
        }

        class Wrapper extends React.Component {
          render() { return <Foo />; }
        }

        const wrapper = shallow(<Wrapper />);
        expect(wrapper.name()).to.equal('Foo');
      });

      describeIf(!REACT013, 'stateless function components', () => {
        it('should return the name of the node', () => {
          function SFC() {
            return <div />;
          }
          const Wrapper = () => <SFC />;

          const wrapper = shallow(<Wrapper />);
          expect(wrapper.name()).to.equal('SFC');
        });
      });

      describe('React.createClass', () => {
        it('should return the name of the node', () => {
          const Foo = React.createClass({
            render() {
              return <div />;
            },
          });
          const Wrapper = React.createClass({
            render() {
              return <Foo />;
            },
          });

          const wrapper = shallow(<Wrapper />);
          expect(wrapper.name()).to.equal('Foo');
        });
      });
    });

    describe('DOM node', () => {
      it('should return the name of the node', () => {
        const wrapper = shallow(<div />);
        expect(wrapper.name()).to.equal('div');
      });
    });
  });

});
