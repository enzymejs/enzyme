import React from 'react';
import { expect } from 'chai';
import { shallow, render, ShallowWrapper } from '../';
import sinon from 'sinon';
import { describeIf } from './_helpers';
import { REACT013 } from '../version';

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
  });

  describeIf(!REACT013, 'stateless components', () => {
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

    it('should find an element based on a tag name', () => {
      const wrapper = shallow(
        <div>
          <input className="foo" />
        </div>
      );
      expect(wrapper.find('input').props().className).to.equal('foo');
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
          <span preserveAspectRatio="xMaxYMax"/>
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

    it('should throw on a complex selector', () => {
      const wrapper = shallow(
        <div>
          <input className="foo" />
          <input />
          <button />
        </div>
      );
      expect(() => wrapper.find('.foo .foo')).to.throw(Error);
    });

    it('should support object property selectors', () => {
      const wrapper = shallow(
        <div>
          <input data-test="ref" className="foo" type="text" />
          <input data-test="ref" type="text"/>
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
      const testFunction = () => {};
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

    describe('Normalizing JS event names', () => {
      it('should convert lowercase events to React camelcase', () => {
        const spy = sinon.spy();
        class Foo extends React.Component {
          render() {
            return (
              <a onDoubleClick={spy}>foo</a>
            );
          }
        }

        const wrapper = shallow(<Foo />);

        wrapper.simulate('doubleclick');
        expect(spy.calledOnce).to.equal(true);
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
      });
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
            <div className={this.state.id}/>
          );
        }
      }
      const wrapper = shallow(<Foo />);
      expect(wrapper.find('.foo').length).to.equal(1);
      wrapper.setState({ id: 'bar' });
      expect(wrapper.find('.bar').length).to.equal(1);
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

    it('should return false when selector does not match', () => {
      const wrapper = shallow(<div className="bar baz" />);
      expect(wrapper.is('.foo')).to.equal(false);
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
        render() { return <div/>; }
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

  });

  describe('.props()', () => {

    it('should return the props object', () => {
      const fn = () => {};
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
      const fn = () => {};
      const wrapper = shallow(
        <div className="bax">
          <div className="baz" onClick={fn} />
          <div className="foo" id="fooId" />
        </div>
      );

      expect(wrapper.find('.baz').props().onClick).to.equal(fn);
      expect(wrapper.find('.foo').props().id).to.equal('fooId');
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
      expect(spy.args[1][0]).to.be.instanceOf(ShallowWrapper);
      expect(spy.args[1][0].hasClass('bar')).to.equal(true);
      expect(spy.args[2][0]).to.be.instanceOf(ShallowWrapper);
      expect(spy.args[2][0].hasClass('baz')).to.equal(true);
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
      expect(spy.args[1][0]).to.be.instanceOf(ShallowWrapper);
      expect(spy.args[1][0].hasClass('bar')).to.equal(true);
      expect(spy.args[2][0]).to.be.instanceOf(ShallowWrapper);
      expect(spy.args[2][0].hasClass('baz')).to.equal(true);
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
        `<div class="test"><span>Hello World!</span></div>`
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
        `<div class="in-bar"><div class="in-foo"></div></div>`
      );
      expect(wrapper.find(Foo).html()).to.equal(
        `<div class="in-foo"></div>`
      );
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

  });

});
