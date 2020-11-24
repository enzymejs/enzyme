import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon-sandbox';
import PropTypes from 'prop-types';
import { shallow } from 'enzyme';
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
  fakeDynamicImport,
  assertDomAvailable,
  createMountWrapper,
  simulateError,
  spyMethod,
  spyProperty,
} from 'enzyme-adapter-utils';
import wrap from 'mocha-wrap';

import './_helpers/setupAdapters';
import { describeIf, describeWithDOM } from './_helpers';
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

      describeIf(is('>= 16.6'), 'stateless memoized function components', () => {
        it('returns the displayName', () => {
          const Foo = Object.assign(React.memo(() => <div />), { displayName: 'Memoized(CustomWrapper)' });

          expect(displayNameOfNode(<Foo />)).to.equal('Memoized(CustomWrapper)');
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

  describe('elementToTree', () => {
    class Target extends React.Component { render() { return null; } }
    const classNodeType = is('< 0.14') ? 'function' : 'class';

    it('produces a tree', () => {
      const target = elementToTree(<Target a="1"><div /></Target>);
      expect(target).to.eql({
        nodeType: classNodeType,
        type: Target,
        props: {
          a: '1',
          children: <div />,
        },
        key: undefined,
        ref: null,
        instance: null,
        rendered: {
          instance: null,
          key: undefined,
          nodeType: 'host',
          props: {},
          ref: null,
          rendered: null,
          type: 'div',
        },
      });
    });

    it('works with Array map', () => {
      const targets = [<Target a="1"><div /></Target>];
      expect(targets.map(elementToTree)).to.eql([{
        nodeType: classNodeType,
        type: Target,
        props: {
          a: '1',
          children: <div />,
        },
        key: undefined,
        ref: null,
        instance: null,
        rendered: {
          instance: null,
          key: undefined,
          nodeType: 'host',
          props: {},
          ref: null,
          rendered: null,
          type: 'div',
        },
      }]);
    });

    it('throws when `dangerouslySetInnerHTML` and `children` are combined on host elements', () => {
      /* eslint react/no-danger-with-children: 0 */
      expect(() => elementToTree(<div dangerouslySetInnerHTML="hi">nope</div>)).to.throw();
      expect(() => elementToTree(<Target dangerouslySetInnerHTML="hi">yep</Target>)).not.to.throw();
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
      expect(findElement(tree, (node) => node.type === Target)).to.eql(target);
    });

    it('returns undefined if the element cannot be found', () => {
      expect(findElement(tree, (node) => node.type === Unfound)).to.equal(undefined);
    });

    it('returns undefined if some non-element is passed', () => {
      expect(findElement({}, (node) => node.type === Target)).to.equal(undefined);
    });
  });

  describe('getNodeFromRootFinder', () => {
    const isCustomComponent = (component) => typeof component === 'function';
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

  describeWithDOM('getWrappingComponentMountRenderer', () => {
    let instance;
    let renderer;
    let tree;

    beforeEach(() => {
      tree = {
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

  describe('fakeDynamicImport', () => {
    it('is a function', () => {
      expect(fakeDynamicImport).to.be.a('function');
    });

    it('returns a promise', () => {
      const promise = fakeDynamicImport();
      expect(Promise.resolve(promise)).to.equal(promise);
    });

    it('returns a promise for an object containing the provided argument', () => {
      const signal = {};
      return fakeDynamicImport(signal).then((actual) => {
        expect(actual).to.have.property('default', signal);
      });
    });
  });

  describe('assertDomAvailable', () => {
    describeWithDOM('with DOM', () => {
      it('throws', () => {
        expect(global).to.have.property('document');
        expect(global.document).to.have.property('createElement');
        expect(assertDomAvailable).not.to.throw();
      });
    });

    describe('without DOM', () => {
      wrap().withGlobal('document', () => null).it('noops', () => {
        expect(!!global.document).to.equal(false);
        expect(assertDomAvailable).to.throw();
      });
    });
  });

  describe('createMountWrapper', () => {
    class Foo extends React.Component {
      render() {
        const { foo } = this.context;
        return <div>{foo}</div>;
      }
    }
    Foo.contextTypes = {
      foo: PropTypes.string,
    };

    it('returns a component', () => {
      const node = <Foo />;
      const Wrapper = createMountWrapper(node);
      expect(React.isValidElement(<Wrapper />)).to.equal(true);
    });

    it('returns the wrapped component’s instance', () => {
      const node = <Foo />;
      const Wrapper = createMountWrapper(node);
      const wrapper = shallow(<Wrapper />);
      expect(wrapper.instance()).to.be.instanceOf(Wrapper);
    });

    it('uses the passed `wrappingComponent`', () => {});
  });

  describe('simulateError', () => {
    const error = new SyntaxError('hi');

    it('throws the error if neither cDC nor gDSFE exist', () => {
      const instance = {};
      expect(() => simulateError(error, instance)).to.throw(error);
    });

    it('calls gDSFE if it exists', () => {
      const catchingInstance = {
        setState: sinon.spy(),
      };
      const hierarchy = undefined;
      const stateUpdate = {};
      const getDerivedStateFromError = sinon.spy(() => stateUpdate);
      const catchingType = { getDerivedStateFromError };

      simulateError(error, catchingInstance, undefined, hierarchy, undefined, undefined, catchingType);

      expect(catchingInstance.setState).to.have.property('callCount', 1);
      const setStateCall = catchingInstance.setState.getCall(0);
      expect(setStateCall).to.contain.keys({
        args: [stateUpdate],
        thisValue: catchingInstance,
      });

      expect(getDerivedStateFromError).to.have.property('callCount', 1);
      const gDSFECall = getDerivedStateFromError.getCall(0);
      expect(gDSFECall).to.have.property('thisValue', catchingType);
      expect(gDSFECall.args).to.eql([error]);
    });

    class Foo extends React.Component {
      render() { return <div />; }
    }
    class FooBang extends React.Component {
      render() { return <div />; }
    }
    FooBang.displayName = 'Foo!';
    const hierarchy = [
      { type: 'a', displayName: '<a>!' },
      { type: FooBang },
      { type: 'b', displayName: '<b>!' },
      { type: Foo },
    ];
    function Bar() { return null; }
    const hasSFCs = is('> 0.14');
    if (hasSFCs) {
      hierarchy.push({ type: Bar });
    }

    it('calls cDC if it exists', () => {
      const catchingInstance = {
        componentDidCatch: sinon.spy(),
        setState: sinon.spy(),
      };
      const catchingType = {};

      simulateError(error, catchingInstance, undefined, hierarchy, undefined, undefined, catchingType);

      expect(catchingInstance.setState).to.have.property('callCount', 0);

      expect(catchingInstance.componentDidCatch).to.have.property('callCount', 1);
      const cDCCall = catchingInstance.componentDidCatch.getCall(0);
      const componentStack = hasSFCs
        ? `
    in a (created by Foo!)
    in Foo! (created by Foo)
    in b (created by Foo)
    in Foo (created by Bar)
    in Bar (created by WrapperComponent)
    in WrapperComponent`
        : `
    in a (created by Foo!)
    in Foo! (created by Foo)
    in b (created by Foo)
    in Foo (created by WrapperComponent)
    in WrapperComponent`;
      expect(cDCCall).to.have.property('thisValue', catchingInstance);
      expect(cDCCall.args).to.eql([error, { componentStack }]);
    });

    it('calls both if both exist', () => {
      const catchingInstance = {
        componentDidCatch: sinon.spy(),
        setState: sinon.spy(),
      };
      const stateUpdate = {};
      const getDerivedStateFromError = sinon.spy(() => stateUpdate);
      const catchingType = { getDerivedStateFromError };

      simulateError(error, catchingInstance, undefined, hierarchy, undefined, undefined, catchingType);

      expect(catchingInstance.setState).to.have.property('callCount', 1);

      expect(catchingInstance.componentDidCatch).to.have.property('callCount', 1);

      expect(getDerivedStateFromError).to.have.property('callCount', 1);
    });
  });

  describe('spyMethod', () => {
    it('can spy last return value and restore it', () => {
      class Counter {
        constructor() {
          this.count = 1;
        }

        incrementAndGet() {
          this.count += 1;
          return this.count;
        }
      }
      const instance = new Counter();
      const obj = {
        count: 1,
        incrementAndGet() {
          this.count += 1;
          return this.count;
        },
      };

      // test an instance method and an object property function
      const targets = [instance, obj];
      targets.forEach((target) => {
        const original = target.incrementAndGet;
        const spy = spyMethod(target, 'incrementAndGet');
        target.incrementAndGet();
        target.incrementAndGet();
        expect(spy.getLastReturnValue()).to.equal(3);
        spy.restore();
        expect(target.incrementAndGet).to.equal(original);
        expect(target.incrementAndGet()).to.equal(4);
      });
    });

    it('restores the property descriptor', () => {
      const obj = {};
      const descriptor = {
        configurable: true,
        enumerable: true,
        writable: true,
        value: () => {},
      };
      Object.defineProperty(obj, 'method', descriptor);
      const spy = spyMethod(obj, 'method');
      spy.restore();
      expect(Object.getOwnPropertyDescriptor(obj, 'method')).to.deep.equal(descriptor);
    });

    it('accepts an optional `getStub` argument', () => {
      const obj = {};
      const descriptor = {
        configurable: true,
        enumerable: true,
        writable: true,
        value: () => {},
      };
      Object.defineProperty(obj, 'method', descriptor);
      let stub;
      let original;
      spyMethod(obj, 'method', (originalMethod) => {
        original = originalMethod;
        stub = () => { throw new EvalError('stubbed'); };
        return stub;
      });
      expect(original).to.equal(descriptor.value);
      expect(obj).to.have.property('method', stub);
      expect(() => obj.method()).to.throw(EvalError);
    });
  });

  describe('spyProperty', () => {
    it('can spy "was assigned" status and restore it', () => {
      let holder = 1;
      const obj = {
        count: 1,
        get accessor() {
          return holder;
        },
        set accessor(v) {
          holder = v;
        },
      };

      // test an instance method and an object property function
      const targets = ['count', 'accessor'];
      targets.forEach((target) => {
        const originalValue = obj[target];

        const spy = spyProperty(obj, target);

        obj[target] += 1;

        expect(spy.wasAssigned()).to.equal(true);

        spy.restore();

        expect(obj[target]).to.equal(originalValue);
      });
    });

    it('restores the property descriptor', () => {
      const obj = {};
      const descriptor = {
        configurable: true,
        enumerable: true,
        writable: true,
        value: () => {},
      };
      const propertyName = 'foo';
      Object.defineProperty(obj, propertyName, descriptor);
      const spy = spyMethod(obj, propertyName);
      spy.restore();
      expect(Object.getOwnPropertyDescriptor(obj, propertyName)).to.deep.equal(descriptor);
    });

    it('accepts an optional `handlers` argument', () => {
      const getSpy = sinon.stub().returns(1);
      const setSpy = sinon.stub().returns(2);

      const propertyName = 'foo';
      const obj = {
        [propertyName]: 1,
      };

      const spy = spyProperty(obj, propertyName, { get: getSpy, set: setSpy });

      obj[propertyName] += 1;

      spy.restore();

      expect(getSpy.args).to.deep.equal([
        [1],
      ]);
      expect(setSpy.args).to.deep.equal([
        [1, 2],
      ]);
    });
  });
});
