import React from 'react';
import { expect } from 'chai';
import wrap from 'mocha-wrap';
import sinon from 'sinon-sandbox';
import {
  childrenToSimplifiedArray,
  nodeEqual,
  nodeMatches,
  displayNameOfNode,
  spyMethod,
  nodeHasType,
  isCustomComponentElement,
  makeOptions,
  isEmptyValue,
  renderedDive,
  isCustomComponent,
} from 'enzyme/build/Utils';
import getAdapter from 'enzyme/build/getAdapter';
import EnzymeAdapter from 'enzyme/build/EnzymeAdapter';
import {
  flatten,
  mapNativeEventNames,
  propFromEvent,
} from 'enzyme-adapter-utils';
import { get, reset, merge as configure } from 'enzyme/build/configuration';

import './_helpers/setupAdapters';

import { describeIf } from './_helpers';
import { is } from './_helpers/version';

describe('Utils', () => {
  describe('nodeEqual', () => {
    it('matches empty elements of same tag', () => {
      expect(nodeEqual(
        <div />,
        <div />,
      )).to.equal(true);
    });

    it('does not match empty elements of different type', () => {
      expect(nodeEqual(
        <div />,
        <nav />,
      )).to.equal(false);
    });

    it('matches basic prop types', () => {
      expect(nodeEqual(
        <div className="foo" />,
        <div className="foo" />,
      )).to.equal(true);

      expect(nodeEqual(
        <div id="foo" className="bar" />,
        <div id="foo" className="bar" />,
      )).to.equal(true);

      expect(nodeEqual(
        <div id="foo" className="baz" />,
        <div id="foo" className="bar" />,
      )).to.equal(false);
    });

    it('skips undefined props', () => {
      expect(nodeEqual(
        <div id="foo" className={undefined} />,
        <div id="foo" />,
      )).to.equal(true);
    });

    it('checks children as well', () => {
      expect(nodeEqual(
        <div>
          <div />
        </div>,
        <div />,
      )).to.equal(false);

      expect(nodeEqual(
        <div>
          <div />
        </div>,
        <div>
          <div />
        </div>,
      )).to.equal(true);

      expect(nodeEqual(
        <div>
          <div className="foo" />
        </div>,
        <div>
          <div className="foo" />
        </div>,
      )).to.equal(true);

      expect(nodeEqual(
        <div>
          <div className="foo" />
        </div>,
        <div>
          <div />
        </div>,
      )).to.equal(false);
    });

    it('tests deepEquality with object props', () => {
      expect(nodeEqual(
        <div foo={{ a: 1, b: 2 }} />,
        <div foo={{ a: 1, b: 2 }} />,
      )).to.equal(true);

      expect(nodeEqual(
        <div foo={{ a: 2, b: 2 }} />,
        <div foo={{ a: 1, b: 2 }} />,
      )).to.equal(false);

    });

    describe('children props', () => {
      it('matches equal nodes', () => {
        expect(nodeEqual(
          <div>child</div>,
          <div>child</div>,
        )).to.equal(true);
      });

      it('does not match not equal nodes', () => {
        expect(nodeEqual(
          <div>child</div>,
          <div />,
        )).to.equal(false);

        expect(nodeEqual(
          <div />,
          <div>child</div>,
        )).to.equal(false);
      });

      it('matches children before and after interpolation', () => {
        expect(nodeEqual(
          <div>{2}{' children'}{<span />} abc {'hey'}</div>,
          <div>2 children<span /> abc hey</div>,
        )).to.equal(true);
      });

      it('skips null children', () => {
        expect(nodeEqual(
          <div>{null}</div>,
          <div />,
        )).to.equal(true);
      });

      it('skips undefined children', () => {
        expect(nodeEqual(
          <div>{undefined}</div>,
          <div />,
        )).to.equal(true);
      });

      it('skips empty children', () => {
        expect(nodeEqual(
          <div>{[]}</div>,
          <div />,
        )).to.equal(true);
      });

      it('skips array of null children', () => {
        expect(nodeEqual(
          <div>{[null, null, null]}</div>,
          <div />,
        )).to.equal(true);
      });
    });

    describe('basic props and children mixed', () => {
      it('matches equal nodes', () => {
        expect(nodeEqual(
          <div className="foo">child</div>,
          <div className="foo">child</div>,
        )).to.equal(true);
      });

      it('does not match when basic props are not equal', () => {
        expect(nodeEqual(
          <div className="foo">child</div>,
          <div className="bar">child</div>,
        )).to.equal(false);

        expect(nodeEqual(
          <div className="foo">child</div>,
          <div className="bar">child</div>,
        )).to.equal(false);
      });

      it('does not match when children are not equal', () => {
        expect(nodeEqual(
          <div className="foo">child</div>,
          <div className="foo">other child</div>,
        )).to.equal(false);

        expect(nodeEqual(
          <div className="foo">child</div>,
          <div className="foo">other child</div>,
        )).to.equal(false);
      });

      it('matches nodes when children are different but falsy', () => {
        expect(nodeEqual(
          <div className="foo">{null}</div>,
          <div className="foo" />,
        )).to.equal(true);

        expect(nodeEqual(
          <div children={null} className="foo" />, // eslint-disable-line react/no-children-prop
          <div className="foo" />,
        )).to.equal(true);
      });
    });
  });

  describe('nodeMatches', () => {
    function nodesMatchTwoWays(aProps, bProps, LeftTag = 'div', RightTag = 'div', matches = true) {
      expect(nodeMatches(
        <LeftTag {...aProps} />,
        <RightTag {...bProps} />,
      )).to.equal(matches);

      expect(nodeMatches(
        <LeftTag {...bProps} />,
        <RightTag {...aProps} />,
      )).to.equal(matches);
    }
    function nodesDoNotMatchTwoWays(aProps, bProps, LeftTag = 'div', RightTag = 'div') {
      return nodesMatchTwoWays(aProps, bProps, LeftTag, RightTag, false);
    }

    it('matches empty elements of same tag, not distinguishing null/undefined/absent', () => {
      nodesMatchTwoWays({}, {});
      nodesMatchTwoWays({}, { id: null });
      nodesMatchTwoWays({}, { id: undefined });

      nodesMatchTwoWays({ id: null }, {});
      nodesMatchTwoWays({ id: null }, { id: null });
      nodesMatchTwoWays({ id: null }, { id: undefined });

      nodesMatchTwoWays({ id: undefined }, {});
      nodesMatchTwoWays({ id: undefined }, { id: null });
      nodesMatchTwoWays({ id: undefined }, { id: undefined });
    });

    it('does not match empty elements of different type, not distinguishing null/undefined/absent', () => {
      nodesDoNotMatchTwoWays({}, {}, 'div', 'nav');
      nodesDoNotMatchTwoWays({}, { id: null }, 'div', 'nav');
      nodesDoNotMatchTwoWays({}, { id: undefined }, 'div', 'nav');

      nodesDoNotMatchTwoWays({ id: null }, {}, 'div', 'nav');
      nodesDoNotMatchTwoWays({ id: null }, { id: null }, 'div', 'nav');
      nodesDoNotMatchTwoWays({ id: null }, { id: undefined }, 'div', 'nav');

      nodesDoNotMatchTwoWays({ id: undefined }, {}, 'div', 'nav');
      nodesDoNotMatchTwoWays({ id: undefined }, { id: null }, 'div', 'nav');
      nodesDoNotMatchTwoWays({ id: undefined }, { id: undefined }, 'div', 'nav');
    });

    it('matches basic prop types', () => {
      nodesMatchTwoWays({ className: 'foo' }, { className: 'foo' });
      nodesMatchTwoWays({ id: 'foo', className: 'bar' }, { id: 'foo', className: 'bar' });
      nodesDoNotMatchTwoWays({ id: 'foo', className: 'bar' }, { id: 'foo', className: 'baz' });
    });

    it('checks children as well, not distinguishing null/undefined/absent', () => {
      expect(nodeMatches(
        <div>
          <div />
        </div>,
        <div />,
      )).to.equal(false);

      expect(nodeMatches(
        <div><div /></div>,
        <div><div /></div>,
      )).to.equal(true);

      expect(nodeMatches(
        <div><div id={null} /></div>,
        <div><div /></div>,
      )).to.equal(true);
      expect(nodeMatches(
        <div><div /></div>,
        <div><div id={null} /></div>,
      )).to.equal(true);

      expect(nodeMatches(
        <div><div id={undefined} /></div>,
        <div><div /></div>,
      )).to.equal(true);
      expect(nodeMatches(
        <div><div /></div>,
        <div><div id={undefined} /></div>,
      )).to.equal(true);

      expect(nodeMatches(
        <div><div id={undefined} /></div>,
        <div><div id={null} /></div>,
      )).to.equal(true);
      expect(nodeMatches(
        <div><div id={null} /></div>,
        <div><div id={undefined} /></div>,
      )).to.equal(true);

      expect(nodeMatches(
        <div>
          <div className="foo" />
        </div>,
        <div>
          <div className="foo" />
        </div>,
      )).to.equal(true);

      expect(nodeMatches(
        <div>
          <div className="foo" />
        </div>,
        <div>
          <div />
        </div>,
      )).to.equal(false);
    });

    it('tests deepEquality with object props', () => {
      expect(nodeMatches(
        <div foo={{ a: 1, b: 2 }} />,
        <div foo={{ a: 1, b: 2 }} />,
      )).to.equal(true);

      expect(nodeMatches(
        <div foo={{ a: 2, b: 2 }} />,
        <div foo={{ a: 1, b: 2 }} />,
      )).to.equal(false);

    });

    describe('children props', () => {
      it('matches equal nodes', () => {
        expect(nodeMatches(
          <div>child</div>,
          <div>child</div>,
        )).to.equal(true);
      });

      it('does not match not equal nodes', () => {
        expect(nodeMatches(
          <div>child</div>,
          <div />,
        )).to.equal(false);

        expect(nodeMatches(
          <div />,
          <div>child</div>,
        )).to.equal(false);
      });

      it('skips null children', () => {
        expect(nodeMatches(
          <div>{null}</div>,
          <div />,
        )).to.equal(true);
      });

      it('skips undefined children', () => {
        expect(nodeMatches(
          <div>{undefined}</div>,
          <div />,
        )).to.equal(true);
      });

      it('skips empty children', () => {
        expect(nodeMatches(
          <div>{[]}</div>,
          <div />,
        )).to.equal(true);
      });

      it('skips array of null children', () => {
        expect(nodeMatches(
          <div>{[null, null, null]}</div>,
          <div />,
        )).to.equal(true);
      });
    });

    describe('basic props and children mixed', () => {
      it('matches equal nodes', () => {
        expect(nodeMatches(
          <div className="foo">child</div>,
          <div className="foo">child</div>,
        )).to.equal(true);
      });

      it('does not match when basic props are not equal', () => {
        expect(nodeMatches(
          <div className="foo">child</div>,
          <div className="bar">child</div>,
        )).to.equal(false);

        expect(nodeMatches(
          <div className="foo">child</div>,
          <div className="bar">child</div>,
        )).to.equal(false);
      });

      it('does not match when children are not equal', () => {
        expect(nodeMatches(
          <div className="foo">child</div>,
          <div className="foo">other child</div>,
        )).to.equal(false);

        expect(nodeMatches(
          <div className="foo">child</div>,
          <div className="foo">other child</div>,
        )).to.equal(false);
      });

      it('matches nodes when children are different but falsy', () => {
        expect(nodeMatches(
          <div className="foo">{null}</div>,
          <div className="foo" />,
        )).to.equal(true);

        expect(nodeMatches(
          <div children={null} className="foo" />, // eslint-disable-line react/no-children-prop
          <div className="foo" />,
        )).to.equal(true);

        expect(nodeMatches(
          <div foo="" />,
          <div foo={0} />,
        )).to.equal(false);

        expect(nodeMatches(
          <div>{''}</div>,
          <div>{0}</div>,
        )).to.equal(false);
      });
    });
  });

  describe('propFromEvent', () => {
    it('works', () => {
      expect(propFromEvent('click')).to.equal('onClick');
      expect(propFromEvent('mouseenter')).to.equal('onMouseEnter');
    });

    describe('conditionally supported events', () => {
      it('transforms animation events when supported', () => {
        expect(propFromEvent('animationiteration', { animation: false })).to.equal('onAnimationiteration');
        expect(propFromEvent('animationiteration', { animation: true })).to.equal('onAnimationIteration');
      });

      it('transforms pointer events when supported', () => {
        expect(propFromEvent('pointerover', { pointerEvents: false })).to.equal('onPointerover');
        expect(propFromEvent('pointerover', { pointerEvents: true })).to.equal('onPointerOver');
      });

      it('transforms aux click events when supported', () => {
        expect(propFromEvent('auxclick', { auxClick: false })).to.equal('onAuxclick');
        expect(propFromEvent('auxclick', { auxClick: true })).to.equal('onAuxClick');
      });
    });
  });

  describe('mapNativeEventNames', () => {
    describe('given an event that isn‘t a mapped', () => {
      it('returns the original event', () => {
        const result = mapNativeEventNames('click');
        expect(result).to.equal('click');
      });

    });

    describe('given a React capitalised mouse event', () => {
      it('returns the original event', () => {
        const result = mapNativeEventNames('mouseEnter');
        expect(result).to.equal('mouseEnter');
      });
    });

    describe('given a native lowercase event', () => {
      it('transforms it into the React capitalised event', () => {
        const result = mapNativeEventNames('dragenter');
        expect(result).to.equal('dragEnter');
      });
    });

    describe('conditionally supported events', () => {
      it('ignores unsupported events', () => {
        const result = mapNativeEventNames('animationiteration');
        expect(result).to.equal('animationiteration');
      });

      it('transforms animation events when supported', () => {
        const result = mapNativeEventNames('animationiteration', { animation: true });
        expect(result).to.equal('animationIteration');
      });

      it('transforms pointer events when supported', () => {
        const result = mapNativeEventNames('pointerover', { pointerEvents: true });
        expect(result).to.equal('pointerOver');
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

  describe('childrenToSimplifiedArray', () => {
    function expectEqualArrays(a, b) {
      expect(a.length).to.be.equal(b.length);

      const nodesAreEqual = a.every((n, i) => nodeEqual(a[i], b[i]));
      expect(nodesAreEqual).to.equal(true);
    }

    it('joins string and numerical children as a string', () => {
      const children = [3, 'textual', 'children'];
      const simplified = ['3textualchildren'];
      expectEqualArrays(childrenToSimplifiedArray(children), simplified);
    });

    it('handles non-textual nodes', () => {
      const children = ['with', 1, <div />, 'other node'];
      const simplified = ['with1', <div />, 'other node'];
      expectEqualArrays(childrenToSimplifiedArray(children), simplified);
    });
  });

  describe('flatten', () => {
    it('recursively flattens a nested iterable structure', () => {
      const nested = [1, [2, [3, [4]], 5], 6, [7, [8, 9]], 10];
      const flat = flatten(nested);
      expect(flat).to.deep.equal([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });
  });

  describe('makeOptions', () => {
    let originalConfig;
    const adapter = getAdapter();
    const initialConfig = {
      adapter,
      foo: 'bar',
    };
    const node = {};
    const otherNode = {};

    beforeEach(() => {
      originalConfig = get();
      reset(initialConfig);
    });

    afterEach(() => {
      reset(originalConfig);
    });

    it('throws when passed attachTo and hydrateIn do not agree', () => {
      expect(() => makeOptions({ attachTo: node, hydrateIn: otherNode })).to.throw(
        TypeError,
        'If both the `attachTo` and `hydrateIn` options are provided, they must be === (for backwards compatibility)',
      );
    });

    it('throws when config attachTo and hydrateIn do not agree', () => {
      configure({ attachTo: node, hydrateIn: otherNode });
      expect(() => makeOptions({})).to.throw(
        TypeError,
        'If both the `attachTo` and `hydrateIn` options are provided, they must be === (for backwards compatibility)',
      );
    });

    it('returns an object that includes the config', () => {
      expect(makeOptions({ bar: 'baz' })).to.eql({
        ...initialConfig,
        bar: 'baz',
      });
    });

    it('sets attachTo and hydrateIn to hydrateIn, when attachTo is missing', () => {
      expect(makeOptions({ hydrateIn: node })).to.eql({
        ...initialConfig,
        hydrateIn: node,
        attachTo: node,
      });
    });

    it('sets attachTo and hydrateIn to hydrateIn, when attachTo === hydrateIn', () => {
      expect(makeOptions({ hydrateIn: node, attachTo: node })).to.eql({
        ...initialConfig,
        hydrateIn: node,
        attachTo: node,
      });
    });

    it('only sets attachTo, when hydrateIn is missing', () => {
      expect(makeOptions({ attachTo: node })).to.eql({
        ...initialConfig,
        attachTo: node,
      });
    });

    describe('when DOM node options are set in the config', () => {
      it('inherits attachTo', () => {
        reset({ ...initialConfig, attachTo: node });
        expect(makeOptions({})).to.eql({
          ...initialConfig,
          attachTo: node,
        });
      });

      it('inherits hydrateIn', () => {
        reset({ ...initialConfig, hydrateIn: node });
        expect(makeOptions({})).to.eql({
          ...initialConfig,
          attachTo: node,
          hydrateIn: node,
        });
      });

      it('allows overriding of attachTo', () => {
        reset({ ...initialConfig, attachTo: node });
        expect(makeOptions({ attachTo: otherNode })).to.eql({
          ...initialConfig,
          attachTo: otherNode,
        });
      });

      it('allows overriding of hydrateIn', () => {
        reset({ ...initialConfig, hydrateIn: node });
        expect(makeOptions({ hydrateIn: otherNode })).to.eql({
          ...initialConfig,
          attachTo: otherNode,
          hydrateIn: otherNode,
        });
      });
    });
  });

  describe('isEmptyValue', () => {
    it('returns true with `false` or `null`', () => {
      const validValues = [false, null];

      validValues.forEach((value) => {
        expect([value, isEmptyValue(value)]).to.eql([value, true]);
      });
    });

    it('returns false when it recieves any other value than "false" or null', () => {
      const values = [undefined, true, 'test', []];

      values.forEach((value) => {
        expect([value, isEmptyValue(value)]).to.eql([value, false]);
      });
    });
  });

  describe('renderedDive', () => {
    const emptyNodetestData = [
      [{ rendered: null }, { rendered: false }],
      { rendered: { rendered: false } },
      false,
      null,
      { rendered: false },
      { rendered: null },
    ];
    const nonEmptyNodeData = [
      [{ rendered: null }, { rendered: <div /> }],
      [{ rendered: null }, { rendered: { rendered: 'hello test' } }],
      [{ rendered: null }, { rendered: { rendered: [{ rendered: null }, { rendered: <span /> }] } }],
      { rendered: '' },
      { rendered: { rendered: [{ rendered: null }, { rendered: <span /> }] } },
    ];

    it('returns true when renderedDive receives nodes that render validEmpty values', () => {
      emptyNodetestData.forEach(node => expect(renderedDive(node)).to.equal(true));
    });

    it('returns false when renderedDive receives nodes that render non-valid empty values', () => {
      nonEmptyNodeData.forEach(node => expect(renderedDive(node)).to.equal(false));
    });
  });

  describe('spyMethod', () => {
    it('can spy last return value and restore it', () => {
      class Counter {
        constructor() {
          this.count = 1;
        }

        incrementAndGet() {
          this.count = this.count + 1;
          return this.count;
        }
      }
      const instance = new Counter();
      const obj = {
        count: 1,
        incrementAndGet() {
          this.count = this.count + 1;
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

  describe('isCustomComponentElement()', () => {
    const adapter = getAdapter();

    wrap()
      .withOverride(() => adapter, 'isCustomComponentElement', () => undefined)
      .describe('with an adapter lacking `.isCustomComponentElement`', () => {
        describe('given a valid CustomComponentElement', () => {
          it('returns true', () => {
            class Foo extends React.Component {
              render() { return <div />; }
            }
            expect(isCustomComponentElement(<Foo />, adapter)).to.equal(true);
          });

          describeIf(is('> 0.13'), 'stateless function elements', () => {
            it('returns true', () => {
              const Foo = () => <div />;

              expect(isCustomComponentElement(<Foo />, adapter)).to.equal(true);
            });
          });

          describeIf(is('>=16.3.0'), 'forwardRef Elements', () => {
            it('returns false', () => {
              const Foo = React.forwardRef(() => <div />);
              expect(isCustomComponentElement(<Foo />, adapter)).to.equal(false);
            });
          });
        });

        describe('given an invalid CustomComponentElement', () => {
          it('returns false for HTML elements', () => {
            expect(isCustomComponentElement(<div />, adapter)).to.equal(false);
          });

          it('returns false for non-Components', () => {
            [
              class Foo {},
              {},
              () => {},
              'div',
              'Foo',
              null,
            ].forEach((nonComponent) => {
              expect(isCustomComponentElement(nonComponent, adapter)).to.equal(false);
            });
          });
        });
      });

    wrap()
      .withOverride(() => adapter, 'isCustomComponentElement', () => () => false)
      .describe('with an adapter that has `.isCustomComponentElement` that always returns false', () => {
        describe('given a valid CustomComponentElement', () => {
          it('returns false', () => {
            class Foo extends React.Component {
              render() { return <div />; }
            }
            expect(isCustomComponentElement(<Foo />, adapter)).to.equal(false);
          });

          describeIf(is('> 0.13'), 'stateless function elements', () => {
            it('returns false', () => {
              const Foo = () => <div />;

              expect(isCustomComponentElement(<Foo />, adapter)).to.equal(false);
            });
          });

          describeIf(is('>=16.3.0'), 'forwardRef Elements', () => {
            it('returns false', () => {
              const Foo = React.forwardRef(() => <div />);
              expect(isCustomComponentElement(<Foo />, adapter)).to.equal(false);
            });
          });
        });

        describe('given an invalid CustomComponentElement', () => {
          it('returns false for HTML elements', () => {
            expect(isCustomComponentElement(<div />, adapter)).to.equal(false);
          });

          it('returns false for non-Components', () => {
            [
              class Foo {},
              {},
              () => {},
              'div',
              'Foo',
              null,
            ].forEach((nonComponent) => {
              expect(isCustomComponentElement(nonComponent, adapter)).to.equal(false);
            });
          });
        });
      });

    wrap()
      .withOverride(() => adapter, 'isCustomComponentElement', () => () => true)
      .describe('with an adapter that has `.isCustomComponentElement` that always returns true', () => {
        describe('given a valid CustomComponentElement', () => {
          it('returns true', () => {
            class Foo extends React.Component {
              render() { return <div />; }
            }
            expect(isCustomComponentElement(<Foo />, adapter)).to.equal(true);
          });

          describeIf(is('> 0.13'), 'stateless function elements', () => {
            it('returns true', () => {
              const Foo = () => <div />;

              expect(isCustomComponentElement(<Foo />, adapter)).to.equal(true);
            });
          });

          describeIf(is('>=16.3.0'), 'forwardRef Elements', () => {
            it('returns true', () => {
              const Foo = React.forwardRef(() => <div />);
              expect(isCustomComponentElement(<Foo />, adapter)).to.equal(true);
            });
          });
        });

        describe('given an invalid CustomComponentElement', () => {
          it('returns true for HTML elements', () => {
            expect(isCustomComponentElement(<div />, adapter)).to.equal(true);
          });

          it('returns true for non-Components', () => {
            [
              class Foo {},
              {},
              () => {},
              'div',
              'Foo',
              null,
            ].forEach((nonComponent) => {
              expect(isCustomComponentElement(nonComponent, adapter)).to.equal(true);
            });
          });
        });
      });
  });

  wrap()
    .withOverride(() => getAdapter(), 'displayNameOfNode', () => undefined)
    .describe('nodeHasType', () => {
      it('is `false` if either argument is falsy', () => {
        expect(nodeHasType(null, {})).to.equal(false);
        expect(nodeHasType({}, null)).to.equal(false);
      });

      it('is `false` if `node` has a falsy `type`', () => {
        expect(nodeHasType({}, {})).to.equal(false);
        expect(nodeHasType({ type: null }, {})).to.equal(false);
        expect(nodeHasType({ type: false }, {})).to.equal(false);
        expect(nodeHasType({ type: '' }, {})).to.equal(false);
        expect(nodeHasType({ type: 0 }, {})).to.equal(false);
      });

      it('compares `node.type` to `type` when `node.type` is a non-empty string', () => {
        expect(nodeHasType({ type: 'foo' }, 'foo')).to.equal(true);
        expect(nodeHasType({ type: 'foo' }, 'bar')).to.equal(false);
      });

      describe('when only `node.type.displayName` matches `type`', () => {
        const x = {};
        it('is `true` when `node.type` is an object', () => {
          expect(nodeHasType(
            { type: { displayName: x } },
            x,
          )).to.equal(true);
        });

        it('is `true` when `node.type` is a function', () => {
          expect(nodeHasType(
            { type: Object.assign(() => {}, { displayName: x }) },
            x,
          )).to.equal(true);
        });
      });

      describe('when only `node.type.name` matches `type`', () => {
        const x = {};
        it('is `true` when `node.type` is an object', () => {
          expect(nodeHasType(
            { type: { name: x } },
            x,
          )).to.equal(true);
        });

        it('is `true` when `node.type` is a function', () => {
          function namedType() {}

          expect(nodeHasType({ type: namedType }, 'namedType')).to.equal(true);
        });
      });

      wrap()
        .withOverride(() => getAdapter(), 'displayNameOfNode', () => sinon.stub())
        .describe('when the adapter has a `displayNameOfNode` function', () => {
          it('is `true` when `displayNameOfNode` matches `type`', () => {
            const stub = getAdapter().displayNameOfNode;
            const sentinel = {};
            stub.returns(sentinel);

            const node = {};
            expect(nodeHasType(node, sentinel)).to.equal(true);

            expect(stub).to.have.property('callCount', 1);
            const { args } = stub.firstCall;
            expect(args).to.eql([node]);
          });

          it('is `false` when `displayNameOfNode` does not match `type`', () => {
            const stub = getAdapter().displayNameOfNode;
            const sentinel = {};
            stub.returns(sentinel);

            const node = {};
            expect(nodeHasType(node, {})).to.equal(false);
          });
        });
    });

  describe('isCustomComponent', () => {
    class TestAdapter extends EnzymeAdapter {
      isCustomComponent() {} // eslint-disable-line class-methods-use-this
    }

    it('delegates to the adapter has method', () => {
      const component = {};
      const result = {};
      const adapter = new TestAdapter();
      sinon.stub(adapter, 'isCustomComponent').returns(result);

      const actual = isCustomComponent(component, adapter);

      expect(actual).to.equal(!!result);

      expect(adapter.isCustomComponent).to.have.property('callCount', 1);
      const [args] = adapter.isCustomComponent.args;
      expect(args).to.eql([component]);
    });

    it('returns "is a function" when adapter lacks method', () => {
      const adapter = new TestAdapter();
      adapter.isCustomComponent = null;

      expect(isCustomComponent({}, adapter)).to.equal(false);
      expect(isCustomComponent(() => {}, adapter)).to.equal(true);
    });

    it('throws without a valid adapter', () => {
      expect(() => isCustomComponent({})).to.throw(Error);
      expect(() => isCustomComponent({}, null)).to.throw(Error);
      expect(() => isCustomComponent({}, false)).to.throw(Error);
      expect(() => isCustomComponent({}, {})).to.throw(Error);
    });
  });
});
