import React from 'react/addons';
import { expect } from 'chai';
import sinon from 'sinon';
import {
  onPrototype,
  getNode,
  nodeEqual,
  isSimpleSelector,
  propFromEvent,
} from '../Utils';
import {
  describeWithDOM,
  mount,
} from '../';

describe('Utils', () => {

  describe('onPrototype', () => {
    class Foo {
      a() {}
      b() {}
      componentDidUpdate() {}
    }

    const lifecycleSpy = sinon.spy();
    const methodSpy = sinon.spy();

    onPrototype(Foo, lifecycleSpy, methodSpy);

    expect(lifecycleSpy.callCount).to.equal(1);
    expect(lifecycleSpy.args[0][0]).to.equal(Foo.prototype);
    expect(lifecycleSpy.args[0][1]).to.equal('componentDidUpdate');

    expect(methodSpy.callCount).to.equal(2);
    expect(methodSpy.args[0][0]).to.equal(Foo.prototype);
    expect(methodSpy.args[0][1]).to.equal('a');
    expect(methodSpy.args[1][1]).to.equal('b');

  });

  describeWithDOM('getNode', () => {

    it('should return a DOMNode when a DOMComponent is given', () => {
      const div = mount(<div />).node;
      expect(getNode(div)).to.be.instanceOf(window.HTMLElement);
    });

    it('should return the component when a component is given', () => {
      class Foo extends React.Component {
        render() { return <div />; }
      }
      const foo = mount(<Foo />).node;
      expect(getNode(foo)).to.equal(foo);
    });

  });

  describe('nodeEqual', () => {

    it('should match empty elements of same tag', () => {

      expect(nodeEqual(
        <div />,
        <div />
      )).to.be.true;

    });

    it('should not match empty elements of different type', () => {

      expect(nodeEqual(
        <div />,
        <nav />
      )).to.be.false;

    });

    it('should match basic prop types', () => {

      expect(nodeEqual(
        <div className="foo" />,
        <div className="foo" />
      )).to.be.true;

      expect(nodeEqual(
        <div id="foo" className="bar" />,
        <div id="foo" className="bar" />
      )).to.be.true;

      expect(nodeEqual(
        <div id="foo" className="baz" />,
        <div id="foo" className="bar" />
      )).to.be.false;

    });

    it('should check children as well', () => {

      expect(nodeEqual(
        <div>
          <div />
        </div>,
        <div />
      )).to.be.false;

      expect(nodeEqual(
        <div>
          <div />
        </div>,
        <div>
          <div />
        </div>
      )).to.be.true;

      expect(nodeEqual(
        <div>
          <div className="foo" />
        </div>,
        <div>
          <div className="foo" />
        </div>
      )).to.be.true;

      expect(nodeEqual(
        <div>
          <div className="foo" />
        </div>,
        <div>
          <div />
        </div>
      )).to.be.false;

    });

    it('should test deepEquality with object props', () => {

      expect(nodeEqual(
        <div foo={{ a: 1, b: 2 }} />,
        <div foo={{ a: 1, b: 2 }} />
      )).to.be.true;

      expect(nodeEqual(
        <div foo={{ a: 2, b: 2 }} />,
        <div foo={{ a: 1, b: 2 }} />
      )).to.be.false;

    });

  });

  describe('propFromEvent', () => {

    const fn = propFromEvent;

    it('should work', () => {
      expect(fn('click')).to.equal('onClick');
      expect(fn('mouseEnter')).to.equal('onMouseEnter');
    });

  });


  describe('iuSimpleSelector', () => {

    describe('prohibited selectors', () => {
      function isComplex(selector) {
        it(selector, () => {
          expect(isSimpleSelector(selector)).to.be.false;
        });
      }

      isComplex('.foo .bar');
      isComplex('input[name="foo"]');
      isComplex(':visible');
      isComplex('.foo>.bar');
      isComplex('.foo > .bar');
      isComplex('.foo~.bar');

    });

    describe('allowed selectors', () => {
      function isSimple(selector) {
        it(selector, () => {
          expect(isSimpleSelector(selector)).to.be.true;
        });
      }

      isSimple('.foo');
      isSimple('.foo-and-foo');
      isSimple('.FoOaNdFoO');
      isSimple('tag');
      isSimple('.foo.bar');
      isSimple('input.foo');

    });

  });

});
