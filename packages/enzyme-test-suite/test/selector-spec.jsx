import React from 'react';
import { expect } from 'chai';
import {
  mount,
  shallow,
} from 'enzyme';

import './_helpers/setupAdapters';
import { describeWithDOM, describeIf } from './_helpers';

const tests = [
  {
    name: 'mount',
    renderMethod: mount,
    describeMethod: describeWithDOM,
  },
  {
    name: 'shallow',
    renderMethod: shallow,
    describeMethod: describe,
  },
];

let expectAttributeMatch;

describe('selectors', () => {
  tests.forEach(({ describeMethod, name, renderMethod }) => {
    before(() => {
      expectAttributeMatch = (element, selector, expected) => {
        const wrapper = renderMethod(element);
        expect(wrapper.is(selector)).to.equal(expected);
      };
    });
    describeMethod(name, () => {
      it('universal selector *', () => {
        const wrapper = renderMethod((
          <div>
            <div className="top-div">
              <span>inside top div</span>
            </div>

            <div className="bottom-div" />
            <span />
          </div>
        ));

        expect(wrapper.find('*')).to.have.lengthOf(5);
      });

      it('* + *', () => {
        const wrapper = renderMethod((
          <div>
            <div className="top-div">
              <span>inside top div</span>
            </div>
            <div className="bottom-div" />
            <span />
          </div>
        ));

        expect(wrapper.find('* + *')).to.have.lengthOf(2);
      });

      it('.top-div ~ *', () => {
        const wrapper = renderMethod((
          <div>
            <div className="top-div">
              <span>inside top div</span>
            </div>
            <div className="bottom-div" />
            <span />
          </div>
        ));

        expect(wrapper.find('.top-div ~ *')).to.have.lengthOf(2);
      });

      it('* > span', () => {
        const wrapper = renderMethod((
          <div>
            <div className="top-div">
              <span>inside top div</span>
            </div>
            <div className="bottom-div" />
            <span />
          </div>
        ));

        expect(wrapper.find('* > span')).to.have.lengthOf(2);
      });

      it('* .top-div *', () => {
        const wrapper = renderMethod((
          <div>
            <div className="top-div">
              <span>inside top div</span>
            </div>
            <div className="bottom-div" />
            <span id="bottom-span" />
          </div>
        ));

        expect(wrapper.find('* .top-div *')).to.have.lengthOf(1);
      });

      it('#wrap-div > *', () => {
        const wrapper = renderMethod((
          <div id="wrap-div">
            <div className="top-div">
              <span>inside top div</span>
            </div>
            <div className="bottom-div" />
            <span id="bottom-span" />
          </div>
        ));

        expect(wrapper.find('#wrap-div > *')).to.have.lengthOf(3);
      });

      it('universal selector should also find component node', () => {
        class ExampleComponent extends React.Component {
          render() {
            return <span>Hello world</span>;
          }
        }
        const wrapper = renderMethod((
          <div id="wrap-div">
            <div className="top-div">
              <ExampleComponent />
            </div>
            <div className="bottom-div" />
            <ExampleComponent />
          </div>
        ));

        expect(wrapper.find('* > ExampleComponent')).to.have.lengthOf(2);
        if (name === 'shallow') {
          // cannot render span inside ExampleComponent when shallow rendering
          expect(wrapper.find('*')).to.have.lengthOf(5);
        } else {
          expect(wrapper.find('*')).to.have.lengthOf(7);
        }
      });

      it('simple descendent', () => {
        const wrapper = renderMethod((
          <div>
            <div className="top-div">
              <span>inside top div</span>
            </div>

            <div className="bottom-div" />
            <span />
          </div>
        ));

        expect(wrapper.find('span')).to.have.lengthOf(2);
        expect(wrapper.find('.top-div span')).to.have.lengthOf(1);
        expect(wrapper.find('div div')).to.have.lengthOf(2);
      });

      it('nested descendent', () => {
        const wrapper = renderMethod((
          <div>
            <div className="my-div">
              <h1>heading</h1>
              <div>
                <div className="my-div">
                  <h1>heading</h1>
                </div>
              </div>
            </div>
            <h1>heading</h1>
          </div>
        ));

        expect(wrapper.find('h1')).to.have.lengthOf(3);
        expect(wrapper.find('.my-div h1')).to.have.lengthOf(2);
      });

      it('deep descendent', () => {
        const htmlWrapper = renderMethod((
          <div>
            <div>
              <div className="inner">
                <span>
                  <div className="way-inner">
                    <h1>heading</h1>
                  </div>
                </span>
              </div>
            </div>
            <h1>heading</h1>
          </div>
        ));

        expect(htmlWrapper.find('h1')).to.have.lengthOf(2);
        expect(htmlWrapper.find('div .inner span .way-inner h1')).to.have.lengthOf(1);
        expect(htmlWrapper.find('div div div div')).to.have.lengthOf(1);
        expect(htmlWrapper.find('div div div')).to.have.lengthOf(2);
        expect(htmlWrapper.find('div span div')).to.have.lengthOf(1);

        class ExampleComponent extends React.Component {
          render() {
            return <span>Hello world</span>;
          }
        }

        const complexWrapper = renderMethod((
          <div>
            <div>
              <ExampleComponent>
                <main />
              </ExampleComponent>
            </div>
            <ExampleComponent>
              <nav />
              <main />
            </ExampleComponent>
          </div>
        ));

        expect(complexWrapper.find('div ExampleComponent')).to.have.lengthOf(2);
        expect(complexWrapper.find('div div ExampleComponent')).to.have.lengthOf(1);
        if (name === 'shallow') {
          expect(complexWrapper.find('div ExampleComponent nav')).to.have.lengthOf(1);
          expect(complexWrapper.find('div ExampleComponent main')).to.have.lengthOf(2);
        } else { // shallow does not render the contents of components
          expect(complexWrapper.find('div ExampleComponent span')).to.have.lengthOf(2);
          expect(complexWrapper.find('div div ExampleComponent span')).to.have.lengthOf(1);
          expect(complexWrapper.find('div span')).to.have.lengthOf(2);
          expect(complexWrapper.find('div div span')).to.have.lengthOf(1);
        }
      });

      it('direct descendent', () => {
        const wrapper = renderMethod((
          <div>
            <div className="container">
              <div className="to-find">Direct</div>
              <div>
                <div className="to-find">Nested</div>
              </div>
            </div>
            <div className="to-find">Outside</div>
          </div>
        ));

        expect(wrapper.find('.to-find')).to.have.lengthOf(3);
        const descendent = wrapper.find('.container > .to-find');
        expect(descendent).to.have.lengthOf(1);
        expect(descendent.text()).to.equal('Direct');
      });

      it('simple adjacent', () => {
        const wrapper = renderMethod((
          <div>
            <div className="to-find" />
            <div className="sibling">Adjacent</div>
            <div className="sibling">Not Adjacent</div>
          </div>
        ));

        expect(wrapper.find('.sibling')).to.have.lengthOf(2);
        const toFind = wrapper.find('.to-find + .sibling');
        expect(toFind).to.have.lengthOf(1);
        expect(toFind.text()).to.equal('Adjacent');
      });

      it('simple adjacent with arrays', () => {
        const wrapper = renderMethod((
          <div>
            <div className="to-find" />
            {[<div key="0" className="sibling">Adjacent</div>]}
          </div>
        ));
        const toFind = wrapper.find('.to-find + .sibling');
        expect(toFind).to.have.lengthOf(1);
        expect(toFind.text()).to.equal('Adjacent');
      });

      it('nested adjacent', () => {
        const wrapper = renderMethod((
          <div>
            <div className="to-find" />
            <div className="sibling">Adjacent</div>
            <div>
              <div className="sibling">Not Adjacent</div>
              <div>
                <div className="to-find" />
                <div className="sibling">Adjacent</div>
              </div>
              <div className="to-find">Not Adjacent</div>
            </div>
          </div>
        ));

        expect(wrapper.find('.to-find')).to.have.lengthOf(3);
        const toFind = wrapper.find('.to-find + .sibling');
        expect(toFind).to.have.lengthOf(2);
        toFind.map((found) => expect(found.text()).to.equal('Adjacent'));
      });

      it('simple general siblings', () => {
        const wrapper = renderMethod((
          <div>
            <span className="to-find" />
            <span />
            <span />
            <span />
            <div>
              <span />
            </div>
          </div>
        ));

        expect(wrapper.find('.to-find ~ span')).to.have.lengthOf(3);
      });

      it('nested general siblings', () => {
        const wrapper = renderMethod((
          <div>
            <span>Top</span>
            <span />
            <span />
            <div>
              <div>
                <span>Top</span>
                <span />
                <span />
              </div>
            </div>
          </div>
        ));

        const spans = wrapper.find('span');
        const siblings = wrapper.find('span ~ span');
        expect(spans.length - 2).to.equal(siblings.length);
        siblings.map((sibling) => expect(sibling.text()).to.not.equal('Top'));
      });

      it('handles using general siblings on root', () => {
        const wrapper = renderMethod(<div className="foo" />);
        expect(wrapper.find('.foo ~ .bar')).to.have.lengthOf(0);
      });

      it('not() pseudo selector', () => {
        const wrapper = renderMethod((
          <div>
            <span className="bar">first</span>
            <span />
            <span className="foo" />
            <span />
            <span />
          </div>
        ));
        expect(wrapper.find('span:not(.foo, .bar)')).to.have.lengthOf(3);
      });

      it(':empty pseudo selector', () => {
        const wrapper = renderMethod((
          <div>
            <span className="bar">first</span>
            <span />
            <span className="foo" />
            <span />
            <span />
          </div>
        ));
        expect(wrapper.find('.foo:empty')).to.have.lengthOf(1);
        expect(wrapper.find('.bar:empty')).to.have.lengthOf(0);
      });

      it('first-child pseudo', () => {
        const wrapper = renderMethod((
          <div>
            <span>first</span>
            <span />
            <span />
          </div>
        ));
        expect(wrapper.find('span:first-child').text()).to.equal('first');
      });

      it('last-child pseudo', () => {
        const wrapper = renderMethod((
          <div>
            <span />
            <span />
            <span>last</span>
          </div>
        ));
        expect(wrapper.find('span:last-child').text()).to.equal('last');
      });

      describeIf(name === 'mount', ':focus pseudo selector', () => {
        it('works in mount with directly focused DOM node', () => {
          const wrapper = renderMethod((
            <input type="text" />
          ));
          const inputNode = wrapper.find('input');

          expect(inputNode.is(':focus')).to.equal(false);

          const inputDOMNode = wrapper.getDOMNode();
          inputDOMNode.focus();

          expect(inputNode.is(':focus')).to.equal(true);
        });

        it('works on component in mount', () => {
          class ClassComponent extends React.Component {
            render() {
              return (
                <input type="text" />
              );
            }
          }

          const wrapper = renderMethod((
            <ClassComponent />
          ));

          expect(wrapper.find('ClassComponent:focus')).to.have.lengthOf(0);

          const inputDOMNode = wrapper.getDOMNode();
          inputDOMNode.focus();

          expect(wrapper.find('ClassComponent:focus')).to.have.lengthOf(1);
        });

        it('works on nested component in mount', () => {
          class InnerComponent extends React.Component {
            render() {
              return (
                <input type="text" />
              );
            }
          }
          class WrapComponent extends React.Component {
            render() {
              return <InnerComponent />;
            }
          }
          const wrapper = renderMethod((
            <WrapComponent />
          ));

          expect(wrapper.find('InnerComponent:focus')).to.have.lengthOf(0);
          expect(wrapper.find('WrapComponent:focus')).to.have.lengthOf(0);
          expect(wrapper.find('input:focus')).to.have.lengthOf(0);

          const inputDOMNode = wrapper.getDOMNode();
          inputDOMNode.focus();

          expect(wrapper.find('InnerComponent:focus')).to.have.lengthOf(1);
          expect(wrapper.find('WrapComponent:focus')).to.have.lengthOf(1);
          expect(wrapper.find('input:focus')).to.have.lengthOf(1);
        });
      });

      it('throws for complex selectors in simple selector methods', () => {
        const wrapper = renderMethod(<div className="foo" />);
        ['is', 'filter', 'not', 'every'].forEach((method) => {
          expect(() => wrapper[method]('.foo + div')).to.throw(
            TypeError,
            'This method does not support complex CSS selectors',
          );
        });
      });

      it('throws for unsupported pseudo-element selectors', () => {
        const wrapper = renderMethod(<div className="foo" />);
        expect(() => wrapper.find('div::after')).to.throw('Enzyme::Selector does not support the "after" pseudo-element or pseudo-class selectors.');
      });

      it('throws for unsupported pseudo-class selectors', () => {
        const wrapper = renderMethod(<div className="foo" />);
        expect(() => wrapper.find('div:hover')).to.throw('Enzyme::Selector does not support the "hover" pseudo-element or pseudo-class selectors.');
      });

      it('.foo + div > span', () => {
        const wrapper = renderMethod((
          <div>
            <div className="foo" />
            <div>
              <span />
            </div>
            <div>
              <span />
            </div>
          </div>
        ));

        expect(wrapper.find('.foo + div > span')).to.have.lengthOf(1);
      });

      it('.foo + .foo + .foo', () => {
        const wrapper = renderMethod((
          <div>
            <div className="foo">foo1</div>
            <div className="foo">foo2</div>
            <div className="foo">foo3</div>
          </div>
        ));
        expect(wrapper.find('.foo + .foo')).to.have.lengthOf(2);
        expect(wrapper.find('.foo + .foo').at(0).text()).to.equal('foo2');
        expect(wrapper.find('.foo + .foo').at(1).text()).to.equal('foo3');
        expect(wrapper.find('.foo + .foo + .foo')).to.have.lengthOf(1);
      });

      it('attribute names with numbers', () => {
        const wrapper = renderMethod((
          <div>
            <div data-foo-1={1} />
            <div data-foo-1={1} />
            <div data-foo-2={2} />
            <div data-foo-2="2" />
          </div>
        ));
        expect(wrapper.find('[data-foo-1=1]')).to.have.lengthOf(2);
        expect(wrapper.find('[data-foo-1="1"]')).to.have.lengthOf(0);
        expect(wrapper.find('[data-foo-2=2]')).to.have.lengthOf(1);
        expect(wrapper.find('[data-foo-2="2"]')).to.have.lengthOf(1);
      });

      it('hyphens', () => {
        const wrapper = renderMethod((
          <div>
            <div className="-foo" />
            <div className="foo- -bar-" type="foo" />
            <div id="bar" className="-foo" />
            <span className="-foo" />
          </div>
        ));
        expect(wrapper.find('.-foo')).to.have.lengthOf(3);
        expect(wrapper.find('.foo-')).to.have.lengthOf(1);
        expect(wrapper.find('[type="foo"].foo-')).to.have.lengthOf(1);
        expect(wrapper.find('.foo-.-bar-')).to.have.lengthOf(1);
        expect(wrapper.find('div.foo-')).to.have.lengthOf(1);
        expect(wrapper.find('div.-foo')).to.have.lengthOf(2);
        expect(wrapper.find('#bar.-foo')).to.have.lengthOf(1);
      });

      it('hyphens', () => {
        const wrapper = renderMethod((
          <div>
            <div className="-foo" />
            <div className="foo- -bar-" type="foo" />
            <div id="bar" className="-foo" />
            <span className="-foo" />
          </div>
        ));
        expect(wrapper.find('.-foo')).to.have.lengthOf(3);
        expect(wrapper.find('.foo-')).to.have.lengthOf(1);
        expect(wrapper.find('[type="foo"].foo-')).to.have.lengthOf(1);
        expect(wrapper.find('.foo-.-bar-')).to.have.lengthOf(1);
        expect(wrapper.find('div.foo-')).to.have.lengthOf(1);
        expect(wrapper.find('div.-foo')).to.have.lengthOf(2);
        expect(wrapper.find('#bar.-foo')).to.have.lengthOf(1);
      });

      it('spaces in attribute values', () => {
        const wrapper = renderMethod((
          <div>
            <div type="foo bar" />
            <div type="foo.bar" />
            <div type="foobar" />
          </div>
        ));
        expect(wrapper.find('[type="foo bar"]')).to.have.lengthOf(1);
      });

      it('dots in attribute values', () => {
        const wrapper = renderMethod((
          <div>
            <div type="foo.bar" />
            <div type="foo bar" />
            <div type="foobar" />
          </div>
        ));
        expect(wrapper.find('[type="foo.bar"]')).to.have.lengthOf(1);
      });

      it('brackets in attribute values', () => {
        const wrapper = renderMethod((
          <div>
            <div type="foo[1]" />
          </div>
        ));
        expect(wrapper.find('[type="foo[1]"]')).to.have.lengthOf(1);
      });

      it('URLs in attribute values', () => {
        const wrapper = renderMethod((
          <div>
            <a href="https://www.foo.com" />
            <a href="foo.com" />
          </div>
        ));
        expect(wrapper.find('a[href="https://www.foo.com"]')).to.have.lengthOf(1);
        expect(wrapper.find('a[href="foo.com"]')).to.have.lengthOf(1);
      });

      it('parens in displayName', () => {
        class Foo extends React.Component {
          render() {
            return <div />;
          }
        }
        Foo.displayName = 'Wrapped(Foo)';
        class Bar extends React.Component {
          render() {
            return <div />;
          }
        }
        Bar.displayName = 'Wrapped(Twice(Bar))';
        const wrapper = renderMethod((
          <div>
            <Foo />
            <Bar />
          </div>
        ));
        expect(wrapper.find('Wrapped(Foo)')).to.have.lengthOf(1);
        expect(wrapper.find('Wrapped(Twice(Bar))')).to.have.lengthOf(1);
      });

      it('parses booleans', () => {
        expectAttributeMatch(<div hidden />, '[hidden=true]', true);
        expectAttributeMatch(<div hidden />, '[hidden=false]', false);
        expectAttributeMatch(<div hidden />, '[hidden="true"]', false);
        expectAttributeMatch(<div hidden={false} />, '[hidden=false]', true);
        expectAttributeMatch(<div hidden={false} />, '[hidden=true]', false);
        expectAttributeMatch(<div hidden={false} />, '[hidden="false"]', false);
      });

      it('parses numeric literals', () => {
        expectAttributeMatch(<div data-foo={2.3} />, '[data-foo=2.3]', true);
        expectAttributeMatch(<div data-foo={2} />, '[data-foo=2]', true);
        expectAttributeMatch(<div data-foo={2} />, '[data-foo="2abc"]', false);
        expectAttributeMatch(<div data-foo={2} />, '[data-foo="abc2"]', false);
        expectAttributeMatch(<div data-foo={-2} />, '[data-foo=-2]', true);
        // @TODO this is failing due to a parser issue
        // expectAttributeMatch(<div data-foo={2e8} />, '[data-foo=2e8]', true);
        expectAttributeMatch(<div data-foo={Infinity} />, '[data-foo=Infinity]', true);
        expectAttributeMatch(<div data-foo={Infinity} />, '[data-foo=-Infinity]', false);
        expectAttributeMatch(<div data-foo={-Infinity} />, '[data-foo=-Infinity]', true);
        expectAttributeMatch(<div data-foo={-Infinity} />, '[data-foo=Infinity]', false);
      });

      it('parses zeroes properly', () => {
        expectAttributeMatch(<div data-foo={0} />, '[data-foo=0]', true);
        expectAttributeMatch(<div data-foo={0} />, '[data-foo=+0]', true);
        expectAttributeMatch(<div data-foo={-0} />, '[data-foo=-0]', true);
        expectAttributeMatch(<div data-foo={-0} />, '[data-foo=0]', false);
        expectAttributeMatch(<div data-foo={0} />, '[data-foo=-0]', false);
        expectAttributeMatch(<div data-foo={1} />, '[data-foo=0]', false);
        expectAttributeMatch(<div data-foo={2} />, '[data-foo=-0]', false);
      });

      it('works with empty strings', () => {
        expectAttributeMatch(<div className="" />, '[className=""]', true);
        expectAttributeMatch(<div className={''} />, '[className=""]', true);
        expectAttributeMatch(<div className={'bar'} />, '[className=""]', false);
      });

      it('works with NaN', () => {
        expectAttributeMatch(<div data-foo={NaN} />, '[data-foo=NaN]', true);
        expectAttributeMatch(<div data-foo={0} />, '[data-foo=NaN]', false);
      });

      it('works with null', () => {
        expectAttributeMatch(<div data-foo={null} />, '[data-foo=null]', true);
        expectAttributeMatch(<div data-foo={0} />, '[data-foo=null]', false);
      });

      it('works with false', () => {
        expectAttributeMatch(<div data-foo={false} />, '[data-foo=false]', true);
        expectAttributeMatch(<div data-foo={0} />, '[data-foo=false]', false);
      });
      it('works with ±Infinity', () => {
        expectAttributeMatch(<div data-foo={Infinity} />, '[data-foo=Infinity]', true);
        expectAttributeMatch(<div data-foo={Infinity} />, '[data-foo=+Infinity]', true);
        expectAttributeMatch(<div data-foo={Infinity} />, '[data-foo=-Infinity]', false);
        expectAttributeMatch(<div data-foo={Infinity} />, '[data-foo=NaN]', false);
        expectAttributeMatch(<div data-foo={0} />, '[data-foo=Infinity]', false);
        expectAttributeMatch(<div data-foo={0} />, '[data-foo=-Infinity]', false);
        expectAttributeMatch(<div data-foo={-Infinity} />, '[data-foo=-Infinity]', true);
        expectAttributeMatch(<div data-foo={-Infinity} />, '[data-foo=Infinity]', false);
        expectAttributeMatch(<div data-foo={-Infinity} />, '[data-foo="-Infinity"]', false);
        expectAttributeMatch(<div data-foo={-Infinity} />, '[data-foo=NaN]', false);
        expectAttributeMatch(<div data-foo={NaN} />, '[data-foo=Infinity]', false);
        expectAttributeMatch(<div data-foo={NaN} />, '[data-foo=-Infinity]', false);
      });

      it('whitespace list attribute selector', () => {
        expectAttributeMatch(<div rel="foo bar baz" />, '[rel~="bar"]', true);
        expectAttributeMatch(<div rel="foo bar baz" />, '[rel~="baz"]', true);
        expectAttributeMatch(<div rel="foo bar baz" />, '[rel~="foo"]', true);
        expectAttributeMatch(<div rel="foo bar baz" />, '[rel~="foo bar"]', false);
        expectAttributeMatch(<div rel={1} />, '[rel~=1]', false);
        expectAttributeMatch(<div rel="1" />, '[rel~=1]', false);
      });

      it('hypen attribute selector', () => {
        expectAttributeMatch(<a hrefLang="en-US" />, '[hrefLang|="en"]', true);
        expectAttributeMatch(<a hrefLang="en-US" />, '[hrefLang|="en-US"]', true);
        expectAttributeMatch(<a hrefLang="en-US" />, '[hrefLang|="US"]', false);
        expectAttributeMatch(<a hrefLang="en-US" />, '[hrefLang|="enUS"]', false);
        expectAttributeMatch(<a hrefLang={1} />, '[hrefLang|=1]', false);
        expectAttributeMatch(<a hrefLang="1" />, '[hrefLang|=1]', false);
      });

      it('prefix attribute operator', () => {
        expectAttributeMatch(<img alt="" src="foo-bar.jpg" />, '[src^="foo"]', true);
        expectAttributeMatch(<img alt="" src="foo-bar.jpg" />, '[src^="foo-bar"]', true);
        expectAttributeMatch(<img alt="" src="foo-bar.jpg" />, '[src^="foo-bar.jpg"]', true);
        expectAttributeMatch(<img alt="" src="foo-bar.jpg" />, '[src^="bar"]', false);
        expectAttributeMatch(<img alt="" src="foo-bar.jpg" />, '[src^=""]', false);
        expectAttributeMatch(<img alt="" src={1} />, '[src^=1]', false);
        expectAttributeMatch(<img alt="" src="1" />, '[src^=1]', false);
      });

      it('suffix attribute operator', () => {
        expectAttributeMatch(<img alt="" src="foo-bar.jpg" />, '[src$=".jpg"]', true);
        expectAttributeMatch(<img alt="" src="foo-bar.jpg" />, '[src$="bar.jpg"]', true);
        expectAttributeMatch(<img alt="" src="foo-bar.jpg" />, '[src$="foo-bar.jpg"]', true);
        expectAttributeMatch(<img alt="" src="foo-bar.jpg" />, '[src$="foo"]', false);
        expectAttributeMatch(<img alt="" src="foo-bar.jpg" />, '[src$=""]', false);
        expectAttributeMatch(<img alt="" src={1} />, '[src$=1]', false);
        expectAttributeMatch(<img alt="" src="1" />, '[src$=1]', false);
      });

      it('substring attribute operator', () => {
        expectAttributeMatch(<div id="foo bar baz" />, '[id*="foo"]', true);
        expectAttributeMatch(<div id="foo bar baz" />, '[id*="foo bar"]', true);
        expectAttributeMatch(<div id="foo bar baz" />, '[id*="foo bar baz"]', true);
        expectAttributeMatch(<div id="foo bar baz" />, '[id*="foo "]', true);
        expectAttributeMatch(<div id="foo bar baz" />, '[id*="fo"]', true);
        expectAttributeMatch(<div id="foo bar baz" />, '[id*="foz"]', false);
        expectAttributeMatch(<div id="foo bar baz" />, '[id*=1]', false);
        expectAttributeMatch(<div id={1} />, '[id*=1]', false);
        expectAttributeMatch(<div id="1" />, '[id*=1]', false);
      });
    });
  });
});
