import React from 'react';
import { expect } from 'chai';
import {
  displayNameOfNode,
  ensureKeyOrUndefined,
  getMaskedContext,
  getComponentStack,
} from 'enzyme-adapter-utils';

import './_helpers/setupAdapters';
import { describeIf } from './_helpers';
import { is } from './_helpers/version';

describe('enzyme-adapter-utils', () => {
  describe('ensureKeyOrUndefined', () => {
    it('returns the key if truthy', () => {
      [true, 42, 'foo', [], {}, () => {}].forEach((truthy) => {
        expect(ensureKeyOrUndefined(truthy)).to.equal(truthy);
      });
    });

    it('returns the empty string if the key is the empty string', () => {
      expect(ensureKeyOrUndefined('')).to.equal('');
    });

    it('returns undefined if falsy and not the empty string', () => {
      [null, undefined, false, 0, NaN].forEach((falsy) => {
        expect(ensureKeyOrUndefined(falsy)).to.equal(undefined);
      });
    });
  });

  describe('displayNameOfNode', () => {
    describe('given a node with displayName', () => {
      it('returns the displayName', () => {
        class Foo extends React.Component {
          render() { return <div />; }
        }

        Foo.displayName = 'CustomWrapper';

        expect(displayNameOfNode(<Foo />)).to.equal('CustomWrapper');
      });

      describeIf(is('> 0.13'), 'stateless function components', () => {
        it('returns the displayName', () => {
          const Foo = () => <div />;
          Foo.displayName = 'CustomWrapper';

          expect(displayNameOfNode(<Foo />)).to.equal('CustomWrapper');
        });
      });
    });

    describe('given a node without displayName', () => {
      it('returns the name', () => {
        class Foo extends React.Component {
          render() { return <div />; }
        }

        expect(displayNameOfNode(<Foo />)).to.equal('Foo');
      });

      it('returns the name even if it is falsy', () => {
        const makeFoo = () => () => <div />;

        const Foo = makeFoo();

        expect(displayNameOfNode(<Foo />)).to.equal('');
      });

      describeIf(is('> 0.13'), 'stateless function components', () => {
        it('returns the name', () => {
          const Foo = () => <div />;

          expect(displayNameOfNode(<Foo />)).to.equal('Foo');
        });
      });
    });

    describe('given a DOM node', () => {
      it('returns the type', () => {
        expect(displayNameOfNode(<div />)).to.equal('div');
      });
    });
  });

  describe('getMaskedContext', () => {
    const contextTypes = {
      a() {},
      c() {},
    };
    const unmaskedContext = {
      a: 1,
      b: 2,
      c: 3,
    };
    const falsies = [undefined, null, false, '', NaN, 0];

    it('returns an empty object with falsy `contextTypes`', () => {
      falsies.forEach((falsy) => {
        expect(getMaskedContext(falsy, unmaskedContext)).to.eql({});
      });
    });

    it('returns an empty object with falsy `unmaskedContext`', () => {
      falsies.forEach((falsy) => {
        expect(getMaskedContext(contextTypes, falsy)).to.eql({});
      });
    });

    it('filters `unmaskedContext` down to `contextTypes`', () => {
      expect(getMaskedContext(contextTypes, unmaskedContext)).to.eql({
        a: unmaskedContext.a,
        c: unmaskedContext.c,
      });
    });
  });

  describe('getComponentStack', () => {
    function A() {
      return <B />;
    }
    class B extends React.Component {
      render() {
        return <C />;
      }
    }
    class C extends React.Component {
      render() {
        return null;
      }
    }
    const hierarchy = [
      <A />,
      <div />,
      <span />,
      <B />,
      <C />,
    ];

    it('outputs a formatted stack of react components', () => {
      expect(getComponentStack(hierarchy)).to.equal(`
    in A (created by B)
    in div (created by B)
    in span (created by B)
    in B (created by C)
    in C (created by WrapperComponent)
    in WrapperComponent`);
    });

    it('handles an empty hierarchy', () => {
      expect(getComponentStack([])).to.equal(`
    in WrapperComponent`);
    });

    it('allows getNodeType and getDisplayName to be overridden', () => {
      function getNodeType(type) {
        // Not considering C a component
        if (type === A || type === B) {
          return 'class';
        }

        return 'host';
      }
      function getDisplayName(node) {
        if (node.type === A) {
          return 'Eyy';
        }
        if (node.type === B) {
          return 'Bee';
        }
        if (node.type === C) {
          return 'Sea';
        }
        return node.type;
      }

      // Nothing is created by Sea/C because it is not considered a component
      // by getNodeType.
      expect(getComponentStack(hierarchy, getNodeType, getDisplayName)).to.equal(`
    in Eyy (created by Bee)
    in div (created by Bee)
    in span (created by Bee)
    in Bee (created by WrapperComponent)
    in Sea (created by WrapperComponent)
    in WrapperComponent`);
    });
  });
});
