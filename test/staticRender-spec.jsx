import React from 'react';
import { expect } from 'chai';
import { describeWithDOM, describeIf } from './_helpers';
import { render } from '../src/';
import { REACT013 } from '../src/version';

describeWithDOM('render', () => {
  describeIf(!REACT013, 'context', () => {
    it('can pass in context', () => {
      const SimpleComponent = React.createClass({
        contextTypes: {
          name: React.PropTypes.string,
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
      const SimpleComponent = React.createClass({
        contextTypes: {
          name: React.PropTypes.string,
        },
        render() {
          return <div>{this.context.name}</div>;
        },
      });
      const ComplexComponent = React.createClass({
        render() {
          return <div><SimpleComponent /></div>;
        },
      });

      const childContextTypes = {
        name: React.PropTypes.string.isRequired,
      };
      const context = { name: 'foo' };
      const wrapper = render(<ComplexComponent />, { context, childContextTypes });
      expect(wrapper.children()).to.have.length(1);
      expect(wrapper.children().first().text()).to.equal('foo');
    });
    it('should not throw if context is passed in but contextTypes is missing', () => {
      const SimpleComponent = React.createClass({
        render() {
          return <div>{this.context.name}</div>;
        },
      });

      const context = { name: 'foo' };
      expect(() => render(<SimpleComponent />, { context })).to.not.throw(Error);
    });
  });
});
