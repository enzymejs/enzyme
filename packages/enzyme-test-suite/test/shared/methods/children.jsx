import React from 'react';
import { expect } from 'chai';

import {
  describeIf,
} from '../../_helpers';
import { is } from '../../_helpers/version';

export default function describeChildren({
  Wrap,
  WrapRendered,
  isShallow,
}) {
  describe('.children([selector])', () => {
    it('returns empty wrapper for node with no children', () => {
      const wrapper = Wrap(<div />);
      expect(wrapper.children()).to.have.lengthOf(0);
    });

    it('includes text nodes', () => {
      const wrapper = Wrap(<div>B<span />C</div>).children();
      expect(wrapper).to.have.lengthOf(3);
    });

    it('does not attempt to get an instance for text nodes', () => {
      const wrapper = WrapRendered(<div>B<span />C</div>);
      expect(wrapper).to.have.lengthOf(isShallow ? 1 : 3);
    });

    it('skips the falsy children', () => {
      const wrapper = Wrap((
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
      ));
      expect(wrapper.childAt(0).children()).to.have.lengthOf(1);
      expect(wrapper.childAt(1).children()).to.have.lengthOf(1);
      expect(wrapper.childAt(2).children()).to.have.lengthOf(1);
    });

    it('returns the children nodes of the root', () => {
      const wrapper = Wrap((
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
      const wrapper = Wrap((
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
          const { items } = this.props;
          return (
            <div>
              <span className="foo" />
              {items.map((x) => x)}
            </div>
          );
        }
      }
      const wrapper = WrapRendered((
        <Foo
          items={[
            <i key={1} className="bar">abc</i>,
            <i key={2} className="baz">def</i>,
          ]}
        />
      ));
      expect(wrapper.children()).to.have.lengthOf(3);
      expect(wrapper.children().at(0).hasClass('foo')).to.equal(true);
      expect(wrapper.children().at(1).hasClass('bar')).to.equal(true);
      expect(wrapper.children().at(2).hasClass('baz')).to.equal(true);
    });

    it('optionally allows a selector to filter by', () => {
      const wrapper = Wrap((
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

    describeIf(is('> 0.13'), 'stateless function components (SFCs)', () => {
      it('handles mixed children with and without arrays', () => {
        const Foo = ({ items }) => (
          <div>
            <span className="foo" />
            {items.map((x) => x)}
          </div>
        );

        const wrapper = WrapRendered((
          <Foo
            items={[
              <i key={1} className="bar">abc</i>,
              <i key={2} className="baz">def</i>,
            ]}
          />
        ));
        expect(wrapper.children()).to.have.lengthOf(3);
        expect(wrapper.children().at(0).hasClass('foo')).to.equal(true);
        expect(wrapper.children().at(1).hasClass('bar')).to.equal(true);
        expect(wrapper.children().at(2).hasClass('baz')).to.equal(true);
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

      const wrapper = Wrap(<Foo />);
      const children = wrapper.children();
      const textNodes = children.map((x) => x.text());
      const expectedShallowNodes = ['Foo', ' Bar ', 'Foo', ' Bar ', 'Foo'];
      const expectedTextNodes = isShallow ? expectedShallowNodes : [expectedShallowNodes.join('')];
      expect(textNodes).to.eql(expectedTextNodes);
    });

    it('renders children separated by spaces', () => {
      class JustificationRow extends React.Component {
        render() {
          const { children } = this.props;
          const wrappedChildren = React.Children.map(
            children,
            (child) => child && <span>{child}</span>,
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

      const wrapper = WrapRendered((
        <JustificationRow>
          <div>foo</div>
          <div>bar</div>
          <div>baz</div>
        </JustificationRow>
      ));

      expect(wrapper.children().map((x) => x.debug())).to.eql([
        `<span>
  <div>
    foo
  </div>
</span>`,
        ' ',
        `<span>
  <div>
    bar
  </div>
</span>`,
        ' ',
        `<span>
  <div>
    baz
  </div>
</span>`,
      ]);
    });
  });
}
