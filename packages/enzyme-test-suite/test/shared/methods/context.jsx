import React from 'react';
import PropTypes from 'prop-types';
import { expect } from 'chai';

import {
  itIf,
} from '../../_helpers';
import {
  is,
} from '../../_helpers/version';

import {
  createClass,
} from '../../_helpers/react-compat';

export default function describeContext({
  Wrap,
  WrapperName,
}) {
  describe('.context()', () => {
    const contextTypes = {
      name: PropTypes.string,
    };
    const SimpleComponent = createClass({
      contextTypes,
      render() {
        const { name } = this.context;
        return <div>{name}</div>;
      },
    });

    function SimpleComponentSFC(props, { name }) {
      return <div>{name}</div>;
    }
    SimpleComponentSFC.contextTypes = contextTypes;

    it('throws when not called on the root', () => {
      const context = { name: <main /> };
      const wrapper = Wrap(<SimpleComponent />, { context });
      const main = wrapper.find('main');
      expect(main).to.have.lengthOf(1);
      expect(() => main.context()).to.throw(
        Error,
        `${WrapperName}::context() can only be called on the root`,
      );
    });

    it('throws if it is called when wrapper didn’t include context', () => {
      const wrapper = Wrap(<SimpleComponent />);
      expect(() => wrapper.context()).to.throw(
        Error,
        `${WrapperName}::context() can only be called on a wrapper that was originally passed a context option`,
      );
    });

    itIf(is('>= 16'), 'throws on SFCs that lack an instance', () => {
      const context = { name: 'bob' };
      const wrapper = Wrap(<SimpleComponentSFC />, { context });
      expect(() => wrapper.context()).to.throw(
        Error,
        `${WrapperName}::context() can only be called on wrapped nodes that have a non-null instance`,
      );
    });

    it('works with no arguments', () => {
      const context = { name: {} };
      const wrapper = Wrap(<SimpleComponentSFC />, { context });
      expect(wrapper.context()).to.eql(context);
    });

    it('works with a key name', () => {
      const context = { name: {} };
      const wrapper = Wrap(<SimpleComponentSFC />, { context });
      expect(wrapper.context('name')).to.equal(context.name);
    });
  });
}
