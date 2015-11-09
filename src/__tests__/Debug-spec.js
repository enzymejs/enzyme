import { expect } from 'chai';
import React from 'react';
import {
  spaces,
  indent,
  debugNode,
} from '../Debug';

describe('debug', () => {

  describe('spaces(n)', () => {
    it('should return n spaces', () => {
      expect(spaces(4)).to.equal('    ');
      expect(spaces(2)).to.equal('  ');
      expect(spaces(0)).to.equal('');
    });
  });

  describe('indent(depth, string)', () => {
    it('should indent a single-line string by (n) spaces', () => {
      expect(indent(4, 'hello')).to.equal('    hello');
      expect(indent(2, 'hello')).to.equal('  hello');
      expect(indent(0, 'hello')).to.equal('hello');
    });

    it('should intent a multiline string by (n) spaces', () => {
      expect(indent(2, 'foo\nbar')).to.equal('  foo\n  bar');
    });
  });

  describe('debugNode(node)', () => {

    it('should render a node with no props or children as single single xml tag', () => {
      expect(debugNode(<div />)).to.equal(`<div />`);
    });

    it('should render props inline inline', () => {
      expect(debugNode(
        <div id="foo" className="bar" />
      )).to.equal(
        `<div id="foo" className="bar" />`
      );
    });

    it('should render children on newline and indented', () => {
      expect(debugNode(
        <div>
          <span />
        </div>
      )).to.equal(
        `<div>
  <span />
</div>`
      );
    });

    it('should render props on root and children', () => {
      expect(debugNode(
        <div id="foo">
          <span id="bar" />
        </div>
      )).to.equal(
        `<div id="foo">
  <span id="bar" />
</div>`
      );
    });

    it('should render text on new line and indented', () => {
      expect(debugNode(
        <span>some text</span>
      )).to.equal(
        `<span>
  some text
</span>`
      );
    });

    it('should render composite components as tags w/ displayName', () => {
      class Foo extends React.Component {
        render() { return <div />; }
      }
      Foo.displayName = 'Foo'; // TODO(lmr): why do i have to do this...?

      expect(debugNode(
        <div>
          <Foo />
        </div>
      )).to.equal(
`<div>
  <Foo />
</div>`
      );

    });

    it('should render mapped children properly', () => {
      expect(debugNode(
        <div>
          <i>not in array</i>
          {['a', 'b', 'c']}
        </div>
      )).to.equal(
`<div>
  <i>
    not in array
  </i>
  a
  b
  c
</div>`
      );
    });

    it('renders html entities properly', () => {
      expect(debugNode(
        <div>&gt;</div>
      )).to.equal(
`<div>
  &gt;
</div>`
      );
    });

    it('should not render falsy children ', () => {
      expect(debugNode(
        <div id="foo">{false}</div>
      )).to.equal(
`<div id="foo" />`
      );
    });

  });

});
