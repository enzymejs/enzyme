import Adapter from 'enzyme-adapter-foo';

let renderer;
let tree;

// Example Components
// ==================================================

// Composite returning host. no children props.
const Qoo = () => (
  <span className="Qoo">Hello World!</span>
);

// composite returning host. passes through children.
const Foo = ({ className, children }) => (
  <div className={'Foo ' + className}>
    <span className="Foo2">Literal</span>
    {children}
  </div>
);

// composite returning composite. passes through children.
const Bar = ({ special, children }) => (
  <Foo className={special ? 'special' : 'normal'}>
    {children}
  </Foo>
);

// composite return composite. no children props.
const Bam = () => (
  <Bar special>
    <Qoo />
  </Bar>
);

// Examples
// ==================================================

// IMPORTANT NOTE:
// in these examples i'm excluding `children` from `props` so that
// it's easier to read the tree output. In reality, `children` will
// be present and unaltered in the props, however enzyme will
// not use it for traversal.

renderer = Adapter.createRenderer({
  // this would be the default as well.
  isHost: el => typeof el.type === 'string',
});

// Simple Example
renderer.render(<Qoo />);
// =>

// Expected HTML output:
//
// <span class="Qoo">Hello World!</span>

// Conceptual debug output:
//
// <Qoo>
//   <span className="Qoo">Hello World!</span>
// </Qoo>

// Expected tree output:
// tree = renderer.getNode();
tree = {
  type: Qoo,
  nodeType: 'function',
  props: {},
  rendered: {
    type: 'span',
    nodeType: 'host',
    props: { className: 'Qoo' },
    rendered: ['Hello World!'],
  },
};

// Complex Example
renderer.render(<Bam />);

// Expected HTML output:
//
// <div class="Foo special">
//   <span class="Foo2">Literal</span>
//   <span class="Qoo">Hello World!</span>
// </div>

// Conceptual debug output:
//
// <Bam>
//   <Bar special>
//     <Foo className="special">
//       <div className="Foo special">
//         <span className="Foo2">Literal</span>
//         <Qoo>
//           <span className="Qoo">Hello World!</span>
//         </Qoo>
//       </div>
//     </Foo>
//   </Bar>
// </Bam>

// Expected tree output
// tree = renderer.getNode();
tree = {
  type: Bam,
  nodeType: 'function',
  props: {},
  rendered: {
    type: Bar,
    nodeType: 'function',
    props: { special: true },
    rendered: {
      type: Foo,
      nodeType: 'function',
      props: { className: 'special' },
      rendered: {
        type: 'div',
        nodeType: 'host',
        props: { className: 'Foo special' },
        rendered: [
          {
            type: 'span',
            nodeType: 'host',
            props: { className: 'Foo2' },
            rendered: ['Literal'],
          },
          {
            type: Qoo,
            nodeType: 'function',
            props: {},
            rendered: {
              type: 'span',
              nodeType: 'host',
              props: { className: 'Qoo' },
              rendered: ['Hello World!'],
            },
          },
        ],
      },
    },
  },
};


renderer = Adapter.createRenderer({
  // this is "shallow", but only if we specify
  // not to call this on the root node... which
  // is kind of strange.
  isHost: () => true,
});

renderer.render(<Bam />);

// Conceptual debug output:
//
// <Bam>
//   <Bar special>
//     <Qoo />
//   </Bar>
// </Bam>

// Expected tree output
// tree = renderer.getNode();
tree = {
  type: Bam,
  nodeType: 'function',
  props: {},
  rendered: {
    type: Bar,
    nodeType: 'host',
    props: { special: true },
    rendered: [
      {
        type: Qoo,
        nodeType: 'host',
        props: {},
        rendered: null,
      },
    ],
  },
};

renderer.render(
  <div>
    <Foo />
  </div>
);

// Conceptual debug output:
//
// <div>
//   <Foo />
// </Bam>

// Expected tree output
// tree = renderer.getNode();
tree = {
  type: 'div',
  nodeType: 'host',
  props: {},
  rendered: [
    {
      type: Foo,
      props: {},
      nodeType: 'host',
      rendered: null,
    },
  ],
};

renderer = Adapter.createRenderer({
  // In this case, we treat `Bar` as a host node
  // but `Qoo` is not, so gets rendered
  isHost: el => [Bar].includes(el.type),
});

renderer.render(<Bam />);

// Conceptual debug output:
// <Bam>
//   <Bar special>
//     <Qoo>
//       <span className="Qoo">Hello World!</span>
//     </Qoo>
//   </Bar>
// </Bam>

// Expected tree output
// tree = renderer.getNode();
tree = {
  type: Bam,
  nodeType: 'function',
  props: {},
  rendered: {
    type: Bar,
    nodeType: 'host',
    props: { special: true },
    rendered: [
      {
        type: Qoo,
        nodeType: 'function',
        props: {},
        rendered: {
          type: 'span',
          nodeType: 'host',
          props: { className: 'Qoo' },
          rendered: ['Hello World!'],
        },
      },
    ],
  },
};
