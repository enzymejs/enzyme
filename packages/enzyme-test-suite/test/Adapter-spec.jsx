import React from 'react';
import { expect } from 'chai';
import jsdom from 'jsdom';
import { get } from 'enzyme/build/configuration';
import { configure, shallow, EnzymeAdapter } from 'enzyme';
import inspect from 'object-inspect';
import {
  Portal,
  Memo,
  isMemo,
} from 'react-is';
import PropTypes from 'prop-types';
import wrap from 'mocha-wrap';
import { fakeDynamicImport, wrapWithWrappingComponent, RootFinder } from 'enzyme-adapter-utils';

import './_helpers/setupAdapters';
import Adapter from './_helpers/adapter';
import {
  AsyncMode,
  ConcurrentMode,
  createContext,
  createPortal,
  forwardRef,
  Fragment,
  lazy,
  Profiler,
  renderToString,
  StrictMode,
  Suspense,
} from './_helpers/react-compat';
import { is } from './_helpers/version';
import { itIf, describeWithDOM, describeIf } from './_helpers';

const { adapter } = get();

const prettyFormat = (x) => inspect(x).replace(/,/g, ',\n');

// Kind of hacky, but we nullify all the instances to test the tree structure
// with jasmine's deep equality function, and test the instances separate. We
// also delete children props because testing them is more annoying and not
// really important to verify.
function cleanNode(node) {
  if (!node) {
    return;
  }
  if (node && node.instance) {
    node.instance = null;
  }
  if (node && node.props && node.props.children) {
    // eslint-disable-next-line no-unused-vars
    const { children, ...props } = node.props;
    node.props = props;
  }
  if (Array.isArray(node.rendered)) {
    node.rendered.forEach(cleanNode);
  } else if (typeof node.rendered === 'object') {
    cleanNode(node.rendered);
  }
}

describe('Adapter', () => {
  class RendersNull extends React.Component {
    render() {
      return null;
    }
  }

  describe('error message', () => {
    afterEach(() => {
      configure({ adapter });
    });

    it('fails to render when no adapter is configured', () => {
      configure({ adapter: undefined });
      expect(() => shallow(<div />)).to.throw(Error, /Enzyme expects an adapter to be configured, but found none/);
    });

    it('fails to render when an object that does not inherit from the base class is configured', () => {
      expect(() => configure({ adapter: {} })).to.throw(Error, /configured enzyme adapter did not inherit from the EnzymeAdapter base class/);
    });

    it('fails to render when an adapter constructor is configured', () => {
      expect(() => configure({ adapter: Adapter })).to.throw(Error, /you provided an adapter \*constructor\*/);
    });

    it('fails to render when a non-adapter-constructor function is configured', () => {
      expect(() => configure({ adapter() {} })).to.throw(Error, /an enzyme adapter must be an object instance; you provided a function/);
    });
  });

  describe('base class', () => {
    it('constructs', () => {
      const instance = new EnzymeAdapter();
      expect(instance).to.have.property('options');
      expect(instance.options).to.be.an('object');
    });

    it('throws on abstract methods', () => {
      expect(() => new EnzymeAdapter().createRenderer()).to.throw(
        Error,
        'createRenderer is a required method of EnzymeAdapter, but was not implemented.',
      );
      expect(() => new EnzymeAdapter().nodeToElement()).to.throw(
        Error,
        'nodeToElement is a required method of EnzymeAdapter, but was not implemented.',
      );
      expect(() => new EnzymeAdapter().isValidElement()).to.throw(
        Error,
        'isValidElement is a required method of EnzymeAdapter, but was not implemented.',
      );
      expect(() => new EnzymeAdapter().createElement()).to.throw(
        Error,
        'createElement is a required method of EnzymeAdapter, but was not implemented.',
      );
    });

    describe('invokeSetStateCallback', () => {
      it('has the right length', () => {
        expect(EnzymeAdapter.prototype).to.have.property('invokeSetStateCallback');
        expect(EnzymeAdapter.prototype.invokeSetStateCallback).to.be.a('function');
        expect(EnzymeAdapter.prototype.invokeSetStateCallback).to.have.lengthOf(2);
      });
    });
  });

  describeWithDOM('mounted render', () => {
    function hydratedTreeMatchesUnhydrated(element, hydrate = false) {
      const markup = renderToString(element);
      const dom = jsdom.jsdom(`<div id="root">${markup}</div>`);

      const rendererA = adapter.createRenderer({
        mode: 'mount',
        [hydrate ? 'hydrateIn' : 'attachTo']: dom.querySelector('#root'),
      });

      rendererA.render(element);

      const nodeA = rendererA.getNode();

      cleanNode(nodeA);

      const rendererB = adapter.createRenderer({
        mode: 'mount',
      });

      rendererB.render(element);

      const nodeB = rendererB.getNode();

      cleanNode(nodeB);
      expect(prettyFormat(nodeA)).to.equal(prettyFormat(nodeB));
    }

    class BamBam extends React.Component {
      render() {
        const { children } = this.props;
        return (<div>{children}</div>);
      }
    }
    class FooBar extends React.Component {
      render() {
        const { children } = this.props;
        return (<BamBam>{children}</BamBam>);
      }
    }
    class One extends React.Component {
      render() { return (<FooBar><span><FooBar /></span></FooBar>); }
    }
    class Two extends React.Component {
      render() { return (<FooBar><span>2</span></FooBar>); }
    }
    class Three extends React.Component {
      render() { return (<FooBar><span><div /></span></FooBar>); }
    }
    class Four extends React.Component {
      render() { return (<FooBar><span>{'some string'}4{'another string'}</span></FooBar>); }
    }

    it('hydrated trees match unhydrated trees', () => {
      hydratedTreeMatchesUnhydrated(<One />);
      hydratedTreeMatchesUnhydrated(<Two />);
      hydratedTreeMatchesUnhydrated(<Three />);
      hydratedTreeMatchesUnhydrated(<Four />);
    });

    itIf(is('>= 16'), 'works with ReactDOM.hydrate', () => {
      hydratedTreeMatchesUnhydrated(<One />, true);
      hydratedTreeMatchesUnhydrated(<Two />, true);
      hydratedTreeMatchesUnhydrated(<Three />, true);
      hydratedTreeMatchesUnhydrated(<Four />, true);
    });

    it('treats mixed children correctly', () => {
      class Foo extends React.Component {
        render() {
          return (<div>hello{4}{'world'}</div>);
        }
      }

      const options = { mode: 'mount' };
      const renderer = adapter.createRenderer(options);

      renderer.render(<Foo />);

      const node = renderer.getNode();

      cleanNode(node);

      expect(prettyFormat(node)).to.equal(prettyFormat({
        nodeType: 'class',
        type: Foo,
        props: {},
        key: undefined,
        ref: null,
        instance: null,
        rendered: {
          nodeType: 'host',
          type: 'div',
          props: {},
          key: undefined,
          ref: null,
          instance: null,
          rendered: [
            'hello',
            is('>= 16') ? '4' : 4,
            'world',
          ],
        },
      }));
    });

    it('treats null renders correctly', () => {
      const options = { mode: 'mount' };
      const renderer = adapter.createRenderer(options);

      renderer.render(<RendersNull />);

      const node = renderer.getNode();

      cleanNode(node);

      expect(prettyFormat(node)).to.equal(prettyFormat({
        nodeType: 'class',
        type: RendersNull,
        props: {},
        key: undefined,
        ref: null,
        instance: null,
        rendered: null,
      }));
    });

    itIf(is('>= 16'), 'renders react portals', () => {
      const document = jsdom.jsdom();
      const options = { mode: 'mount' };
      const renderer = adapter.createRenderer(options);
      const innerDiv = <div className="Foo">Hello World!</div>;
      const Foo = () => (
        createPortal(
          innerDiv,
          document.body,
        )
      );

      renderer.render(<Foo />);

      const node = renderer.getNode();

      const { rendered: { props: { children } } } = node;
      expect(children).to.equal(innerDiv);

      cleanNode(node);

      expect(prettyFormat(node)).to.equal(prettyFormat({
        nodeType: 'function',
        type: Foo,
        props: {},
        key: undefined,
        ref: null,
        instance: null,
        rendered: {
          nodeType: 'portal',
          type: Portal,
          props: {
            containerInfo: document.body,
          },
          key: undefined,
          ref: null,
          instance: null,
          rendered: {
            nodeType: 'host',
            type: 'div',
            props: { className: 'Foo' },
            key: undefined,
            ref: null,
            instance: null,
            rendered: ['Hello World!'],
          },
        },
      }));
    });

    itIf(is('>= 16'), 'shallow renders react portals', () => {
      const options = { mode: 'shallow' };
      const renderer = adapter.createRenderer(options);
      const innerDiv = <div className="Foo">Hello World!</div>;
      const containerDiv = { nodeType: 1 };
      const Foo = () => (
        createPortal(
          innerDiv,
          containerDiv,
        )
      );

      renderer.render(<Foo />);

      const node = renderer.getNode();

      const { rendered: { props: { children } } } = node;
      expect(children).to.equal(innerDiv);

      cleanNode(node);

      expect(prettyFormat(node)).to.equal(prettyFormat({
        nodeType: 'function',
        type: Foo,
        props: {},
        key: undefined,
        ref: null,
        instance: null,
        rendered: {
          nodeType: 'portal',
          type: Portal,
          props: {
            containerInfo: containerDiv,
          },
          key: undefined,
          ref: null,
          instance: null,
          rendered: {
            nodeType: 'host',
            type: 'div',
            props: { className: 'Foo' },
            key: undefined,
            ref: null,
            instance: null,
            rendered: 'Hello World!',
          },
        },
      }));
    });

    itIf(is('> 0.13'), 'renders simple components returning host components', () => {
      const options = { mode: 'mount' };
      const renderer = adapter.createRenderer(options);

      const Qoo = () => <span className="Qoo">Hello World!</span>;

      renderer.render(<Qoo />);

      const node = renderer.getNode();

      cleanNode(node);

      expect(prettyFormat(node)).to.equal(prettyFormat({
        nodeType: 'function',
        type: Qoo,
        props: {},
        key: undefined,
        ref: null,
        instance: null,
        rendered: {
          nodeType: 'host',
          type: 'span',
          props: { className: 'Qoo' },
          key: undefined,
          ref: null,
          instance: null,
          rendered: ['Hello World!'],
        },
      }));
    });

    it('renders simple components returning host components', () => {
      const options = { mode: 'mount' };
      const renderer = adapter.createRenderer(options);

      class Qoo extends React.Component {
        render() {
          return (
            <span className="Qoo">Hello World!</span>
          );
        }
      }

      renderer.render(<Qoo />);

      const node = renderer.getNode();

      cleanNode(node);

      expect(prettyFormat(node)).to.equal(prettyFormat({
        nodeType: 'class',
        type: Qoo,
        props: {},
        key: undefined,
        ref: null,
        instance: null,
        rendered: {
          nodeType: 'host',
          type: 'span',
          props: { className: 'Qoo' },
          key: undefined,
          ref: null,
          instance: null,
          rendered: ['Hello World!'],
        },
      }));
    });

    it('handles null rendering components', () => {
      const options = { mode: 'mount' };
      const renderer = adapter.createRenderer(options);

      renderer.render(<RendersNull />);

      const node = renderer.getNode();

      expect(node.instance).to.be.instanceof(RendersNull);

      cleanNode(node);

      expect(prettyFormat(node)).to.equal(prettyFormat({
        nodeType: 'class',
        type: RendersNull,
        props: {},
        key: undefined,
        ref: null,
        instance: null,
        rendered: null,
      }));
    });


    itIf(is('> 0.13'), 'renders complicated trees of composites and hosts', () => {
      // SFC returning host. no children props.
      const Qoo = () => <span className="Qoo">Hello World!</span>;

      // SFC returning host. passes through children.
      const Foo = ({ className, children }) => (
        <div className={`Foo ${className}`}>
          <span className="Foo2">Literal</span>
          {children}
        </div>
      );

      // class composite returning composite. passes through children.
      class Bar extends React.Component {
        render() {
          const { special, children } = this.props;
          return (
            <Foo className={special ? 'special' : 'normal'}>
              {children}
            </Foo>
          );
        }
      }

      // class composite return composite. no children props.
      class Bam extends React.Component {
        render() {
          return (
            <Bar special>
              <Qoo />
            </Bar>
          );
        }
      }

      const options = { mode: 'mount' };
      const renderer = adapter.createRenderer(options);

      renderer.render(<Bam />);

      const tree = renderer.getNode();

      // we test for the presence of instances before nulling them out
      expect(tree.instance).to.be.instanceof(Bam);
      expect(tree.rendered.instance).to.be.instanceof(Bar);

      cleanNode(tree);

      expect(prettyFormat(tree)).to.equal(prettyFormat({
        nodeType: 'class',
        type: Bam,
        props: {},
        key: undefined,
        ref: null,
        instance: null,
        rendered: {
          nodeType: 'class',
          type: Bar,
          props: { special: true },
          key: undefined,
          ref: null,
          instance: null,
          rendered: {
            nodeType: 'function',
            type: Foo,
            props: { className: 'special' },
            key: undefined,
            ref: null,
            instance: null,
            rendered: {
              nodeType: 'host',
              type: 'div',
              props: { className: 'Foo special' },
              key: undefined,
              ref: null,
              instance: null,
              rendered: [
                {
                  nodeType: 'host',
                  type: 'span',
                  props: { className: 'Foo2' },
                  key: undefined,
                  ref: null,
                  instance: null,
                  rendered: ['Literal'],
                },
                {
                  nodeType: 'function',
                  type: Qoo,
                  props: {},
                  key: undefined,
                  ref: null,
                  instance: null,
                  rendered: {
                    nodeType: 'host',
                    type: 'span',
                    props: { className: 'Qoo' },
                    key: undefined,
                    ref: null,
                    instance: null,
                    rendered: ['Hello World!'],
                  },
                },
              ],
            },
          },
        },
      }));
    });

    it('renders complicated trees of composites and hosts', () => {
      // class returning host. no children props.
      class Qoo extends React.Component {
        render() {
          return (
            <span className="Qoo">Hello World!</span>
          );
        }
      }

      class Foo extends React.Component {
        render() {
          const { className, children } = this.props;
          return (
            <div className={`Foo ${className}`}>
              <span className="Foo2">Literal</span>
              {children}
            </div>
          );
        }
      }

      // class composite returning composite. passes through children.
      class Bar extends React.Component {
        render() {
          const { special, children } = this.props;
          return (
            <Foo className={special ? 'special' : 'normal'}>
              {children}
            </Foo>
          );
        }
      }

      // class composite return composite. no children props.
      class Bam extends React.Component {
        render() {
          return (
            <Bar special>
              <Qoo />
            </Bar>
          );
        }
      }

      const options = { mode: 'mount' };
      const renderer = adapter.createRenderer(options);

      renderer.render(<Bam />);

      const tree = renderer.getNode();

      // we test for the presence of instances before nulling them out
      expect(tree.instance).to.be.instanceof(Bam);
      expect(tree.rendered.instance).to.be.instanceof(Bar);

      cleanNode(tree);

      expect(prettyFormat(tree)).to.equal(prettyFormat({
        nodeType: 'class',
        type: Bam,
        props: {},
        key: undefined,
        ref: null,
        instance: null,
        rendered: {
          nodeType: 'class',
          type: Bar,
          props: { special: true },
          key: undefined,
          ref: null,
          instance: null,
          rendered: {
            nodeType: 'class',
            type: Foo,
            props: { className: 'special' },
            key: undefined,
            ref: null,
            instance: null,
            rendered: {
              nodeType: 'host',
              type: 'div',
              props: { className: 'Foo special' },
              key: undefined,
              ref: null,
              instance: null,
              rendered: [
                {
                  nodeType: 'host',
                  type: 'span',
                  props: { className: 'Foo2' },
                  key: undefined,
                  ref: null,
                  instance: null,
                  rendered: ['Literal'],
                },
                {
                  nodeType: 'class',
                  type: Qoo,
                  props: {},
                  key: undefined,
                  ref: null,
                  instance: null,
                  rendered: {
                    nodeType: 'host',
                    type: 'span',
                    props: { className: 'Qoo' },
                    key: undefined,
                    ref: null,
                    instance: null,
                    rendered: ['Hello World!'],
                  },
                },
              ],
            },
          },
        },
      }));
    });
  });

  it('render node with updated props', () => {
    class Counter extends React.Component {
      constructor(props) {
        super(props);
        this.state = { count: 0 };
      }

      increment() {
        this.setState(({ count }) => ({ count: count + 1 }));
      }

      render() {
        return <RendersNull {...this.state} />;
      }
    }

    const options = { mode: 'mount' };
    const renderer = adapter.createRenderer(options);

    renderer.render(<Counter />);

    let tree = renderer.getNode();
    expect(tree.rendered.props).to.have.property('count', 0);
    tree.instance.increment();
    tree = renderer.getNode();
    expect(tree.rendered.props).to.have.property('count', 1);
    tree.instance.increment();
    tree = renderer.getNode();
    expect(tree.rendered.props).to.have.property('count', 2);
  });

  it('renders basic shallow as well', () => {
    class Bar extends React.Component {
      constructor(props) {
        super(props);
        throw new Error('Bar constructor should not be called');
      }

      render() { // eslint-disable-line react/require-render-return
        throw new Error('Bar render method should not be called');
      }
    }

    class Foo extends React.Component {
      render() { // eslint-disable-line react/require-render-return
        throw new Error('Foo render method should not be called');
      }
    }

    // class composite return composite. no children props.
    class Bam extends React.Component {
      render() {
        return (
          <Bar>
            <Foo />
            <Foo />
            <Foo />
          </Bar>
        );
      }
    }

    const options = { mode: 'shallow' };
    const renderer = adapter.createRenderer(options);

    renderer.render(<Bam />);

    const tree = renderer.getNode();

    cleanNode(tree);

    expect(prettyFormat(tree)).to.equal(prettyFormat({
      nodeType: 'class',
      type: Bam,
      props: {},
      key: undefined,
      ref: null,
      instance: null,
      rendered: {
        nodeType: 'class',
        type: Bar,
        props: {},
        key: undefined,
        ref: null,
        instance: null,
        rendered: [
          {
            nodeType: 'class',
            type: Foo,
            props: {},
            key: undefined,
            ref: null,
            instance: null,
            rendered: null,
          },
          {
            nodeType: 'class',
            type: Foo,
            props: {},
            key: undefined,
            ref: null,
            instance: null,
            rendered: null,
          },
          {
            nodeType: 'class',
            type: Foo,
            props: {},
            key: undefined,
            ref: null,
            instance: null,
            rendered: null,
          },
        ],
      },
    }));
  });

  it('does not erroneously add a key when refs are present', () => {
    class Inner extends React.Component {
      constructor(props) {
        super(props);
        throw new Error('Inner constructor should not be called');
      }

      render() { // eslint-disable-line react/require-render-return
        throw new Error('Inner render method should not be called');
      }
    }

    class Outer extends React.Component {
      constructor(props) {
        super(props);
        this.setRef = this.setRef.bind(this);
      }

      setRef(r) {
        this.inner = r;
      }

      render() {
        return <Inner ref={this.setRef} />;
      }
    }

    const options = { mode: 'shallow' };
    const renderer = adapter.createRenderer(options);

    renderer.render(<Outer />);

    const tree = renderer.getNode();

    cleanNode(tree);

    expect(prettyFormat(tree)).to.equal(prettyFormat({
      nodeType: 'class',
      type: Outer,
      props: {},
      key: undefined,
      ref: null,
      instance: null,
      rendered: {
        nodeType: 'class',
        type: Inner,
        props: {},
        key: undefined,
        ref: tree.rendered.ref, // prettyFormat loses the reference to "ref"
        instance: null,
        rendered: null,
      },
    }));
  });

  it('adds keys correctly to elements that have them', () => {
    class Inner extends React.Component {
      constructor(props) {
        super(props);
        throw new Error('Inner constructor should not be called');
      }

      render() { // eslint-disable-line react/require-render-return
        throw new Error('Inner render method should not be called');
      }
    }

    class Outer extends React.Component {
      render() {
        return <Inner key="foo" />;
      }
    }

    const options = { mode: 'shallow' };
    const renderer = adapter.createRenderer(options);

    renderer.render(<Outer />);

    const tree = renderer.getNode();

    cleanNode(tree);

    expect(prettyFormat(tree)).to.equal(prettyFormat({
      nodeType: 'class',
      type: Outer,
      props: {},
      key: undefined,
      ref: null,
      instance: null,
      rendered: {
        nodeType: 'class',
        type: Inner,
        props: {},
        key: 'foo',
        ref: null,
        instance: null,
        rendered: null,
      },
    }));
  });

  it('adds null keys to elements correctly', () => {
    class Inner extends React.Component {
      constructor(props) {
        super(props);
        throw new Error('Inner constructor should not be called');
      }

      render() { // eslint-disable-line react/require-render-return
        throw new Error('Inner render method should not be called');
      }
    }

    class Outer extends React.Component {
      render() {
        return <Inner key={null} />;
      }
    }

    const options = { mode: 'shallow' };
    const renderer = adapter.createRenderer(options);

    renderer.render(<Outer />);

    const tree = renderer.getNode();

    cleanNode(tree);

    expect(prettyFormat(tree)).to.equal(prettyFormat({
      nodeType: 'class',
      type: Outer,
      props: {},
      key: undefined,
      ref: null,
      instance: null,
      rendered: {
        nodeType: 'class',
        type: Inner,
        props: {},
        key: 'null',
        ref: null,
        instance: null,
        rendered: null,
      },
    }));
  });

  describe('determines valid element types', () => {
    itIf(is('> 0.13'), 'supports stateless function components', () => {
      const SFC = () => null;

      expect(adapter.isValidElementType(SFC)).to.equal(true);
    });

    it('supports custom components', () => {
      class Component extends React.Component {
        render() { return null; }
      }

      expect(adapter.isValidElementType(Component)).to.equal(true);
    });

    it('supports HTML elements', () => {
      expect(adapter.isValidElementType('div')).to.equal(true);
    });

    itIf(is('>= 16'), 'supports Portals', () => {
      expect(adapter.isValidElementType(createPortal(<div />, { nodeType: 1 }))).to.equal(false);
    });

    itIf(is('>= 16.3'), 'supports Context', () => {
      const Context = createContext({ });
      expect(adapter.isValidElementType(Context.Consumer)).to.equal(true);
      expect(adapter.isValidElementType(Context.Provider)).to.equal(true);
    });

    itIf(is('>= 16.3'), 'supports forward refs', () => {
      expect(adapter.isValidElementType(forwardRef(() => null))).to.equal(true);
    });
  });

  itIf(is('>0.13'), 'supports wrapping elements in a WrappingComponent', () => {
    class WrappingComponent extends React.Component {
      render() {
        return null;
      }
    }
    const node = <div />;
    const options = {
      mode: 'shallow',
      wrappingComponent: WrappingComponent,
      wrappingComponentProps: { foo: 'bar' },
    };
    const { RootFinder: ReturnedRootFinder, node: wrappedNode } = adapter.wrapWithWrappingComponent(node, options);
    expect(ReturnedRootFinder).to.equal(RootFinder);
    expect(wrappedNode).to.eql(wrapWithWrappingComponent(React.createElement, node, options));
  });

  describe('provides node displayNames', () => {
    const getDisplayName = (el) => adapter.displayNameOfNode(adapter.elementToNode(el));

    itIf(is('> 0.13'), 'supports stateless function components', () => {
      const SFC = () => null;

      expect(getDisplayName(<SFC />)).to.equal('SFC');
    });

    it('supports custom components', () => {
      class Component extends React.Component {
        render() { return null; }
      }
      class Something extends React.Component {
        render() { return null; }
      }
      Something.displayName = 'MyComponent';

      expect(getDisplayName(<Component />)).to.equal('Component');
      expect(getDisplayName(<Something />)).to.equal('MyComponent');
    });

    it('supports HTML elements', () => {
      expect(getDisplayName(<div />)).to.equal('div');
    });

    itIf(is('>= 16.2'), 'supports Fragments', () => {
      expect(getDisplayName(<Fragment />)).to.equal('Fragment');
    });

    itIf(is('>= 16'), 'supports Portals', () => {
      expect(getDisplayName(createPortal(<div />, { nodeType: 1 }))).to.equal('Portal');
    });

    itIf(is('>= 16.3'), 'supports Context', () => {
      const Context = createContext({});
      expect(getDisplayName(<Context.Consumer />)).to.equal('ContextConsumer');
      expect(getDisplayName(<Context.Provider />)).to.equal('ContextProvider');
    });

    itIf(is('>= 16.3'), 'supports forward refs', () => {
      const ForwaredRef = forwardRef(() => null);
      // eslint-disable-next-line prefer-arrow-callback
      const NamedForwardedRef = forwardRef(function Named() { return null; });

      expect(getDisplayName(<ForwaredRef />)).to.equal('ForwardRef');
      expect(getDisplayName(<NamedForwardedRef />)).to.equal('ForwardRef(Named)');
    });

    itIf(is('>= 16.3'), 'supports StrictMode', () => {
      expect(getDisplayName(<StrictMode />)).to.equal('StrictMode');
    });

    itIf(is('>= 16.3') && is('< 16.6'), 'supports AsyncMode', () => {
      expect(getDisplayName(<AsyncMode />)).to.equal('AsyncMode');
    });

    itIf(is('>= 16.4'), 'supports Profiler', () => {
      expect(getDisplayName(<Profiler />)).to.equal('Profiler');
    });

    itIf((is('>= 16.6') && is('<16.9')), 'supports ConcurrentMode', () => {
      expect(getDisplayName(<ConcurrentMode />)).to.equal('ConcurrentMode');
    });

    itIf(is('>= 16.6'), 'supports Suspense', () => {
      expect(getDisplayName(<Suspense />)).to.equal('Suspense');
    });

    itIf(is('>= 16.6'), 'supports lazy', () => {
      class DynamicComponent extends React.Component {
        render() {
          return <div>DynamicComponent</div>;
        }
      }
      const LazyComponent = lazy(() => fakeDynamicImport(DynamicComponent));
      expect(getDisplayName(<LazyComponent />)).to.equal('lazy');
    });
  });

  describeIf(is('>= 16.2'), 'determines if node isFragment', () => {
    it('correctly identifies Fragment', () => {
      expect(adapter.isFragment(<Fragment />)).to.equal(true);
    });

    it('correctly identifies a non-Fragment', () => {
      expect(adapter.isFragment(<div />)).to.equal(false);
    });
  });

  describe('.wrap()', () => {
    it('returns a valid element', () => {
      const element = <div a="b" c="d" />;
      const wrapped = adapter.wrap(element);
      expect(adapter.isValidElement(wrapped)).to.equal(true);
    });

    it('renders the children provided', () => {
      const element = <div a="b" c="d" />;
      const wrapped = adapter.wrap(element);
      expect(wrapped.props).to.contain.keys({ children: element });
    });
  });

  describeIf(is('>= 16'), 'checkPropTypes', () => {
    let renderer;

    class Root extends React.Component {
      render() {
        return <A />;
      }
    }
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
    const typeSpecs = {
      foo: PropTypes.number,
    };
    const values = {
      foo: 'foo',
    };
    const location = 'Adapter-spec';
    const hierarchy = [
      <A />,
      <div />,
      <span />,
      <B />,
      <C />,
    ];

    beforeEach(() => {
      renderer = adapter.createRenderer({ mode: 'shallow' });
      renderer.render(<Root />, {});
    });

    wrap()
      .withConsoleThrows()
      .it('checks prop types', () => {
        expect(() => renderer.checkPropTypes(typeSpecs, values, location, hierarchy)).to.throw(`
Warning: Failed Adapter-spec type: Invalid Adapter-spec \`foo\` of type \`string\` supplied to \`Root\`, expected \`number\`.
    in A (created by B)
    in div (created by B)
    in span (created by B)
    in B (created by C)
    in C (created by Root)
    in Root (created by WrapperComponent)
    in WrapperComponent
        `.trim());
      });
  });

  describe('isCustomComponent', () => {
    function FunctionComponent() {
      return null;
    }
    class ClassComponent extends React.Component {
      render() {
        return null;
      }
    }

    it('returns true for functional/class components', () => {
      expect(adapter.isCustomComponent(FunctionComponent)).to.equal(true);
      expect(adapter.isCustomComponent(ClassComponent)).to.equal(true);
    });

    it('returns false for everything else', () => {
      expect(adapter.isCustomComponent({})).to.equal(false);
      expect(adapter.isCustomComponent(true)).to.equal(false);
      expect(adapter.isCustomComponent(null)).to.equal(false);
      expect(adapter.isCustomComponent(undefined)).to.equal(false);
    });

    itIf(is('>=16.3'), 'returns true for forward refs', () => {
      expect(adapter.isCustomComponent(forwardRef(() => null))).to.equal(true);
    });
  });

  describeIf(is('>= 16.3'), 'isContextConsumer(type)', () => {
    it('returns true for createContext() Consumers', () => {
      expect(adapter.isContextConsumer(createContext().Consumer)).to.equal(true);
    });

    it('returns false for everything else', () => {
      expect(adapter.isContextConsumer(null)).to.equal(false);
      expect(adapter.isContextConsumer(true)).to.equal(false);
      expect(adapter.isContextConsumer(undefined)).to.equal(false);
      expect(adapter.isContextConsumer(false)).to.equal(false);
      expect(adapter.isContextConsumer(() => <div />)).to.equal(false);
      expect(adapter.isContextConsumer(forwardRef(() => null))).to.equal(false);
      expect(adapter.isContextConsumer(createContext().Provider)).to.equal(false);
    });
  });

  describeIf(is('>= 16.3'), 'getProviderFromConsumer(Consumer)', () => {
    it('gets a createContext() Provider from a Consumer', () => {
      const Context = createContext();

      expect(adapter.getProviderFromConsumer(Context.Consumer)).to.equal(Context.Provider);
    });

    it('throws an internal error if something that is not a Consumer is passed', () => {
      expect(() => adapter.getProviderFromConsumer(null)).to.throw(
        'Enzyme Internal Error: can’t figure out how to get Provider from Consumer',
      );
      expect(() => adapter.getProviderFromConsumer({})).to.throw(
        'Enzyme Internal Error: can’t figure out how to get Provider from Consumer',
      );
    });
  });

  describe('matchesElementType(node, matchingType)', () => {
    it('returns a falsy node', () => {
      expect(adapter.matchesElementType()).to.equal();
      expect(adapter.matchesElementType(null)).to.equal(null);
      expect(adapter.matchesElementType(false)).to.equal(false);
      expect(adapter.matchesElementType('')).to.equal('');
      expect(adapter.matchesElementType(0)).to.equal(0);
    });

    it('compares the node’s `type` property to `matchingType`', () => {
      const sentinel = {};
      expect(adapter.matchesElementType({ type: sentinel }, sentinel)).to.equal(true);
      expect(adapter.matchesElementType({ type: {} }, sentinel)).to.equal(false);
    });

    describeIf(is('>= 16.6'), 'memoized components', () => {
      const matchingType = {};
      const node = { type: matchingType };
      const memoNode = {
        $$typeof: Memo,
        type: node.type,
      };
      const memoMatchingType = {
        $$typeof: Memo,
        type: matchingType,
      };

      beforeEach(() => {
        expect(isMemo(memoNode)).to.equal(true); // sanity check
        expect(isMemo(memoMatchingType)).to.equal(true); // sanity check
      });

      it('unmemoizes the node’s type', () => {
        expect(adapter.matchesElementType(memoNode, matchingType)).to.equal(true);
      });

      it('unmemoizes the matchingType', () => {
        expect(adapter.matchesElementType(node, memoMatchingType)).to.equal(true);
      });

      it('unmemoizes both the node’s type and matchingType', () => {
        expect(adapter.matchesElementType(memoNode, memoMatchingType)).to.equal(true);
      });
    });
  });
});
