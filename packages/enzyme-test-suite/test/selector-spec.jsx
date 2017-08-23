import './_helpers/setupAdapters';
import React from 'react';
import { expect } from 'chai';

import { describeWithDOM } from './_helpers';
import {
  mount,
  shallow,
} from 'enzyme';

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

describe('selectors', () => {
  tests.forEach(({ describeMethod, name, renderMethod }) => {
    describeMethod(name, () => {
      it('simple descendent', () => {
        const wrapper = renderMethod(
          <div>
            <div className="top-div">
              <span>inside top div</span>
            </div>

            <div className="bottom-div" />
            <span />
          </div>,
        );

        expect(wrapper.find('span').length).to.equal(2);
        expect(wrapper.find('.top-div span').length).to.equal(1);
      });

      it('nested descendent', () => {
        const wrapper = renderMethod(
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
          </div>,
        );

        expect(wrapper.find('h1').length).to.equal(3);
        expect(wrapper.find('.my-div h1').length).to.equal(2);
      });

      it('deep descendent', () => {
        const wrapper = renderMethod(
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
          </div>,
        );

        expect(wrapper.find('h1').length).to.equal(2);
        expect(wrapper.find('div .inner span .way-inner h1').length).to.equal(1);
      });

      it('direct descendent', () => {
        const wrapper = renderMethod(
          <div>
            <div className="container">
              <div className="to-find">Direct</div>
              <div>
                <div className="to-find">Nested</div>
              </div>
            </div>
            <div className="to-find">Outside</div>
          </div>,
        );

        expect(wrapper.find('.to-find').length).to.equal(3);
        const descendent = wrapper.find('.container > .to-find');
        expect(descendent.length).to.equal(1);
        expect(descendent.text()).to.equal('Direct');
      });

      it('simple adjacent', () => {
        const wrapper = renderMethod(
          <div>
            <div className="to-find" />
            <div className="sibling">Adjacent</div>
            <div className="sibling">Not Adjacent</div>
          </div>,
        );

        expect(wrapper.find('.sibling').length).to.equal(2);
        const toFind = wrapper.find('.to-find + .sibling');
        expect(toFind.length).to.equal(1);
        expect(toFind.text()).to.equal('Adjacent');
      });

      it('nested adjacent', () => {
        const wrapper = renderMethod(
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
          </div>,
        );

        expect(wrapper.find('.to-find').length).to.equal(3);
        const toFind = wrapper.find('.to-find + .sibling');
        expect(toFind.length).to.equal(2);
        toFind.map(found => expect(found.text()).to.equal('Adjacent'));
      });

      it('simple general siblings', () => {
        const wrapper = renderMethod(
          <div>
            <span className="to-find" />
            <span />
            <span />
            <span />
            <div>
              <span />
            </div>
          </div>,
        );

        expect(wrapper.find('.to-find ~ span').length).to.equal(3);
      });

      it('nested general siblings', () => {
        const wrapper = renderMethod(
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
          </div>,
        );

        const spans = wrapper.find('span');
        const siblings = wrapper.find('span ~ span');
        expect(spans.length - 2).to.equal(siblings.length);
        siblings.map(sibling => expect(sibling.text()).to.not.equal('Top'));
      });

      it('throws for complex selectors in simple selector methods', () => {
        const wrapper = renderMethod(<div className="foo" />);
        ['is', 'filter', 'not', 'every'].forEach((method) => {
          expect(() => wrapper[method]('.foo + div')).to.throw(
            'This method does not support complex CSS selectors',
          );
        });
      });

      it('throws for pseudo-element selectors', () => {
        const wrapper = renderMethod(<div className="foo" />);
        expect(() => wrapper.find('div::after')).to.throw(
          'Enzyme::Selector does not support psuedo-element or psuedo-class selectors.',
        );
      });

      it('throws for pseudo-class selectors', () => {
        const wrapper = renderMethod(<div className="foo" />);
        expect(() => wrapper.find('div:hover')).to.throw(
          'Enzyme::Selector does not support psuedo-element or psuedo-class selectors.',
        );
      });

      it('.foo + div > span', () => {
        const wrapper = renderMethod(
          <div>
            <div className="foo" />
            <div>
              <span />
            </div>
            <div>
              <span />
            </div>
          </div>,
        );

        expect(wrapper.find('.foo + div > span').length).to.equal(1);
      });

      it('.foo + .foo + .foo', () => {
        const wrapper = renderMethod(
          <div>
            <div className="foo">foo1</div>
            <div className="foo">foo2</div>
            <div className="foo">foo3</div>
          </div>,
        );
        expect(wrapper.find('.foo + .foo').length).to.equal(2);
        expect(wrapper.find('.foo + .foo').at(0).text()).to.equal('foo2');
        expect(wrapper.find('.foo + .foo').at(1).text()).to.equal('foo3');
        expect(wrapper.find('.foo + .foo + .foo').length).to.equal(1);
      });

      it('attribute names with numbers', () => {
        const wrapper = renderMethod(
          <div>
            <div data-foo-1={1} />
            <div data-foo-1={1} />
            <div data-foo-2={2} />
            <div data-foo-2="2" />
          </div>,
        );
        expect(wrapper.find('[data-foo-1=1]').length).to.equal(2);
        expect(wrapper.find('[data-foo-1="1"]').length).to.equal(0);
        expect(wrapper.find('[data-foo-2=2]').length).to.equal(1);
        expect(wrapper.find('[data-foo-2="2"]').length).to.equal(1);
      });

      it('hyphens', () => {
        const wrapper = renderMethod(
          <div>
            <div className="-foo" />
            <div className="foo- -bar-" type="foo" />
            <div id="bar" className="-foo" />
            <span className="-foo" />
          </div>,
        );
        expect(wrapper.find('.-foo').length).to.equal(3);
        expect(wrapper.find('.foo-').length).to.equal(1);
        expect(wrapper.find('[type="foo"].foo-').length).to.equal(1);
        expect(wrapper.find('.foo-.-bar-').length).to.equal(1);
        expect(wrapper.find('div.foo-').length).to.equal(1);
        expect(wrapper.find('div.-foo').length).to.equal(2);
        expect(wrapper.find('#bar.-foo').length).to.equal(1);
      });

      it('hyphens', () => {
        const wrapper = renderMethod(
          <div>
            <div className="-foo" />
            <div className="foo- -bar-" type="foo" />
            <div id="bar" className="-foo" />
            <span className="-foo" />
          </div>,
        );
        expect(wrapper.find('.-foo').length).to.equal(3);
        expect(wrapper.find('.foo-').length).to.equal(1);
        expect(wrapper.find('[type="foo"].foo-').length).to.equal(1);
        expect(wrapper.find('.foo-.-bar-').length).to.equal(1);
        expect(wrapper.find('div.foo-').length).to.equal(1);
        expect(wrapper.find('div.-foo').length).to.equal(2);
        expect(wrapper.find('#bar.-foo').length).to.equal(1);
      });

      it('spaces in attribute values', () => {
        const wrapper = renderMethod(
          <div>
            <div type="foo bar" />
            <div type="foo.bar" />
            <div type="foobar" />
          </div>,
        );
        expect(wrapper.find('[type="foo bar"]').length).to.equal(1);
      });

      it('dots in attribute values', () => {
        const wrapper = renderMethod(
          <div>
            <div type="foo.bar" />
            <div type="foo bar" />
            <div type="foobar" />
          </div>,
        );
        expect(wrapper.find('[type="foo.bar"]').length).to.equal(1);
      });

      it('brackets in attribute values', () => {
        const wrapper = renderMethod(
          <div>
            <div type="foo[1]" />
          </div>,
        );
        expect(wrapper.find('[type="foo[1]"]').length).to.equal(1);
      });
    });
  });
});
