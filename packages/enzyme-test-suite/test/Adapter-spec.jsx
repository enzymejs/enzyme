import React from 'react';
import { expect } from 'chai';
import jsdom from 'jsdom';
import configuration from 'enzyme/build/configuration';

import './_helpers/setupAdapters';
import { renderToString } from './_helpers/react-compat';
import { REACT013, REACT16 } from './_helpers/version';
import { itIf, describeWithDOM } from './_helpers';

const { adapter } = configuration.get();

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
  describeWithDOM('mounted render', () => {

    function hydratedTreeMatchesUnhydrated(element) {
      const markup = renderToString(element);
      const dom = jsdom.jsdom(`<div id="root">${markup}</div>`);

      const rendererA = adapter.createRenderer({
        mode: 'mount',
        attachTo: dom.querySelector('#root'),
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

    it('hydrated trees match unhydrated trees', () => {
      class Bam extends React.Component {
        render() { return (<div>{this.props.children}</div>); }
      }
      class Foo extends React.Component {
        render() { return (<Bam>{this.props.children}</Bam>); }
      }
      class One extends React.Component {
        render() { return (<Foo><span><Foo /></span></Foo>); }
      }
      class Two extends React.Component {
        render() { return (<Foo><span>2</span></Foo>); }
      }
      class Three extends React.Component {
        render() { return (<Foo><span><div /></span></Foo>); }
      }
      class Four extends React.Component {
        render() { return (<Foo><span>{'some string'}4{'another string'}</span></Foo>); }
      }

      hydratedTreeMatchesUnhydrated(<One />);
      hydratedTreeMatchesUnhydrated(<Two />);
      hydratedTreeMatchesUnhydrated(<Three />);
      hydratedTreeMatchesUnhydrated(<Four />);
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
            REACT16 ? '4' : 4,
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

    itIf(REACT16, 'renders react portals', () => {
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

    itIf(!REACT013, 'renders simple components returning host components', () => {
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


    itIf(!REACT013, 'renders complicated trees of composites and hosts', () => {
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
        this.setState({ count: this.state.count + 1 });
      }

      render() {
        return <Dummy {...this.state} />;
      }
    }

    const options = { mode: 'mount' };
    const renderer = adapter.createRenderer(options);

    renderer.render(<Counter />);

    let tree = renderer.getNode();
    expect(tree.rendered.props.count).to.equal(0);
    tree.instance.increment();
    tree = renderer.getNode();
    expect(tree.rendered.props.count).to.equal(1);
    tree.instance.increment();
    tree = renderer.getNode();
    expect(tree.rendered.props.count).to.equal(2);
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

});
