import React from 'react';
import { expect } from 'chai';

import {
  describeIf,
} from '../../_helpers';
import { is } from '../../_helpers/version';

export default function describeRender({
  Wrap,
}) {
  describe('.render()', () => {
    it('returns a cheerio wrapper around the current node', () => {
      class Foo extends React.Component {
        render() {
          return (<div className="in-foo" />);
        }
      }

      class Bar extends React.Component {
        render() {
          return (
            <div className="in-bar">
              <Foo />
            </div>
          );
        }
      }

      const wrapper = Wrap(<Bar />);

      expect(wrapper.render().find('.in-foo')).to.have.lengthOf(1);

      const rendered = wrapper.render();
      expect(rendered.is('.in-bar')).to.equal(true);
      expect(rendered).to.have.lengthOf(1);

      const renderedFoo = wrapper.find(Foo).render();
      expect(renderedFoo.is('.in-foo')).to.equal(true);
      expect(renderedFoo.is('.in-bar')).to.equal(false);
      expect(renderedFoo.find('.in-bar')).to.have.lengthOf(0);
    });

    describeIf(is('> 0.13'), 'stateless function components (SFCs)', () => {
      it('returns a cheerio wrapper around the current node', () => {
        const Foo = () => (
          <div className="in-foo" />
        );

        const Bar = () => (
          <div className="in-bar">
            <Foo />
          </div>
        );

        const wrapper = Wrap(<Bar />);

        expect(wrapper.render().find('.in-foo')).to.have.lengthOf(1);
        expect(wrapper.render().is('.in-bar')).to.equal(true);

        const renderedFoo = wrapper.find(Foo).render();
        expect(renderedFoo.is('.in-foo')).to.equal(true);
        expect(renderedFoo.is('.in-bar')).to.equal(false);
        expect(renderedFoo.find('.in-bar')).to.have.lengthOf(0);
      });
    });
  });
}
