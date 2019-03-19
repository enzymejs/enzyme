import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon-sandbox';
import { Portal } from 'react-is';

import {
  describeIf,
  itIf,
} from '../../_helpers';
import realArrowFunction from '../../_helpers/realArrowFunction';
import { is } from '../../_helpers/version';

import {
  createPortal,
  Fragment,
} from '../../_helpers/react-compat';

export default function describeFindWhere({
  Wrap,
  WrapRendered,
  Wrapper,
  isShallow,
  makeDOMElement,
}) {
  describe('.findWhere(predicate)', () => {
    it('returns all elements for a truthy test', () => {
      const wrapper = Wrap((
        <div>
          <input className="foo" />
          <input />
        </div>
      ));
      expect(wrapper.findWhere(() => true)).to.have.lengthOf(3);
    });

    it('returns no elements for a falsy test', () => {
      const wrapper = Wrap((
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

      const wrapper = WrapRendered(<EditableText />);

      const stub = sinon.stub();
      wrapper.findWhere(stub);
      const passedNodeLengths = stub.getCalls().map(({ args: [firstArg] }) => firstArg.length);
      expect(passedNodeLengths).to.eql([1]);
    });

    it('calls the predicate with the wrapped node as the first argument', () => {
      const wrapper = Wrap((
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
      expect(spy.args[0][0]).to.be.instanceOf(Wrapper);
      expect(spy.args[1][0]).to.be.instanceOf(Wrapper);
      expect(spy.args[2][0]).to.be.instanceOf(Wrapper);
      expect(spy.args[3][0]).to.be.instanceOf(Wrapper);
      expect(spy.args[1][0].hasClass('bar')).to.equal(true);
      expect(spy.args[2][0].hasClass('baz')).to.equal(true);
      expect(spy.args[3][0].hasClass('bux')).to.equal(true);
    });

    it('finds nodes', () => {
      class Foo extends React.Component {
        render() {
          const { selector } = this.props;
          return (
            <div>
              <span data-foo={selector} />
              <i data-foo={selector} />
            </div>
          );
        }
      }

      const selector = 'blah';
      const wrapper = Wrap(<Foo selector={selector} />);
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
            const { selector } = this.props;
            return (
              <div>
                <Fragment>
                  <span data-foo={selector} />
                  <i data-foo={selector} />
                  <Fragment>
                    <i data-foo={selector} />
                  </Fragment>
                </Fragment>
                <span data-foo={selector} />
              </div>
            );
          }
        }

        const selector = 'blah';
        const wrapper = Wrap(<FragmentFoo selector={selector} />);
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
          const { selector } = this.props;
          return (
            <div>
              <span data-foo={selector} />
              {selector === 'baz' ? <i data-foo={selector} /> : null}
            </div>
          );
        }
      }

      const selector = 'blah';
      const wrapper = Wrap(<Foo selector={selector} />);
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
          const { selector } = this.props;
          return (
            <div>
              <header>
                <span />
                {emptyString && <i />}
              </header>
              <div>
                <span data-foo={selector}>Test</span>
              </div>
            </div>
          );
        }
      }

      const selector = 'blah';
      const wrapper = Wrap(<Foo selector={selector} />);
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

    class HasDataFoo extends React.Component {
      render() {
        const { data } = this.props;
        return (
          <div data-foo={data}>Test Component</div>
        );
      }
    }

    it('returns props object when props() is called', () => {
      const content = 'blah';
      const wrapper = WrapRendered(<HasDataFoo data={content} />);
      expect(wrapper.props()).to.deep.equal({ 'data-foo': content, children: 'Test Component' });
    });

    it('returns shallow rendered string when debug() is called', () => {
      const content = 'blah';
      const wrapper = Wrap(<HasDataFoo data={content} />);
      const expectedDebug = isShallow
        ? `<div data-foo="${content}">
  Test Component
</div>`
        : `<HasDataFoo data="${content}">
  <div data-foo="${content}">
    Test Component
  </div>
</HasDataFoo>`;
      expect(wrapper.debug()).to.equal(expectedDebug);
    });

    describeIf(is('> 0.13'), 'stateless function components (SFCs)', () => {
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
        const wrapper = Wrap(<SFC selector={selector} />);
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
        const wrapper = Wrap(<SFC selector={selector} />);
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
        const wrapper = WrapRendered(<SFC data={content} />);
        expect(wrapper.props()).to.deep.equal({ 'data-foo': content, children: 'Test SFC' });
      });

      it('returns shallow rendered string when debug() is called', () => {
        const SFC = function SFC({ data }) {
          return (
            <div data-foo={data}>Test SFC</div>
          );
        };

        const content = 'blah';
        const wrapper = Wrap(<SFC data={content} />);
        const expectedDebug = isShallow
          ? `<div data-foo="${content}">
  Test SFC
</div>`
          : `<SFC data="${content}">
  <div data-foo="${content}">
    Test SFC
  </div>
</SFC>`;
        expect(wrapper.debug()).to.equal(expectedDebug);
      });

      context('works with a nested SFC', () => {
        const Bar = realArrowFunction(<div>Hello</div>);
        class Foo extends React.Component {
          render() { return <Bar />; }
        }

        itIf(isShallow, 'works in shallow', () => {
          const wrapper = Wrap(<Foo />);
          expect(wrapper.is(Bar)).to.equal(true);
          expect(wrapper.dive().text()).to.equal('Hello');
        });

        itIf(!isShallow, 'works in non-shallow', () => {
          const wrapper = Wrap(<Foo />);
          expect(wrapper.text()).to.equal('Hello');
        });
      });
    });

    it('allows `.text()` to be called on text nodes', () => {
      const wrapper = Wrap((
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

    it('does not pass in null or false nodes', () => {
      const wrapper = Wrap((
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
      const getElement = n => (isShallow ? n.getElement() : n.getDOMNode());
      const hasElements = passedNodes.map(n => [n.debug(), getElement(n) && true]);
      const expected = [
        [wrapper.debug(), true], // root
        ['<div className="foo bar" />', true], // first div
        ['<div>\n  foo bar\n</div>', true], // second div
        ['foo bar', null], // second div's contents
      ];
      expect(hasElements).to.eql(expected);

      // the root, plus the 2 renderable children, plus the grandchild text
      expect(stub).to.have.property('callCount', 4);
    });

    it('does not pass in null or false nodes', () => {
      const wrapper = Wrap((
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

    itIf(is('>= 16'), 'finds portals by react-is Portal type', () => {
      const containerDiv = makeDOMElement();
      const Foo = () => (
        <div>
          {createPortal(
            <div className="in-portal">InPortal</div>,
            containerDiv,
          )}
        </div>
      );

      const wrapper = Wrap(<Foo />);

      expect(wrapper.findWhere(node => node.type() === Portal)).to.have.lengthOf(1);
    });
  });
}
