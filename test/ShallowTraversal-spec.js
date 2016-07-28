import React from 'react';
import sinon from 'sinon';
import { expect } from 'chai';
import {
  splitSelector,
} from '../src/Utils';
import {
  hasClassName,
  nodeHasProperty,
  treeForEach,
  treeFilter,
  pathToNode,
  getTextFromNode,
} from '../src/ShallowTraversal';
import { describeIf } from './_helpers';
import { REACT013 } from '../src/version';

describe('ShallowTraversal', () => {

  describe('splitSelector', () => {
    const fn = splitSelector;
    it('splits multiple class names', () => {
      expect(fn('.foo.bar')).to.eql(['.foo', '.bar']);
      expect(fn('.foo.bar.baz')).to.eql(['.foo', '.bar', '.baz']);
    });

    it('splits tag names and class names', () => {
      expect(fn('input.bar')).to.eql(['input', '.bar']);
      expect(fn('div.bar.baz')).to.eql(['div', '.bar', '.baz']);
      expect(fn('Foo.bar')).to.eql(['Foo', '.bar']);
    });

    it('splits tag names and attributes', () => {
      expect(fn('input[type="text"]')).to.eql(['input', '[type="text"]']);
      expect(
        fn('div[title="title"][data-value="foo"]')
      ).to.eql(['div', '[title="title"]', '[data-value="foo"]']);
    });
  });

  describe('hasClassName', () => {

    it('should work for standalone classNames', () => {
      const node = (<div className="foo" />);
      expect(hasClassName(node, 'foo')).to.equal(true);
      expect(hasClassName(node, 'bar')).to.equal(false);
    });

    it('should work for multiple classNames', () => {
      const node = (<div className="foo bar baz" />);
      expect(hasClassName(node, 'foo')).to.equal(true);
      expect(hasClassName(node, 'bar')).to.equal(true);
      expect(hasClassName(node, 'baz')).to.equal(true);
      expect(hasClassName(node, 'bax')).to.equal(false);
    });

    it('should also allow hyphens', () => {
      const node = (<div className="foo-bar" />);
      expect(hasClassName(node, 'foo-bar')).to.equal(true);
    });

    it('should work if className has a function in toString property', () => {
      function classes() {}
      classes.toString = () => 'foo-bar';
      const node = (<div className={classes} />);
      expect(hasClassName(node, 'foo-bar')).to.equal(true);
    });
  });

  describe('nodeHasProperty', () => {

    it('should find properties', () => {
      function noop() {}
      const node = (<div onChange={noop} title="foo" />);

      expect(nodeHasProperty(node, 'onChange')).to.equal(true);
      expect(nodeHasProperty(node, 'title', '"foo"')).to.equal(true);
    });

    it('should not match on html attributes', () => {
      const node = (<div htmlFor="foo" />);

      expect(nodeHasProperty(node, 'for', '"foo"')).to.equal(false);
    });

    it('should not find undefined properties', () => {
      const node = (<div title={undefined} />);

      expect(nodeHasProperty(node, 'title')).to.equal(false);
    });

    it('should parse false as a literal', () => {
      const node = (<div foo={false} />);

      expect(nodeHasProperty(node, 'foo', 'false')).to.equal(true);
    });

    it('should parse false as a literal', () => {
      const node = (<div foo />);

      expect(nodeHasProperty(node, 'foo', 'true')).to.equal(true);
    });

    it('should parse numbers as numeric literals', () => {
      expect(nodeHasProperty(<div foo={2.3} />, 'foo', '2.3')).to.equal(true);
      expect(nodeHasProperty(<div foo={2} />, 'foo', '2')).to.equal(true);
      expect(() => nodeHasProperty(<div foo={2} />, 'foo', '2abc')).to.throw();
      expect(() => nodeHasProperty(<div foo={2} />, 'foo', 'abc2')).to.throw();
      expect(nodeHasProperty(<div foo={-2} />, 'foo', '-2')).to.equal(true);
      expect(nodeHasProperty(<div foo={2e8} />, 'foo', '2e8')).to.equal(true);
      expect(nodeHasProperty(<div foo={Infinity} />, 'foo', 'Infinity')).to.equal(true);
      expect(nodeHasProperty(<div foo={-Infinity} />, 'foo', '-Infinity')).to.equal(true);
    });

    it('should throw when un unquoted string is passed in', () => {
      const node = (<div title="foo" />);

      expect(() => nodeHasProperty(node, 'title', 'foo')).to.throw();
    });

  });

  describe('treeForEach', () => {

    it('should be called once for a leaf node', () => {
      const spy = sinon.spy();
      const node = (<div />);
      treeForEach(node, spy);
      expect(spy.calledOnce).to.equal(true);
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

    it('should not get trapped from empty strings', () => {
      const spy = sinon.spy();
      const node = (
        <div>
          <p>{""}</p>
        </div>
      );
      treeForEach(node, spy);
      expect(spy.callCount).to.equal(3);
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
      expect(spy.args[0][0].type).to.equal('div');
      expect(spy.args[1][0].type).to.equal('button');
      expect(spy.args[2][0].type).to.equal('nav');
      expect(spy.args[3][0].type).to.equal('input');
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
      expect(treeFilter(tree, node => node.type === 'nav').length).to.equal(1);
      expect(treeFilter(tree, node => node.type === 'button').length).to.equal(2);
    });

  });

  describe('pathToNode', () => {
    it('should return trees from the root node', () => {
      const node = <label />;
      const tree = (
        <div>
          <button />
          <nav>
            {node}
            <input />
          </nav>
        </div>
      );

      const result = pathToNode(node, tree);
      expect(result.length).to.equal(2);
      expect(result[0].type).to.equal('div');
      expect(result[1].type).to.equal('nav');
    });

    it('should return trees from the root node except the sibling node', () => {
      const node = <label />;
      const tree = (
        <div>
          <button />
          <nav>
            {node}
            <div><input /></div>
          </nav>
        </div>
      );

      const result = pathToNode(node, tree);
      expect(result.length).to.equal(2);
      expect(result[0].type).to.equal('div');
      expect(result[1].type).to.equal('nav');
    });

  });

  describe('getTextFromNode', () => {
    it('should return displayName for functions that provides one', () => {
      class Subject extends React.Component {
        render() {
          return (
            <div />
          );
        }
      }
      Subject.displayName = 'CustomSubject';
      const node = <Subject />;
      const result = getTextFromNode(node);
      expect(result).to.equal('<CustomSubject />');
    });

    it('should return function name if displayName is not provided', () => {
      class Subject extends React.Component {
        render() {
          return (
            <div />
          );
        }
      }
      const node = <Subject />;
      const result = getTextFromNode(node);
      expect(result).to.equal('<Subject />');
    });

    describeIf(!REACT013, 'stateless function components', () => {

      it('should return displayName for functions that provides one', () => {
        const Subject = () => <div />;
        Subject.displayName = 'CustomSubject';

        const node = <Subject />;
        const result = getTextFromNode(node);
        expect(result).to.equal('<CustomSubject />');
      });

      it('should return function name if displayName is not provided', () => {
        const Subject = () => <div />;

        const node = <Subject />;
        const result = getTextFromNode(node);
        expect(result).to.equal('<Subject />');
      });
    });
  });
});
