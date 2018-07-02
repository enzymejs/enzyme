import { expect } from 'chai';
import React from 'react';
import wrap from 'mocha-wrap';
import sinon from 'sinon';

import { mount, shallow } from 'enzyme';
import { get } from 'enzyme/build/configuration';
import {
  spaces,
  indent,
  debugNode,
  debugNodes,
  typeName,
} from 'enzyme/build/Debug';

import './_helpers/setupAdapters';
import {
  describeWithDOM,
  describeIf,
  itIf,
} from './_helpers';
import { is } from './_helpers/version';

const { adapter } = get();

const debugElement = element => debugNode(adapter.elementToNode(element));

describe('debug', () => {
  wrap()
    .withOverride(() => adapter, 'displayNameOfNode', () => undefined)
    .describe('typeName(node)', () => {
      it('returns `.type` when not a function', () => {
        const type = {};
        expect(typeName({ type })).to.equal(type);
      });

      describe('when `.type` is a function', () => {
        it('returns the function’s name', () => {
          function Foo() {}
          expect(typeName({ type: Foo })).to.equal('Foo');
        });

        it('returns the function’s `.displayName` when present', () => {
          function Foo() {}
          Foo.displayName = 'Bar';
          expect(typeName({ type: Foo })).to.equal('Bar');
        });

        it('returns "Component" when the function is anonymous', () => {
          const anon = Object(() => {});
          expect(typeName({ type: anon })).to.equal('Component');
        });
      });

      wrap()
        .withOverride(() => adapter, 'displayNameOfNode', () => sinon.stub())
        .describe('when the adapter has a `displayNameOfNode` function', () => {
          it('calls it, and returns its return value', () => {
            const stub = adapter.displayNameOfNode;
            const sentinel = {};
            stub.returns(sentinel);

            const node = {};
            expect(typeName(node)).to.equal(sentinel);

            expect(stub).to.have.property('callCount', 1);
            const { args } = stub.firstCall;
            expect(args).to.eql([node]);
          });

          it('returns "Component" when `adapter.displayNameOfNode` returns something falsy', () => {
            const stub = adapter.displayNameOfNode;
            stub.returns('');

            expect(typeName()).to.equal('Component');
          });
        });
    });

  describe('spaces(n)', () => {
    it('should return n spaces', () => {
      expect(spaces(4)).to.equal('    ');
      expect(spaces(2)).to.equal('  ');
      expect(spaces(0)).to.equal('');
    });
  });

  describe('indent(depth, string)', () => {
    it('should indent a single-line string by (n) spaces', () => {
      expect(indent(4, 'hello')).to.equal('    hello');
      expect(indent(2, 'hello')).to.equal('  hello');
      expect(indent(0, 'hello')).to.equal('hello');
    });

    it('should intent a multiline string by (n) spaces', () => {
      expect(indent(2, 'foo\nbar')).to.equal('  foo\n  bar');
    });
  });

  describe('debugNode(node)', () => {
    it('should render a node with no props or children as single single xml tag', () => {
      expect(debugElement(<div />)).to.equal('<div />');
    });

    it('should render props inline inline', () => {
      expect(debugElement((
        <div id="foo" className="bar" />
      ))).to.equal((
        '<div id="foo" className="bar" />'
      ));
    });

    it('should render children on newline and indented', () => {
      expect(debugElement((
        <div>
          <span />
        </div>
      ))).to.equal((
        `<div>
  <span />
</div>`
      ));
    });

    it('should render mixed children', () => {
      expect(debugElement((
        <div>hello{'world'}</div>
      ))).to.equal((
        `<div>
  hello
  world
</div>`
      ));
    });

    it('should render props on root and children', () => {
      expect(debugElement((
        <div id="foo">
          <span id="bar" />
        </div>
      ))).to.equal((
        `<div id="foo">
  <span id="bar" />
</div>`
      ));
    });

    it('should render text on new line and indented', () => {
      expect(debugElement((
        <span>some text</span>
      ))).to.equal((
        `<span>
  some text
</span>`
      ));
    });

    it('should render composite components as tags w/ displayName', () => {
      class Foo extends React.Component {
        render() { return <div />; }
      }
      Foo.displayName = 'Bar';

      expect(debugElement((
        <div>
          <Foo />
        </div>
      ))).to.equal((
        `<div>
  <Bar />
</div>`
      ));
    });

    it('should render composite components as tags w/ name', () => {
      class Foo extends React.Component {
        render() { return <div />; }
      }

      expect(debugElement((
        <div>
          <Foo />
        </div>
      ))).to.equal((
        `<div>
  <Foo />
</div>`
      ));
    });

    itIf(is('> 0.13'), 'should render stateless components as tags w/ name', () => {
      const Foo = () => <div />;

      expect(debugElement((
        <div>
          <Foo />
        </div>
      ))).to.equal((
        `<div>
  <Foo />
</div>`
      ));
    });

    it('should render mapped children properly', () => {
      expect(debugElement((
        <div>
          <i>not in array</i>
          {['a', 'b', 'c']}
        </div>
      ))).to.equal((
        `<div>
  <i>
    not in array
  </i>
  a
  b
  c
</div>`
      ));
    });

    it('should render number children properly', () => {
      expect(debugElement((
        <div>
          {-1}
          {0}
          {1}
        </div>
      ))).to.equal((
        `<div>
  -1
  0
  1
</div>`
      ));
    });

    it('renders html entities properly', () => {
      expect(debugElement((
        <div>&gt;</div>
      ))).to.equal((
        `<div>
  &gt;
</div>`
      ));
    });

    it('should not render falsy children ', () => {
      expect(debugElement((
        <div id="foo">
          {false}
          {null}
          {undefined}
          {''}
        </div>
      ))).to.equal('<div id="foo" />');
    });

    it('should render boxed primitives as the primitive', () => {
      expect(debugElement((
        <div a={Object('foo')} b={Object(3)} c={Object(true)} />
      ))).to.equal('<div a="foo" b={3} c={true} />');
    });
  });

  describeWithDOM('debugInst(inst)', () => {
    it('renders basic debug of mounted components', () => {
      class Foo extends React.Component {
        render() {
          return (
            <div className="foo">
              <span>Foo</span>
            </div>
          );
        }
      }
      expect(mount(<Foo id="2" />).debug()).to.eql((
        `<Foo id="2">
  <div className="foo">
    <span>
      Foo
    </span>
  </div>
</Foo>`
      ));
    });

    it('renders basic debug of components with mixed children', () => {
      class Foo extends React.Component {
        render() {
          return (
            <div>hello{'world'}</div>
          );
        }
      }
      expect(mount(<Foo id="2" />).debug()).to.eql((
        `<Foo id="2">
  <div>
    hello
    world
  </div>
</Foo>`
      ));
    });

    it('renders debug of compositional components', () => {
      class Foo extends React.Component {
        render() {
          return (
            <div className="foo">
              <span>Foo</span>
            </div>
          );
        }
      }
      class Bar extends React.Component {
        render() {
          return (
            <div className="bar">
              <span>Non-Foo</span>
              <Foo baz="bax" />
            </div>
          );
        }
      }
      expect(mount(<Bar id="2" />).debug()).to.eql((
        `<Bar id="2">
  <div className="bar">
    <span>
      Non-Foo
    </span>
    <Foo baz="bax">
      <div className="foo">
        <span>
          Foo
        </span>
      </div>
    </Foo>
  </div>
</Bar>`
      ));
    });

    it('renders a subtree of a mounted tree', () => {
      class Foo extends React.Component {
        render() {
          return (
            <div className="foo">
              <span>Foo</span>
            </div>
          );
        }
      }
      class Bar extends React.Component {
        render() {
          return (
            <div className="bar">
              <span>Non-Foo</span>
              <Foo baz="bax" />
            </div>
          );
        }
      }
      expect(mount(<Bar id="2" />).find(Foo).debug()).to.eql((
        `<Foo baz="bax">
  <div className="foo">
    <span>
      Foo
    </span>
  </div>
</Foo>`
      ));
    });

    it('renders passed children properly', () => {
      class Foo extends React.Component {
        render() {
          const { children } = this.props;
          return (
            <div className="foo">
              <span>From Foo</span>
              {children}
            </div>
          );
        }
      }
      class Bar extends React.Component {
        render() {
          return (
            <div className="bar">
              <Foo baz="bax">
                <span>From Bar</span>
              </Foo>
            </div>
          );
        }
      }

      expect(mount(<Bar id="2" />).debug()).to.eql((
        `<Bar id="2">
  <div className="bar">
    <Foo baz="bax">
      <div className="foo">
        <span>
          From Foo
        </span>
        <span>
          From Bar
        </span>
      </div>
    </Foo>
  </div>
</Bar>`
      ));
    });

    describeIf(is('> 0.13'), 'stateless function components', () => {
      it('renders basic debug of mounted components', () => {
        const Foo = () => (
          <div className="foo">
            <span>Foo</span>
          </div>
        );
        expect(mount(<Foo id="2" />).debug()).to.eql((
          `<Foo id="2">
  <div className="foo">
    <span>
      Foo
    </span>
  </div>
</Foo>`
        ));
      });

      it('renders debug of compositional components', () => {
        const Foo = () => (
          <div className="foo">
            <span>Foo</span>
          </div>
        );
        const Bar = () => (
          <div className="bar">
            <span>Non-Foo</span>
            <Foo baz="bax" />
          </div>
        );
        expect(mount(<Bar id="2" />).debug()).to.eql((
          `<Bar id="2">
  <div className="bar">
    <span>
      Non-Foo
    </span>
    <Foo baz="bax">
      <div className="foo">
        <span>
          Foo
        </span>
      </div>
    </Foo>
  </div>
</Bar>`
        ));
      });

      it('renders a subtree of a mounted tree', () => {
        const Foo = () => (
          <div className="foo">
            <span>Foo</span>
          </div>
        );
        const Bar = () => (
          <div className="bar">
            <span>Non-Foo</span>
            <Foo baz="bax" />
          </div>
        );
        expect(mount(<Bar id="2" />).find(Foo).debug()).to.eql((
          `<Foo baz="bax">
  <div className="foo">
    <span>
      Foo
    </span>
  </div>
</Foo>`
        ));
      });

      it('renders passed children properly', () => {
        const Foo = ({ children }) => (
          <div className="foo">
            <span>From Foo</span>
            {children}
          </div>
        );

        const Bar = () => (
          <div className="bar">
            <Foo baz="bax">
              <span>From Bar</span>
            </Foo>
          </div>
        );

        expect(mount(<Bar id="2" />).debug()).to.eql((
          `<Bar id="2">
  <div className="bar">
    <Foo baz="bax">
      <div className="foo">
        <span>
          From Foo
        </span>
        <span>
          From Bar
        </span>
      </div>
    </Foo>
  </div>
</Bar>`
        ));
      });
    });
  });

  describe('shallow', () => {
    it('renders shallow wrapper properly', () => {
      class Foo extends React.Component {
        render() {
          return (
            <div className="foo">
              <span>From Foo</span>
              {this.props.children}
            </div>
          );
        }
      }
      class Bar extends React.Component {
        render() {
          return (
            <div className="bar">
              <Foo baz="bax">
                <span>From Bar</span>
              </Foo>
            </div>
          );
        }
      }

      expect(shallow(<Bar id="2" />).debug()).to.eql((
        `<div className="bar">
  <Foo baz="bax">
    <span>
      From Bar
    </span>
  </Foo>
</div>`
      ));
    });
  });

  describe('debugNodes', () => {
    it('can render a single node', () => {
      class Foo extends React.Component {
        render() {
          return (
            <div className="foo">
              <span>inside Foo</span>
            </div>
          );
        }
      }

      expect(debugNodes(shallow(<Foo />).getNodesInternal())).to.eql((
        `<div className="foo">
  <span>
    inside Foo
  </span>
</div>`
      ));
    });

    it('can render multiple nodes', () => {
      class Foo extends React.Component {
        render() {
          return (
            <div className="foo">
              <span>inside Foo</span>
            </div>
          );
        }
      }

      class Bar extends React.Component {
        render() {
          return (
            <div className="bar">
              <Foo key="foo1" />
              <Foo key="foo2" />
              <Foo key="foo3" />
            </div>
          );
        }
      }

      expect(debugNodes(shallow(<Bar />).children().getElements())).to.eql((
        `<Foo />


<Foo />


<Foo />`
      ));
    });

    it('can render multiple nodes with indent', () => {
      class Foo extends React.Component {
        render() {
          return (
            <div className="bar">
              <span>span1 text</span>
              <span>span2 text</span>
              <span>span3 text</span>
            </div>
          );
        }
      }

      expect(debugNodes(shallow(<Foo />).children().getNodesInternal())).to.eql((
        `<span>
  span1 text
</span>


<span>
  span2 text
</span>


<span>
  span3 text
</span>`
      ));
    });
  });

  describe('debug shallow wrapper', () => {
    it('options.ignoreProps causes props to be omitted', () => {
      class Foo extends React.Component {
        render() {
          const { fooVal } = this.props;
          return (
            <div className="foo">
              {fooVal}
            </div>
          );
        }
      }

      class Bar extends React.Component {
        render() {
          return (
            <div className="class1">
              <Foo fooVal="baz" />
              <span className="class2">span text</span>
            </div>
          );
        }
      }

      expect(shallow(<Bar />).debug({ ignoreProps: false })).to.eql((
        `<div className="class1">
  <Foo fooVal="baz" />
  <span className="class2">
    span text
  </span>
</div>`
      ));

      expect(shallow(<Bar />).debug({ ignoreProps: true })).to.eql((
        `<div>
  <Foo />
  <span>
    span text
  </span>
</div>`
      ));
    });

    it('options.verbose causes arrays and objects to be verbosely printed', () => {
      class Foo extends React.Component {
        render() {
          const nestedData = {
            a: [1, 3, { true: true }],
            b: false,
            c: { d: 'f' },
          };
          nestedData.d = nestedData.a;
          const arry = [1, 2, { f: nestedData.c }];
          return (
            <div data-json={nestedData} data-arry={arry}>Test Component</div>
          );
        }
      }

      const wrapper = shallow(<Foo />);
      expect(wrapper.debug({ verbose: true })).to.equal((
        `<div data-json={{ a: [ 1, 3, { true: true } ], b: false, c: { d: 'f' }, d: [ 1, 3, { true: true } ] }} data-arry={[ 1, 2, { f: { d: 'f' } } ]}>
  Test Component
</div>`
      ));

      expect(wrapper.debug({ verbose: false })).to.equal((
        `<div data-json={{...}} data-arry={{...}}>
  Test Component
</div>`
      ));
    });
  });

  describeWithDOM('debug React wrapper', () => {
    it('options.ignoreProps causes props to be omitted', () => {
      class Foo extends React.Component {
        render() {
          const { fooVal } = this.props;
          return (
            <div className="foo">
              {fooVal}
            </div>
          );
        }
      }

      class Bar extends React.Component {
        render() {
          return (
            <div className="class1">
              <Foo fooVal="baz" />
              <span className="class2">span text</span>
            </div>
          );
        }
      }

      expect(mount(<Bar />).debug({ ignoreProps: false })).to.eql((
        `<Bar>
  <div className="class1">
    <Foo fooVal="baz">
      <div className="foo">
        baz
      </div>
    </Foo>
    <span className="class2">
      span text
    </span>
  </div>
</Bar>`
      ));

      expect(mount(<Bar />).debug({ ignoreProps: true })).to.eql((
        `<Bar>
  <div>
    <Foo>
      <div>
        baz
      </div>
    </Foo>
    <span>
      span text
    </span>
  </div>
</Bar>`
      ));
    });

    it('options.verbose causes arrays and objects to be verbosely printed', () => {
      class Foo extends React.Component {
        render() {
          const nestedData = {
            a: [1, 3, { true: true }],
            b: false,
            c: { d: 'f' },
          };
          nestedData.d = nestedData.a;
          const arry = [1, 2, { f: nestedData.c }];
          return (
            <div data-json={nestedData} data-arry={arry}>Test Component</div>
          );
        }
      }

      const wrapper = mount(<Foo />);
      expect(wrapper.debug({ verbose: true })).to.equal((
        `<Foo>
  <div data-json={{ a: [ 1, 3, { true: true } ], b: false, c: { d: 'f' }, d: [ 1, 3, { true: true } ] }} data-arry={[ 1, 2, { f: { d: 'f' } } ]}>
    Test Component
  </div>
</Foo>`
      ));

      expect(wrapper.debug({ verbose: false })).to.equal((
        `<Foo>
  <div data-json={{...}} data-arry={{...}}>
    Test Component
  </div>
</Foo>`
      ));
    });

    it('handles function children', () => {
      class Abomination extends React.Component {
        render() {
          /* eslint no-unused-vars: 0, func-names: 0 */
          return (
            <div>
              {function Foo() { /* hi */ }}
              {<span />}
              {arrow => arrow('function')}
              {[1, 2, NaN]}
              {function (anonymous) {}}
            </div>
          );
        }
      }

      const wrapper = shallow(<Abomination />);
      expect(wrapper.debug()).to.equal((
        `<div>
  [function Foo]
  <span />
  [function]
  1
  2
  NaN
  [function]
</div>`
      ));
    });
  });
});
