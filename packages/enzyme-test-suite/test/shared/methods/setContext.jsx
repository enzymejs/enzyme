import React from 'react';
import PropTypes from 'prop-types';
import { expect } from 'chai';

import {
  describeIf,
} from '../../_helpers';
import { is } from '../../_helpers/version';

import {
  createClass,
} from '../../_helpers/react-compat';

export default function describeSetContext({
  Wrap,
  WrapperName,
}) {
  describe('.setContext(newContext)', () => {
    const SimpleComponent = createClass({
      contextTypes: {
        name: PropTypes.string,
      },
      render() {
        const { name } = this.context;
        return <div>{name}</div>;
      },
    });

    it('sets context for a component multiple times', () => {
      const context = { name: 'foo' };
      const wrapper = Wrap(<SimpleComponent />, { context });
      expect(wrapper.text()).to.equal('foo');
      wrapper.setContext({ name: 'bar' });
      expect(wrapper.text()).to.equal('bar');
      wrapper.setContext({ name: 'baz' });
      expect(wrapper.text()).to.equal('baz');
    });

    it('throws if it is called when wrapper didn’t include context', () => {
      const wrapper = Wrap(<SimpleComponent />);
      expect(() => wrapper.setContext({ name: 'bar' })).to.throw(
        Error,
        `${WrapperName}::setContext() can only be called on a wrapper that was originally passed a context option`,
      );
    });

    it('throws when not called on the root', () => {
      const context = { name: <main /> };
      const wrapper = Wrap(<SimpleComponent />, { context });
      const main = wrapper.find('main');
      expect(main).to.have.lengthOf(1);
      expect(() => main.setContext()).to.throw(
        Error,
        `${WrapperName}::setContext() can only be called on the root`,
      );
    });

    describeIf(is('> 0.13'), 'stateless functional components', () => {
      const SFC = (props, { name }) => (
        <div>{name}</div>
      );
      SFC.contextTypes = { name: PropTypes.string };

      it('sets context for a component multiple times', () => {
        const context = { name: 'foo' };
        const wrapper = Wrap(<SFC />, { context });
        expect(wrapper.text()).to.equal('foo');
        wrapper.setContext({ name: 'bar' });
        expect(wrapper.text()).to.equal('bar');
        wrapper.setContext({ name: 'baz' });
        expect(wrapper.text()).to.equal('baz');
      });

      it('throws if it is called when shallow didn’t include context', () => {
        const wrapper = Wrap(<SFC />);
        expect(() => wrapper.setContext({ name: 'bar' })).to.throw(
          Error,
          `${WrapperName}::setContext() can only be called on a wrapper that was originally passed a context option`,
        );
      });
    });
  });
}
