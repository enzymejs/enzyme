import React from 'react';
import PropTypes from 'prop-types';
import { expect } from 'chai';
import { render } from 'enzyme';
import renderEntry from 'enzyme/render';
import { fakeDynamicImport } from 'enzyme-adapter-utils';

import './_helpers/setupAdapters';
import { describeWithDOM, describeIf } from './_helpers';
import { is } from './_helpers/version';
import { createClass, lazy } from './_helpers/react-compat';

describeWithDOM('render', () => {
  describe('top level entry points', () => {
    expect(renderEntry).to.equal(render);
  });

  describeIf(is('> 0.13'), 'context', () => {
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
      expect(wrapper).to.have.lengthOf(1);

      expect(wrapper.is('div')).to.equal(true);
      expect(wrapper.text()).to.equal('foo');

      expect(String(wrapper)).to.equal('<div>foo</div>');
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
      expect(wrapper).to.have.lengthOf(1);

      expect(wrapper.is('div')).to.equal(true);

      const children = wrapper.children();
      expect(children).to.have.lengthOf(1);
      expect(children.is('span')).to.equal(true);

      expect(children.first().text()).to.equal('foo');

      expect(String(wrapper)).to.equal('<div><span>foo</span></div>');
      expect(String(children)).to.equal('<span>foo</span>');
    });

    it('does not throw if context is passed in but contextTypes is missing', () => {
      const SimpleComponent = createClass({
        render() {
          return <div>{this.context.name}</div>;
        },
      });

      const context = { name: 'foo' };
      expect(() => render(<SimpleComponent />, { context })).to.not.throw(Error);
    });
  });

  describeIf(is('> 16.6'), 'suspense fallback option', () => {
    it('throws if options.suspenseFallback is specified', () => {
      class DynamicComponent extends React.Component {
        render() {
          return (
            <div>Dynamic Component</div>
          );
        }
      }
      const LazyComponent = lazy(fakeDynamicImport(DynamicComponent));
      expect(() => render(<LazyComponent />, { suspenseFallback: false })).to.throw();
    });
  });
});
