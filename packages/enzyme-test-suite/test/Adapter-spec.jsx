import React from 'react';
import { expect } from 'chai';
import jsdom from 'jsdom';
import { get } from 'enzyme/build/configuration';
import { configure, shallow } from 'enzyme';

import './_helpers/setupAdapters';
import Adapter from './_helpers/adapter';
import {
  renderToString,
  createContext,
  createPortal,
  forwardRef,
  Fragment,
  StrictMode,
  AsyncMode,
  Profiler,
} from './_helpers/react-compat';
import { is } from './_helpers/version';
import { itIf, describeWithDOM, describeIf } from './_helpers';

const { adapter } = get();

const prettyFormat = o => JSON.stringify(o, null, 2);

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

    /* eslint react/destructuring-assignment: 0 */
    class BamBam extends React.Component {
      render() { return (<div>{this.props.children}</div>); }
    }
    class FooBar extends React.Component {
      render() { return (<BamBam>{this.props.children}</BamBam>); }
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
          return (
            <div>hello{4}{'world'}</div>
          );
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
        ref: null,
        instance: null,
        rendered: {
          nodeType: 'host',
          type: 'div',
          props: {},
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
      class Foo extends React.Component {
        render() {
          return null;
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
        ref: null,
        instance: null,
        rendered: null,
      }));
    });

    itIf(is('>= 16'), 'renders react portals', () => {
      // eslint-disable-next-line global-require, import/no-unresolved
      const ReactDOM = require('react-dom'); // only available in 0.14+

      const document = jsdom.jsdom();
      const options = { mode: 'mount' };
      const renderer = adapter.createRenderer(options);
      const Foo = () => (
        ReactDOM.createPortal(
          <div className="Foo">Hello World!</div>,
          document.body,
        )
      );

      renderer.render(<Foo />);

      const node = renderer.getNode();

      cleanNode(node);

      expect(prettyFormat(node)).to.equal(prettyFormat({
        nodeType: 'function',
        type: Foo,
        props: {},
        ref: null,
        instance: null,
        rendered: {
          nodeType: 'host',
          type: 'div',
          props: { className: 'Foo' },
          ref: null,
          instance: null,
          rendered: ['Hello World!'],
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
        ref: null,
        instance: null,
        rendered: {
          nodeType: 'host',
          type: 'span',
          props: { className: 'Qoo' },
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
        ref: null,
        instance: null,
        rendered: {
          nodeType: 'host',
          type: 'span',
          props: { className: 'Qoo' },
          ref: null,
          instance: null,
          rendered: ['Hello World!'],
        },
      }));
    });

    it('handles null rendering components', () => {
      const options = { mode: 'mount' };
      const renderer = adapter.createRenderer(options);

      class Foo extends React.Component {
        render() {
          return null;
        }
      }

      renderer.render(<Foo />);

      const node = renderer.getNode();

      expect(node.instance).to.be.instanceof(Foo);

      cleanNode(node);

      expect(prettyFormat(node)).to.equal(prettyFormat({
        nodeType: 'class',
        type: Foo,
        props: {},
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
        ref: null,
        instance: null,
        rendered: {
          nodeType: 'class',
          type: Bar,
          props: { special: true },
          ref: null,
          instance: null,
          rendered: {
            nodeType: 'function',
            type: Foo,
            props: { className: 'special' },
            ref: null,
            instance: null,
            rendered: {
              nodeType: 'host',
              type: 'div',
              props: { className: 'Foo special' },
              ref: null,
              instance: null,
              rendered: [
                {
                  nodeType: 'host',
                  type: 'span',
                  props: { className: 'Foo2' },
                  ref: null,
                  instance: null,
                  rendered: ['Literal'],
                },
                {
                  nodeType: 'function',
                  type: Qoo,
                  props: {},
                  ref: null,
                  instance: null,
                  rendered: {
                    nodeType: 'host',
                    type: 'span',
                    props: { className: 'Qoo' },
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
        ref: null,
        instance: null,
        rendered: {
          nodeType: 'class',
          type: Bar,
          props: { special: true },
          ref: null,
          instance: null,
          rendered: {
            nodeType: 'class',
            type: Foo,
            props: { className: 'special' },
            ref: null,
            instance: null,
            rendered: {
              nodeType: 'host',
              type: 'div',
              props: { className: 'Foo special' },
              ref: null,
              instance: null,
              rendered: [
                {
                  nodeType: 'host',
                  type: 'span',
                  props: { className: 'Foo2' },
                  ref: null,
                  instance: null,
                  rendered: ['Literal'],
                },
                {
                  nodeType: 'class',
                  type: Qoo,
                  props: {},
                  ref: null,
                  instance: null,
                  rendered: {
                    nodeType: 'host',
                    type: 'span',
                    props: { className: 'Qoo' },
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
    class Dummy extends React.Component {
      render() {
        return null;
      }
    }

    class Counter extends React.Component {
      constructor(props) {
        super(props);
        this.state = { count: 0 };
      }

      increment() {
        this.setState(({ count }) => ({ count: count + 1 }));
      }

      render() {
        return <Dummy {...this.state} />;
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
    // eslint-disable-next-line react/require-render-return
    class Bar extends React.Component {
      constructor(props) {
        super(props);
        throw new Error('Bar constructor should not be called');
      }

      render() {
        throw new Error('Bar render method should not be called');
      }
    }

    // eslint-disable-next-line react/require-render-return
    class Foo extends React.Component {
      render() {
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
      ref: null,
      instance: null,
      rendered: {
        nodeType: 'class',
        type: Bar,
        props: {},
        ref: null,
        instance: null,
        rendered: [
          {
            nodeType: 'class',
            type: Foo,
            props: {},
            ref: null,
            instance: null,
            rendered: null,
          },
          {
            nodeType: 'class',
            type: Foo,
            props: {},
            ref: null,
            instance: null,
            rendered: null,
          },
          {
            nodeType: 'class',
            type: Foo,
            props: {},
            ref: null,
            instance: null,
            rendered: null,
          },
        ],
      },
    }));
  });

  it('does not erroneously add a key when refs are present', () => {
    // eslint-disable-next-line react/require-render-return
    class Inner extends React.Component {
      constructor(props) {
        super(props);
        throw new Error('Inner constructor should not be called');
      }

      render() {
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
      ref: null,
      instance: null,
      rendered: {
        nodeType: 'class',
        type: Inner,
        props: {},
        // pretty print removes ref because it is a function
        instance: null,
        rendered: null,
      },
    }));
  });

  it('adds keys correctly to elements that have them', () => {
    // eslint-disable-next-line react/require-render-return
    class Inner extends React.Component {
      constructor(props) {
        super(props);
        throw new Error('Inner constructor should not be called');
      }

      render() {
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
    // eslint-disable-next-line react/require-render-return
    class Inner extends React.Component {
      constructor(props) {
        super(props);
        throw new Error('Inner constructor should not be called');
      }

      render() {
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

  describe('provides node displayNames', () => {
    const getDisplayName = el => adapter.displayNameOfNode(adapter.elementToNode(el));

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

    itIf(is('>= 16.3'), 'supports AsyncMode', () => {
      expect(getDisplayName(<AsyncMode />)).to.equal('AsyncMode');
    });

    itIf(is('>= 16.4'), 'supports Profiler', () => {
      expect(getDisplayName(<Profiler />)).to.equal('Profiler');
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
});
