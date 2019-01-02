import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon-sandbox';
import {
  displayNameOfNode,
  ensureKeyOrUndefined,
  getMaskedContext,
  getComponentStack,
  findElement,
  elementToTree,
  RootFinder,
  getNodeFromRootFinder,
  wrapWithWrappingComponent,
  getWrappingComponentMountRenderer,
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
      <RootFinder />,
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

  describe('findElement', () => {
    class Target extends React.Component { render() { return null; } }
    class Other extends React.Component { render() { return null; } }
    class Unfound extends React.Component { render() { return null; } }

    const other = elementToTree(<Other><div /></Other>);
    const target = elementToTree(<Target><div><Other /></div></Target>);
    const tree = elementToTree(
      <div>
        <span>
          {other}
        </span>
        <div>
          {target}
        </div>
      </div>,
    );

    it('finds an element in the render tree using a predicate', () => {
      expect(findElement(tree, node => node.type === Target)).to.eql(target);
    });

    it('returns undefined if the element cannot be found', () => {
      expect(findElement(tree, node => node.type === Unfound)).to.equal(undefined);
    });

    it('returns undefined if some non-element is passed', () => {
      expect(findElement({}, node => node.type === Target)).to.equal(undefined);
    });
  });

  describe('getNodeFromRootFinder', () => {
    const isCustomComponent = component => typeof component === 'function';
    class Target extends React.Component { render() { return null; } }
    class WrappingComponent extends React.Component { render() { return null; } }

    const target = <Target><div /></Target>;

    it('returns the RootFinder‘s children', () => {
      const tree = elementToTree(
        <WrappingComponent>
          <span>
            <RootFinder>{target}</RootFinder>
          </span>
        </WrappingComponent>,
      );
      expect(getNodeFromRootFinder(
        isCustomComponent,
        tree,
        { wrappingComponent: WrappingComponent },
      )).to.eql(elementToTree(target));
    });

    it('throws an error if wrappingComponent is passed but RootFinder is not found', () => {
      const treeMissing = elementToTree((
        <WrappingComponent>
          <span>
            {target}
          </span>
        </WrappingComponent>
      ));
      expect(() => getNodeFromRootFinder(
        isCustomComponent,
        treeMissing,
        { wrappingComponent: WrappingComponent },
      )).to.throw(
        '`wrappingComponent` must render its children!',
      );
    });

    it('returns the node if there is no wrapping component and rootFinder can‘t be found', () => {
      const treeMissing = elementToTree((
        <WrappingComponent>
          <span>
            {target}
          </span>
        </WrappingComponent>
      ));
      expect(getNodeFromRootFinder(
        isCustomComponent,
        treeMissing,
        {},
      )).to.eql(treeMissing.rendered);
    });
  });

  describe('wrapWithWrappingComponent', () => {
    class Target extends React.Component { render() { return null; } }
    class WrappingComponent extends React.Component { render() { return null; } }

    it('wraps the node in the wrappingComponent and RootFinder', () => {
      const node = <Target foo="bar" />;
      const expected = (
        <WrappingComponent hello="world">
          <RootFinder>{node}</RootFinder>
        </WrappingComponent>
      );

      expect(wrapWithWrappingComponent(React.createElement, node, {
        wrappingComponent: WrappingComponent,
        wrappingComponentProps: { hello: 'world' },
      })).to.eql(expected);
    });

    it('handles no wrappingComponentProps', () => {
      const node = <Target foo="bar" />;
      const expected = (
        <WrappingComponent>
          <RootFinder>{node}</RootFinder>
        </WrappingComponent>
      );

      expect(wrapWithWrappingComponent(React.createElement, node, {
        wrappingComponent: WrappingComponent,
      })).to.eql(expected);
    });

    it('handles no wrappingComponent', () => {
      const node = <Target foo="bar" />;

      expect(wrapWithWrappingComponent(React.createElement, node, {})).to.eql(node);
    });
  });

  describe('getWrappingComponentMountRenderer', () => {
    let instance;
    let renderer;
    const tree = {
      nodeType: 'host',
      type: 'div',
      props: { children: <span /> },
      key: undefined,
      ref: undefined,
      instance: global.document.createElement('div'),
      rendered: {
        nodeType: 'host',
        type: 'span',
        props: {},
        key: undefined,
        ref: undefined,
        instance: global.document.createElement('span'),
      },
    };

    beforeEach(() => {
      instance = {
        setWrappingComponentProps: sinon.spy(),
      };
      renderer = getWrappingComponentMountRenderer({
        getMountWrapperInstance: () => instance,
        toTree: () => tree,
      });
    });

    describe('getNode', () => {
      it('can get the node', () => {
        expect(renderer.getNode()).to.eql(tree.rendered);
      });

      it('returns null if there is no instance', () => {
        instance = undefined;
        expect(renderer.getNode()).to.equal(null);
      });
    });

    describe('render', () => {
      it('sets the wrapping component props on the instance', () => {
        const callback = sinon.spy();
        const props = { foo: 'bar', children: <span /> };
        expect(instance.setWrappingComponentProps).to.have.property('callCount', 0);
        renderer.render(<div {...props} />, null, callback);
        expect(instance.setWrappingComponentProps).to.have.property('callCount', 1);
        const [args] = instance.setWrappingComponentProps.args;
        expect(args).to.eql([props, callback]);
      });

      it('throws an error if there is no instance', () => {
        instance = undefined;
        expect(() => renderer.render(<div />, null, () => {})).to.throw('The wrapping component may not be updated if the root is unmounted.');
      });
    });
  });
});
