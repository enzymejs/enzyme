import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon-sandbox';

import {
  sym,
} from 'enzyme/build/Utils';

import {
  itIf,
} from '../../_helpers';

export default function describeSimulateError({
  Wrap,
  WrapRendered,
  isShallow,
}) {
  describe('.simulateError(error)', () => {
    class Div extends React.Component {
      render() {
        const { children } = this.props;
        return <div>{children}</div>;
      }
    }

    class Spans extends React.Component {
      render() {
        return <div><span /><span /></div>;
      }
    }

    class Nested extends React.Component {
      render() {
        return <Div><Spans /></Div>;
      }
    }

    it('throws on host elements', () => {
      const wrapper = WrapRendered(<Div />);
      expect(wrapper.is('div')).to.equal(true);
      expect(() => wrapper.simulateError()).to.throw();
    });

    it('throws on "not one" node', () => {
      const wrapper = Wrap(<Spans />);

      const spans = wrapper.find('span');
      expect(spans).to.have.lengthOf(2);
      expect(() => spans.simulateError()).to.throw();

      const navs = wrapper.find('nav');
      expect(navs).to.have.lengthOf(0);
      expect(() => navs.simulateError()).to.throw();
    });

    it('throws when the renderer lacks `simulateError`', () => {
      const wrapper = Wrap(<Nested />);
      delete wrapper[sym('__renderer__')].simulateError;
      expect(() => wrapper.simulateError()).to.throw();
      try {
        wrapper.simulateError();
      } catch (e) {
        expect(e).not.to.equal(undefined);
      }
    });

    context('calls through to renderer’s `simulateError`', () => {
      let hierarchy;
      beforeEach(() => {
        const wrapper = WrapRendered(<Nested />);
        const stub = sinon.stub().callsFake((_, __, e) => { throw e; });
        wrapper[sym('__renderer__')].simulateError = stub;
        const error = new Error('hi');
        expect(() => wrapper.simulateError(error)).to.throw(error);
        expect(stub).to.have.property('callCount', 1);

        const [args] = stub.args;
        expect(args).to.have.lengthOf(3);
        const [h, rootNode, actualError] = args;
        expect(actualError).to.equal(error);
        expect(rootNode).to.eql(wrapper[sym('__root__')].getNodeInternal());

        hierarchy = h;
        expect(hierarchy).not.to.have.lengthOf(0);

        const [divNode] = hierarchy;
        expect(divNode).to.contain.keys({
          type: Div,
          nodeType: 'class',
          rendered: {
            type: Spans,
            nodeType: 'class',
            rendered: null,
          },
        });
      });

      itIf(isShallow, 'calls through to renderer’s `simulateError`', () => {
        expect(hierarchy).to.have.lengthOf(1);
      });

      itIf(!isShallow, 'calls through to renderer’s `simulateError`', () => {
        expect(hierarchy).to.have.lengthOf(2);
        const [, spanNode] = hierarchy;
        expect(spanNode).to.contain.keys({
          type: Spans,
          nodeType: 'class',
          rendered: null,
        });
      });
    });

    it('returns the wrapper', () => {
      const wrapper = WrapRendered(<Nested />);
      wrapper[sym('__renderer__')].simulateError = sinon.stub();
      expect(wrapper.simulateError()).to.equal(wrapper);
    });
  });
}
