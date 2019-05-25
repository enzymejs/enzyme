import React from 'react';
import { expect } from 'chai';
import wrap from 'mocha-wrap';
import getData from 'html-element-map/getData';

import getAdapter from 'enzyme/build/getAdapter';

import {
  describeIf,
  describeWithDOM,
  itIf,
} from '../../_helpers';
import { is } from '../../_helpers/version';

import {
  createPortal,
  Fragment,
  forwardRef,
  memo,
  useState,
} from '../../_helpers/react-compat';

export default function describeFind({
  Wrap,
  WrapRendered,
  isShallow,
  isMount,
  hasDOM,
  makeDOMElement,
}) {
  describe('.find(selector)', () => {
    it('matches the root DOM element', () => {
      const wrapper = Wrap(<div id="ttt" className="ttt">hello</div>);
      expect(wrapper.find('#ttt')).to.have.lengthOf(1);
      expect(wrapper.find('.ttt')).to.have.lengthOf(1);
    });

    it('finds an element based on a class name', () => {
      const wrapper = Wrap((
        <div>
          <input className="foo" />
        </div>
      ));
      expect(wrapper.find('.foo').type()).to.equal('input');
    });

    it('finds an SVG element based on a class name', () => {
      const wrapper = Wrap((
        <div>
          <svg className="foo" />
        </div>
      ));
      expect(wrapper.find('.foo').type()).to.equal('svg');
    });

    it('finds an element that has dot in attribute', () => {
      const wrapper = Wrap((
        <div>
          <div data-baz="foo.bar" />
        </div>
      ));

      const elements = wrapper.find('[data-baz="foo.bar"]');
      expect(elements).to.have.lengthOf(1);
    });

    it('finds an element based on a tag name', () => {
      const wrapper = Wrap((
        <div>
          <input className="foo" />
          <button type="button" className="bar">Button</button>
          <textarea className="magic" />
          <select className="reality" />
        </div>
      ));
      expect(wrapper.find('input').props()).to.eql({ className: 'foo' });
      expect(wrapper.find('button').props()).to.eql({
        className: 'bar',
        children: 'Button',
        type: 'button',
      });
      expect(wrapper.find('textarea').props()).to.eql({ className: 'magic' });
      expect(wrapper.find('select').props()).to.eql({ className: 'reality' });
    });

    it('finds an element based on a tag name and class name', () => {
      const wrapper = Wrap((
        <div>
          <input className="foo" />
          <div className="foo" />
        </div>
      ));
      expect(wrapper.find('input.foo')).to.have.lengthOf(1);
    });

    it('finds an element based on a tag name and id', () => {
      const wrapper = Wrap((
        <div>
          <input id="foo" />
        </div>
      ));
      expect(wrapper.find('input#foo')).to.have.lengthOf(1);
    });

    it('finds an element based on a tag name, id, and class name', () => {
      const wrapper = Wrap((
        <div>
          <input id="foo" className="bar" />
        </div>
      ));
      expect(wrapper.find('input#foo.bar')).to.have.lengthOf(1);
    });

    it('finds an element that with class and attribute', () => {
      const wrapper = Wrap((
        <div>
          <div data-baz="bar" className="classBar" />
        </div>
      ));

      const elements = wrapper.find('.classBar[data-baz="bar"]');
      expect(elements).to.have.lengthOf(1);
    });

    it('finds an element that with multiple classes and one attribute', () => {
      const wrapper = Wrap((
        <div>
          <div data-baz="bar" className="classBar classFoo" />
        </div>
      ));

      const elements = wrapper.find('.classBar.classFoo[data-baz="bar"]');
      expect(elements).to.have.lengthOf(1);
    });

    it('finds an element that with class and class with hyphen', () => {
      const wrapper = Wrap((
        <div>
          <div data-baz="bar" className="classBar class-Foo" />
        </div>
      ));

      const elements = wrapper.find('.classBar.class-Foo');
      expect(elements).to.have.lengthOf(1);
    });

    it('finds a component based on a constructor', () => {
      class Foo extends React.Component {
        render() { return <div />; }
      }
      const wrapper = Wrap((
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
        const wrapper = Wrap((
          <div>
            <Foo className="foo" />
          </div>
        ));

        expect(() => wrapper.find(Foo)).to.throw(
          TypeError,
          'Enzyme::Selector expects a string, object, or valid element type (Component Constructor)',
        );
      });

    it('finds a component based on a component function name', () => {
      class Foo extends React.Component {
        render() { return <div />; }
      }
      const wrapper = Wrap((
        <div>
          <Foo className="foo" />
        </div>
      ));
      expect(wrapper.find('Foo').type()).to.equal(Foo);
    });

    it('finds a component based on a component displayName', () => {
      class Foo extends React.Component {
        render() { return <div />; }
      }
      Foo.displayName = 'Bar';

      const wrapper = Wrap((
        <div>
          <Foo className="foo" />
        </div>
      ));
      expect(wrapper.find('Bar').type()).to.equal(Foo);
    });

    it('finds multiple elements based on a class name', () => {
      const wrapper = Wrap((
        <div>
          <input className="foo" />
          <button type="button" className="foo" />
        </div>
      ));
      expect(wrapper.find('.foo')).to.have.lengthOf(2);
    });

    it('finds multiple elements based on a tag name', () => {
      const wrapper = Wrap((
        <div>
          <input className="foo" />
          <input />
          <button type="button" />
        </div>
      ));
      expect(wrapper.find('input')).to.have.lengthOf(2);
      expect(wrapper.find('button')).to.have.lengthOf(1);
    });

    it('finds multiple elements based on a constructor', () => {
      class Foo extends React.Component {
        render() {
          return <div />;
        }
      }
      class Bar extends React.Component {
        render() {
          return <div />;
        }
      }

      const wrapper = Wrap((
        <div>
          <Foo className="foo" />
          <Foo />
          <Bar />
        </div>
      ));
      expect(wrapper.find(Foo)).to.have.lengthOf(2);
      expect(wrapper.find(Bar)).to.have.lengthOf(1);
    });

    it('finds multiple elements based on a string prop', () => {
      const wrapper = Wrap((
        <div>
          <span title="foo" />
          <span htmlFor="foo" />
          <div htmlFor="bar" />
        </div>
      ));

      expect(wrapper.find('[htmlFor="foo"]')).to.have.lengthOf(1);
      expect(wrapper.find('[htmlFor]')).to.have.lengthOf(2);
      expect(wrapper.find('[title="foo"]')).to.have.lengthOf(1);
      expect(wrapper.find('[title]')).to.have.lengthOf(1);
    });

    it('finds multiple elements with multiple matching react props', () => {
      function noop() {}
      const wrapper = Wrap((
        <div>
          <span htmlFor="foo" onChange={noop} preserveAspectRatio="xMaxYMax" />
        </div>
      ));

      expect(wrapper.find('span[htmlFor="foo"][onChange]')).to.have.lengthOf(1);
      expect(wrapper.find('span[htmlFor="foo"][preserveAspectRatio="xMaxYMax"]')).to.have.lengthOf(1);
      expect(wrapper.find('[htmlFor][preserveAspectRatio]')).to.have.lengthOf(1);
    });

    it('works on non-single nodes', () => {
      const wrapper = Wrap((
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

    it('works with an adjacent sibling selector', () => {
      const a = 'some';
      const b = 'text';
      const wrapper = Wrap((
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

    it('throws for non-numeric attribute values without quotes', () => {
      const wrapper = Wrap((
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

    it('errors sensibly if any of the search props are undefined', () => {
      const wrapper = Wrap((
        <div>
          <input type={undefined} />
        </div>
      ));

      expect(() => wrapper.find({ type: undefined })).to.throw(
        TypeError,
        'Enzyme::Props can’t have `undefined` values. Try using ‘findWhere()’ instead.',
      );
    });

    it('does not find property when undefined', () => {
      const wrapper = Wrap((
        <div>
          <span data-foo={undefined} />
        </div>
      ));

      expect(wrapper.find('[data-foo]')).to.have.lengthOf(0);
    });

    it('compounds tag and prop selector', () => {
      const wrapper = Wrap((
        <div>
          <span preserveAspectRatio="xMaxYMax" />
          <span htmlFor="foo" />
        </div>
      ));

      expect(wrapper.find('span[preserveAspectRatio="xMaxYMax"]')).to.have.lengthOf(1);
      expect(wrapper.find('span[preserveAspectRatio]')).to.have.lengthOf(1);

      expect(wrapper.find('span[htmlFor="foo"]')).to.have.lengthOf(1);
      expect(wrapper.find('span[htmlFor]')).to.have.lengthOf(1);
    });

    it('supports data prop selectors', () => {
      const wrapper = Wrap((
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

    it('supports boolean and numeric values for matching props', () => {
      const wrapper = Wrap((
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

    it('does not find key or ref via property selector', () => {
      const arrayOfComponents = [<div key="1" />, <div key="2" />];

      class Foo extends React.Component {
        render() {
          return (
            <div>
              <div ref="foo" />
              {arrayOfComponents}
            </div>
          );
        }
      }
      const wrapper = Wrap(<Foo />);

      expect(wrapper.find('div[ref="foo"]')).to.have.lengthOf(0);
      expect(wrapper.find('div[key="1"]')).to.have.lengthOf(0);
      expect(wrapper.find('[ref]')).to.have.lengthOf(0);
      expect(wrapper.find('[key]')).to.have.lengthOf(0);
    });

    it('supports object property selectors', () => {
      const wrapper = Wrap((
        <div>
          <input type="text" data-test="ref" className="foo" />
          <input type="text" data-test="ref" />
          <button type="button" data-test="ref" data-prop={undefined} />
          <span data-test="ref" data-prop={null} />
          <div data-test="ref" data-prop={123} />
          <input type="text" data-test="ref" data-prop={false} />
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

    it('supports complex and nested object property selectors', () => {
      const testFunction = () => ({});
      const wrapper = Wrap((
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

    it('throws when given empty object, null, or an array', () => {
      const wrapper = Wrap((
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

    it('queries attributes with spaces in their values', () => {
      const wrapper = Wrap((
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

    describeIf(is('> 0.13'), 'stateless function components (SFCs)', () => {
      it('finds a component based on a constructor', () => {
        const Foo = () => (<div />);

        const wrapper = Wrap((
          <div>
            <Foo className="foo" />
          </div>
        ));
        expect(wrapper.find(Foo).type()).to.equal(Foo);
      });

      it('finds a component based on a function name', () => {
        const Foo = () => (<div />);

        const wrapper = Wrap((
          <div>
            <Foo className="foo" />
          </div>
        ));
        expect(wrapper.find('Foo').type()).to.equal(Foo);
      });

      it('finds a component based on a displayName', () => {
        const Foo = () => (<div />);
        Foo.displayName = 'Bar';

        const wrapper = Wrap((
          <div>
            <Foo className="foo" />
          </div>
        ));
        expect(wrapper.find('Bar').type()).to.equal(Foo);
      });

      itIf(!isShallow, 'finds a stateless component based on a component displayName if rendered by function', () => {
        const Foo = () => <div />;
        const renderStatelessComponent = () => <Foo className="foo" />;
        const wrapper = Wrap((
          <div>
            {renderStatelessComponent()}
          </div>
        ));
        expect(wrapper.find('Foo').type()).to.equal(Foo);
      });

      it('does not find key via property selector', () => {
        const arrayOfComponents = [<div key="1" />, <div key="2" />];

        const Foo = () => (
          <div>
            {arrayOfComponents}
          </div>
        );

        const wrapper = WrapRendered(<Foo />);

        expect(wrapper.find('div[key="1"]')).to.have.lengthOf(0);
        expect(wrapper.find('[key]')).to.have.lengthOf(0);
      });
    });

    describe('works with attribute selectors containing #', () => {
      let wrapper;
      beforeEach(() => {
        wrapper = Wrap((
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
        const wrapper = WrapRendered(<Foo />);
        expect(wrapper.html()).to.contain('data-custom-tag="bookIcon"'); // sanity check
        const elements = wrapper.find('[data-custom-tag="bookIcon"]');
        expect(elements).to.have.lengthOf(2);
        expect(elements.filter('i')).to.have.lengthOf(2);
      });
    });

    describeIf(is('>= 16.2'), 'works with Fragments', () => {
      const NestedFragmentComponent = () => (
        <div className="container">
          <Fragment>
            <span>A span</span>
            <span>B span</span>
            <div>A div</div>
            <Fragment>
              <span>C span</span>
            </Fragment>
          </Fragment>
          <span>D span</span>
        </div>
      );

      it('finds descendant span inside React.Fragment', () => {
        const wrapper = Wrap(<NestedFragmentComponent />);
        expect(wrapper.find('.container span')).to.have.lengthOf(4);
      });

      it('does not find nonexistent p inside React.Fragment', () => {
        const wrapper = Wrap(<NestedFragmentComponent />);
        expect(wrapper.find('.container p')).to.have.lengthOf(0);
      });

      it('finds direct child span inside React.Fragment', () => {
        const wrapper = Wrap(<NestedFragmentComponent />);
        expect(wrapper.find('.container > span')).to.have.lengthOf(4);
      });

      it('handles adjacent sibling selector inside React.Fragment', () => {
        const wrapper = Wrap(<NestedFragmentComponent />);
        expect(wrapper.find('.container span + div')).to.have.lengthOf(1);
      });

      it('handles general sibling selector inside React.Fragment', () => {
        const wrapper = Wrap(<NestedFragmentComponent />);
        expect(wrapper.find('.container div ~ span')).to.have.lengthOf(2);
      });

      // FIXME: investigate if/why mount requires the version range
      itIf(!isMount || is('>= 16.4.1'), 'handles fragments with no content', () => {
        const EmptyFragmentComponent = () => (
          <div className="container">
            <Fragment>
              <Fragment />
            </Fragment>
          </div>
        );
        const wrapper = WrapRendered(<EmptyFragmentComponent />);

        expect(wrapper.find('.container > span')).to.have.lengthOf(0);
        expect(wrapper.find('.container span')).to.have.lengthOf(0);
        expect(wrapper).to.have.lengthOf(1);
        expect(wrapper.children()).to.have.lengthOf(0);
      });
    });

    describeIf(is('>= 16'), 'works with Portals', () => {
      it('finds portals by name', () => {
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

        expect(wrapper.find('Portal')).to.have.lengthOf(1);
      });

      context('finding through portals', () => {
        let containerDiv;
        let FooPortal;
        let wrapper;
        beforeEach(() => {
          containerDiv = makeDOMElement();
          FooPortal = class FooPortalContainer extends React.Component {
            render() {
              const { children } = this.props;
              return createPortal(children, containerDiv);
            }
          };
          wrapper = Wrap((
            <FooPortal>
              <h1>Successful Portal!</h1>
              <span />
            </FooPortal>
          ));
        });

        it('finds elements', () => {
          expect(wrapper.find('h1')).to.have.lengthOf(1);
          expect(wrapper.find('span')).to.have.lengthOf(1);
        });

        itIf(hasDOM, 'finds elements with qSA', () => {
          expect(containerDiv.querySelectorAll('h1')).to.have.lengthOf(1);
        });
      });
    });

    describeIf(is('>= 16.3'), 'forwardRef', () => {
      it('finds forwardRefs', () => {
        const Component = forwardRef(() => <div />);
        class Foo extends React.Component {
          render() {
            return (
              <div>
                <Component />
                <Component />
              </div>
            );
          }
        }

        const wrapper = Wrap(<Foo />);
        expect(wrapper.find(Component)).to.have.lengthOf(2);
        expect(wrapper.find('ForwardRef')).to.have.lengthOf(2);
      });

      it('finds forwardRef by custom display name', () => {
        const Component = forwardRef(() => <div />);
        Component.displayName = 'CustomForwardRef';
        class Foo extends React.Component {
          render() {
            return (
              <div>
                <Component />
                <Component />
              </div>
            );
          }
        }

        const wrapper = Wrap(<Foo />);
        expect(wrapper.find(Component)).to.have.lengthOf(2);
        expect(wrapper.find(Component.displayName)).to.have.lengthOf(2);
      });
    });

    describeIf(is('>= 16.8'), 'hooks', () => {
      it('handles useState', () => {
        const ComponentUsingStateHook = () => {
          const [count] = useState(0);
          return <div>{count}</div>;
        };

        const wrapper = Wrap(<ComponentUsingStateHook />);

        expect(wrapper.find('div')).to.have.lengthOf(1);
        expect(wrapper.find('div').text()).to.equal('0');
      });

      it('handles setState returned from useState', () => {
        const ComponentUsingStateHook = () => {
          const [count, setCount] = useState(0);
          return <div onClick={() => setCount(count + 1)}>{count}</div>;
        };

        const wrapper = Wrap(<ComponentUsingStateHook />);
        wrapper.simulate('click'); // FIXME: avoid simulate

        expect(wrapper.find('div').text()).to.equal('1');
      });

      it('handles keep hook state for same component type', () => {
        const ComponentUsingStateHook = () => {
          const [count, setCount] = useState(0);
          return <div onClick={() => setCount(count + 1)}>{count}</div>;
        };

        const wrapper = Wrap(<ComponentUsingStateHook />);
        wrapper.simulate('click'); // FIXME: avoid simulate
        expect(wrapper.find('div').text()).to.equal('1');

        wrapper.setProps({ newProp: 1 });
        expect(wrapper.find('div').text()).to.equal('1');

        wrapper.simulate('click'); // FIXME: avoid simulate
        expect(wrapper.find('div').text()).to.equal('2');
      });
    });

    describeWithDOM('find DOM elements by constructor', () => {
      // in React 0.13 and 0.14, these HTML tags get moved around by the DOM, and React fails
      // they're tested in `shallow`, and in React 15+, so we can skip them here.
      const tagsWithRenderError = new Set([
        'body',
        'frame',
        'frameset',
        'head',
        'html',
        'caption',
        'td',
        'th',
        'tr',
        'col',
        'colgroup',
        'tbody',
        'thead',
        'tfoot',
      ]);
      function hasRenderError(Tag) {
        return isMount && is('< 15') && tagsWithRenderError.has(Tag);
      }

      const { elements, all } = getData();

      elements.filter(({ constructor: C }) => C && C !== all).forEach(({
        tag: Tag,
        constructorName: name,
      }) => {
        class Foo extends React.Component {
          render() {
            return <Tag />;
          }
        }

        itIf(!hasRenderError(Tag), `${Tag}: found with \`${name}\``, () => {
          const wrapper = WrapRendered(<Foo />);

          expect(wrapper.type()).to.equal(Tag);
          expect(wrapper.is(Tag)).to.equal(true);
          expect(wrapper.filter(Tag)).to.have.lengthOf(1);
        });
      });
    });

    describeIf(is('>= 16.6'), 'React.memo', () => {
      it('works with an SFC', () => {
        function InnerComp({ message }) {
          return <div><span>{message}</span></div>;
        }
        const InnerMemo = memo(InnerComp);
        const InnerFoo = ({ foo }) => (
          <div>
            <InnerComp message="Hello" />
            <InnerMemo message="find me?" />
            <div className="bar">bar</div>
            <div className="qoo">{foo}</div>
          </div>
        );
        const Foo = memo(InnerFoo);

        const wrapper = Wrap(<Foo foo="qux" />);
        const expectedDebug = isShallow
          ? `<div>
  <InnerComp message="Hello" />
  <Memo(InnerComp) message="find me?" />
  <div className="bar">
    bar
  </div>
  <div className="qoo">
    qux
  </div>
</div>`
          : `<Memo(InnerFoo) foo="qux">
  <div>
    <InnerComp message="Hello">
      <div>
        <span>
          Hello
        </span>
      </div>
    </InnerComp>
    <Memo(InnerComp) message="find me?">
      <div>
        <span>
          find me?
        </span>
      </div>
    </Memo(InnerComp)>
    <div className="bar">
      bar
    </div>
    <div className="qoo">
      qux
    </div>
  </div>
</Memo(InnerFoo)>`;
        expect(wrapper.debug()).to.equal(expectedDebug);
        expect(wrapper.find('InnerComp')).to.have.lengthOf(1);
        expect(wrapper.find('Memo(InnerComp)')).to.have.lengthOf(1);
        expect(wrapper.find('.bar')).to.have.lengthOf(1);
        expect(wrapper.find('.qoo').text()).to.equal('qux');
        expect(wrapper.find(InnerMemo)).to.have.lengthOf(1);
      });

      it('works with a class component', () => {
        class InnerComp extends React.Component {
          render() {
            return <div><span>Hello</span></div>;
          }
        }

        class Foo extends React.Component {
          render() {
            const { foo } = this.props;
            return (
              <div>
                <InnerComp />
                <div className="bar">bar</div>
                <div className="qoo">{foo}</div>
              </div>
            );
          }
        }
        const FooMemo = memo(Foo);

        const wrapper = Wrap(<FooMemo foo="qux" />);
        const expectedDebug = isShallow
          ? `<div>
  <InnerComp />
  <div className="bar">
    bar
  </div>
  <div className="qoo">
    qux
  </div>
</div>`
          : `<Foo foo="qux">
  <div>
    <InnerComp>
      <div>
        <span>
          Hello
        </span>
      </div>
    </InnerComp>
    <div className="bar">
      bar
    </div>
    <div className="qoo">
      qux
    </div>
  </div>
</Foo>`;
        expect(wrapper.debug()).to.equal(expectedDebug);
        expect(wrapper.find('InnerComp')).to.have.lengthOf(1);
        expect(wrapper.find('.bar')).to.have.lengthOf(1);
        expect(wrapper.find('.qoo').text()).to.equal('qux');
      });
    });
  });
}
