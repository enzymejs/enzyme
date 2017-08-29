import './_helpers/setupAdapters';
import React from 'react';
import PropTypes from 'prop-types';
import { expect } from 'chai';
import { describeWithDOM, describeIf } from './_helpers';
import { render } from 'enzyme';
import { REACT013 } from './_helpers/version';
import { createClass } from './_helpers/react-compat';

describeWithDOM('render', () => {
  describeIf(!REACT013, 'context', () => {
    it('can pass in context', () => {
      const SimpleComponent = createClass({
        contextTypes: {
          name: PropTypes.string,
        },
        render() {
          return <div>{this.context.name}</div>;
        },
      });

      const context = { name: 'foo' };
      const wrapper = render(<SimpleComponent />, { context });

      const rootEls = wrapper.children();
      expect(rootEls).to.have.lengthOf(1);

      expect(rootEls.is('div')).to.equal(true);
      expect(rootEls.text()).to.equal('foo');
      expect(wrapper.text()).to.equal('foo');

      expect(String(wrapper)).to.equal('<div>foo</div>');
      expect(String(rootEls)).to.equal('<div>foo</div>');
    });

    it('can pass context to the child of mounted component', () => {
      const SimpleComponent = createClass({
        contextTypes: {
          name: PropTypes.string,
        },
        render() {
          return <span>{this.context.name}</span>;
        },
      });
      const ComplexComponent = createClass({
        render() {
          return <div><SimpleComponent /></div>;
        },
      });

      const childContextTypes = {
        name: PropTypes.string.isRequired,
      };
      const context = { name: 'foo' };
      const wrapper = render(<ComplexComponent />, { context, childContextTypes });

      const rootEls = wrapper.children();
      expect(rootEls).to.have.length(1);

      expect(rootEls.is('div')).to.equal(true);

      const children = rootEls.children();
      expect(children).to.have.length(1);
      expect(children.is('span')).to.equal(true);

      expect(children.first().text()).to.equal('foo');

      expect(String(wrapper)).to.equal('<div><span>foo</span></div>');
      expect(String(rootEls)).to.equal('<div><span>foo</span></div>');
      expect(String(children)).to.equal('<span>foo</span>');
    });

    it('should not throw if context is passed in but contextTypes is missing', () => {
      const SimpleComponent = createClass({
        render() {
          return <div>{this.context.name}</div>;
        },
      });

      const context = { name: 'foo' };
      expect(() => render(<SimpleComponent />, { context })).to.not.throw(Error);
    });
  });
});
