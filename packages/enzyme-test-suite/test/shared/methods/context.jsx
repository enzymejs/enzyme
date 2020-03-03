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
  isShallow,
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

    itIf(isShallow, 'throws if it is called when wrapper didn’t include context', () => {
      const wrapper = Wrap(<SimpleComponent />, { context: false });
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
      const context = { name: 'foo' };
      const wrapper = Wrap(<SimpleComponent />, { context });
      expect(wrapper.context()).to.eql(context);
    });

    it('works with a key name', () => {
      const context = { name: 'foo' };
      const wrapper = Wrap(<SimpleComponent />, { context });
      expect(wrapper.context('name')).to.equal(context.name);
    });

    class RendersHTML extends React.Component {
      render() {
        return <div><span>hi</span></div>;
      }
    }

    it('throws on non-instance', () => {
      const wrapper = Wrap(<RendersHTML />);
      const span = wrapper.find('span');
      expect(span).to.have.lengthOf(1);
      expect(() => span.context()).to.throw(Error);
    });

    class RendersChildren extends React.Component {
      render() {
        const { children } = this.props;
        return <div>{children}</div>;
      }
    }

    it('throws on non-root', () => {

      const wrapper = Wrap(<RendersChildren><RendersHTML /></RendersChildren>);
      const child = wrapper.find(RendersHTML);
      expect(child).to.have.lengthOf(1);
      expect(() => child.context()).to.throw(Error);
    });

    itIf(is('>= 16'), 'throws on an SFC without an instance', () => {
      function Bar() {
        return <RendersHTML />;
      }

      const wrapper = Wrap(<RendersChildren><Bar /></RendersChildren>);
      const child = wrapper.find(Bar);
      expect(child).to.have.lengthOf(1);
      expect(() => child.context()).to.throw(Error);
    });
  });
}
