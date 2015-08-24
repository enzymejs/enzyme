import React from 'react/addons';
import { expect } from 'chai';
import sinon from 'sinon';
import {
  onPrototype,
  getNode,
  children,
  hasClassName,
  treeForEach,
  treeFilter,
  single,
  childrenEqual,
  nodeEqual,
} from '../Utils';

import {
  useJsDom,
  mount,
  shallow,
} from '../';

describe('Utils', () => {
  useJsDom();

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
    expect(lifecycleSpy.args[0][1]).to.equal("componentDidUpdate");

    expect(methodSpy.callCount).to.equal(2);
    expect(methodSpy.args[0][0]).to.equal(Foo.prototype);
    expect(methodSpy.args[0][1]).to.equal("a");
    expect(methodSpy.args[1][1]).to.equal("b");

  });

  describe('getNode', () => {

    it('should return a DOMNode when a DOMComponent is given', () => {
      const div = mount(<div />).root();
      expect(getNode(div)).to.be.instanceOf(window.HTMLElement);
    });

    it('should return the component when a component is given', () => {
      class Foo extends React.Component {
        render() { return <div /> }
      }
      const foo = mount(<Foo />).root();
      expect(getNode(foo)).to.equal(foo);
    });

  });

  describe('hasClassName', () => {

    it('should work for standalone classNames', () => {
      const node = shallow(<div className="foo"/>).tree;
      expect(hasClassName(node, "foo")).to.be.true;
      expect(hasClassName(node, "bar")).to.be.false;
    });

    it('should work for multiple classNames', () => {
      const node = shallow(<div className="foo bar baz"/>).tree;
      expect(hasClassName(node, "foo")).to.be.true;
      expect(hasClassName(node, "bar")).to.be.true;
      expect(hasClassName(node, "baz")).to.be.true;
      expect(hasClassName(node, "bax")).to.be.false;
    });

    it('should also allow hyphens', () => {
      const node = shallow(<div className="foo-bar"/>).tree;
      expect(hasClassName(node, "foo-bar")).to.be.true;
    });

  });

  describe('treeForEach', () => {

    it('should be called once for a leaf node', () => {
      const spy = sinon.spy();
      const wrapper = shallow(<div />);
      treeForEach(wrapper.tree, spy);
      expect(spy.calledOnce).to.be.true;
    });

    it('should handle a single child', () => {
      const spy = sinon.spy();
      const wrapper = shallow(
        <div>
          <div />
        </div>
      );
      treeForEach(wrapper.tree, spy);
      expect(spy.callCount).to.equal(2);
    });

    it('should handle several children', () => {
      const spy = sinon.spy();
      const wrapper = shallow(
        <div>
          <div />
          <div />
        </div>
      );
      treeForEach(wrapper.tree, spy);
      expect(spy.callCount).to.equal(3);
    });

    it('should handle multiple hierarchies', () => {
      const spy = sinon.spy();
      const wrapper = shallow(
        <div>
          <div>
            <div />
            <div />
          </div>
        </div>
      );
      treeForEach(wrapper.tree, spy);
      expect(spy.callCount).to.equal(4);
    });

    it('should pass in the node', () => {
      const spy = sinon.spy();
      const wrapper = shallow(
        <div>
          <button />
          <nav>
            <input />
          </nav>
        </div>
      );
      treeForEach(wrapper.tree, spy);
      expect(spy.callCount).to.equal(4);
      expect(spy.args[0][0].type).to.equal("div");
      expect(spy.args[1][0].type).to.equal("button");
      expect(spy.args[2][0].type).to.equal("nav");
      expect(spy.args[3][0].type).to.equal("input");
    });

  });

  describe('treeFilter', () => {
    const tree = shallow(
      <div>
        <button />
        <button />
        <nav>
          <input />
        </nav>
      </div>
    ).tree;

    it('should return an empty array for falsey test', () => {
      expect(treeFilter(tree, () => false).length).to.equal(0);
    });

    it('should return the full array for truthy test', () => {
      expect(treeFilter(tree, () => true).length).to.equal(5);
    });

    it('should filter for truthiness', () => {
      expect(treeFilter(tree, node => node.type === "nav").length).to.equal(1);
      expect(treeFilter(tree, node => node.type === "button").length).to.equal(2);
    });

  });

  describe('nodeEqual', () => {

    function isMatch(a, b) {
      return nodeEqual(shallow(a).tree, shallow(b).tree);
    }

    it('should match empty elements of same tag', () => {

      expect(isMatch(
        <div />,
        <div />
      )).to.be.true;

    });

    it('should not match empty elements of different type', () => {

      expect(isMatch(
        <div />,
        <nav />
      )).to.be.false;

    });

    it('should match basic prop types', () => {

      expect(isMatch(
        <div className="foo" />,
        <div className="foo" />
      )).to.be.true;

      expect(isMatch(
        <div id="foo" className="bar" />,
        <div id="foo" className="bar" />
      )).to.be.true;

      expect(isMatch(
        <div id="foo" className="baz" />,
        <div id="foo" className="bar" />
      )).to.be.false;

    });

    it('should check children as well', () => {

      expect(isMatch(
        <div>
          <div />
        </div>,
        <div />
      )).to.be.false;

      expect(isMatch(
        <div>
          <div />
        </div>,
        <div>
          <div />
        </div>
      )).to.be.true;

      expect(isMatch(
        <div>
          <div className="foo" />
        </div>,
        <div>
          <div className="foo" />
        </div>
      )).to.be.true;

      expect(isMatch(
        <div>
          <div className="foo" />
        </div>,
        <div>
          <div />
        </div>
      )).to.be.false;

    });

    it('should test deepEquality with object props', () => {

      expect(isMatch(
        <div foo={{ a: 1, b: 2 }} />,
        <div foo={{ a: 1, b: 2 }} />
      )).to.be.true;

      expect(isMatch(
        <div foo={{ a: 2, b: 2 }} />,
        <div foo={{ a: 1, b: 2 }} />
      )).to.be.false;

    });

  });

  describe('single', () => {

    it('should throw for multi-item arrays', () => {
      expect(() => single([1, 2])).to.throw;
      expect(() => single([1])).to.not.throw;
    });

    it('should throw for empty arrays', () => {
      expect(() => single([])).to.throw;
    });

    it('should return the one item', () => {
      expect(single([1])).to.equal(1);
    });

  });

});