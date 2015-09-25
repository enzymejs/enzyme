import React from 'react';
import { expect } from 'chai';
import { shallow } from '../';
import sinon from 'sinon';
import {
  splitSelector,
  hasClassName,
  treeForEach,
  treeFilter,
  isSimpleSelector,
} from '../Traversal';

describe('Traversal', () => {

  describe('splitSelector', () => {
    var fn = splitSelector;
    it('splits multiple class names', () => {
      expect(fn('.foo.bar')).to.eql(['.foo','.bar']);
      expect(fn('.foo.bar.baz')).to.eql(['.foo','.bar', '.baz']);
    });

    it('splits tag names and class names', () => {
      expect(fn('input.bar')).to.eql(['input','.bar']);
      expect(fn('div.bar.baz')).to.eql(['div','.bar', '.baz']);
      expect(fn('Foo.bar')).to.eql(['Foo','.bar']);
    });
  });

  describe('hasClassName', () => {

    it('should work for standalone classNames', () => {
      const node = (<div className="foo"/>);
      expect(hasClassName(node, "foo")).to.be.true;
      expect(hasClassName(node, "bar")).to.be.false;
    });

    it('should work for multiple classNames', () => {
      const node = (<div className="foo bar baz"/>);
      expect(hasClassName(node, "foo")).to.be.true;
      expect(hasClassName(node, "bar")).to.be.true;
      expect(hasClassName(node, "baz")).to.be.true;
      expect(hasClassName(node, "bax")).to.be.false;
    });

    it('should also allow hyphens', () => {
      const node = (<div className="foo-bar"/>);
      expect(hasClassName(node, "foo-bar")).to.be.true;
    });

  });

  describe('treeForEach', () => {

    it('should be called once for a leaf node', () => {
      const spy = sinon.spy();
      const node = (<div />);
      treeForEach(node, spy);
      expect(spy.calledOnce).to.be.true;
    });

    it('should handle a single child', () => {
      const spy = sinon.spy();
      const node = (
        <div>
          <div />
        </div>
      );
      treeForEach(node, spy);
      expect(spy.callCount).to.equal(2);
    });

    it('should handle several children', () => {
      const spy = sinon.spy();
      const node = (
        <div>
          <div />
          <div />
        </div>
      );
      treeForEach(node, spy);
      expect(spy.callCount).to.equal(3);
    });

    it('should handle multiple hierarchies', () => {
      const spy = sinon.spy();
      const node = (
        <div>
          <div>
            <div />
            <div />
          </div>
        </div>
      );
      treeForEach(node, spy);
      expect(spy.callCount).to.equal(4);
    });

    it('should pass in the node', () => {
      const spy = sinon.spy();
      const node = (
        <div>
          <button />
          <nav>
            <input />
          </nav>
        </div>
      );
      treeForEach(node, spy);
      expect(spy.callCount).to.equal(4);
      expect(spy.args[0][0].type).to.equal("div");
      expect(spy.args[1][0].type).to.equal("button");
      expect(spy.args[2][0].type).to.equal("nav");
      expect(spy.args[3][0].type).to.equal("input");
    });

  });

  describe('treeFilter', () => {
    const tree = (
      <div>
        <button />
        <button />
        <nav>
          <input />
        </nav>
      </div>
    );

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

  describe('iuSimpleSelector', () => {

    describe('prohibited selectors', () => {
      var isComplex = function(selector) {
        it(selector, () => {
          expect(isSimpleSelector(selector)).to.be.false;
        });
      };

      isComplex('.foo .bar');
      isComplex('input[name="foo"]');
      isComplex(':visible');
      isComplex('.foo>.bar');
      isComplex('.foo > .bar');
      isComplex('.foo~.bar');

    });

    describe('allowed selectors', () => {
      var isSimple = function(selector) {
        it(selector, () => {
          expect(isSimpleSelector(selector)).to.be.true;
        });
      };

      isSimple('.foo');
      isSimple('.foo-and-foo');
      isSimple('.FoOaNdFoO');
      isSimple('tag');
      isSimple('.foo.bar');
      isSimple('input.foo');

    });

  });

});
