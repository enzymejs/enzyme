import React from 'react';
import PropTypes from 'prop-types';
import { expect } from 'chai';
import { describeWithDOM, describeIf } from './_helpers';
import { render } from '../src/';
import { REACT013 } from '../src/version';
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
      expect(wrapper.text()).to.equal('foo');
    });
    it('can pass context to the child of mounted component', () => {
      const SimpleComponent = createClass({
        contextTypes: {
          name: PropTypes.string,
        },
        render() {
          return <div>{this.context.name}</div>;
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
      expect(wrapper.children()).to.have.length(1);
      expect(wrapper.children().first().text()).to.equal('foo');
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
