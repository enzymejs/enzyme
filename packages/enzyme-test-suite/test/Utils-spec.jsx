import React from 'react';
import { expect } from 'chai';
import {
  childrenToSimplifiedArray,
  nodeEqual,
  nodeMatches,
  displayNameOfNode,
} from 'enzyme/build/Utils';
import {
  flatten,
  mapNativeEventNames,
  propFromEvent,
} from 'enzyme-adapter-utils';

import './_helpers/setupAdapters';

import { describeIf } from './_helpers';
import { REACT013 } from './_helpers/version';

describe('Utils', () => {
  describe('nodeEqual', () => {
    it('should match empty elements of same tag', () => {
      expect(nodeEqual(
        <div />,
        <div />,
      )).to.equal(true);
    });

    it('should not match empty elements of different type', () => {
      expect(nodeEqual(
        <div />,
        <nav />,
      )).to.equal(false);
    });

    it('should match basic prop types', () => {
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

    it('should skip undefined props', () => {
      expect(nodeEqual(
        <div id="foo" className={undefined} />,
        <div id="foo" />,
      )).to.equal(true);
    });

    it('should check children as well', () => {
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

    it('should test deepEquality with object props', () => {
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
      it('should match equal nodes', () => {
        expect(nodeEqual(
          <div>child</div>,
          <div>child</div>,
        )).to.equal(true);
      });

      it('should not match not equal nodes', () => {
        expect(nodeEqual(
          <div>child</div>,
          <div />,
        )).to.equal(false);

        expect(nodeEqual(
          <div />,
          <div>child</div>,
        )).to.equal(false);
      });

      it('should match children before and after interpolation', () => {
        expect(nodeEqual(
          <div>{2}{' children'}{<span />} abc {'hey'}</div>,
          <div>2 children<span /> abc hey</div>,
        )).to.equal(true);
      });

      it('should skip null children', () => {
        expect(nodeEqual(
          <div>{null}</div>,
          <div />,
        )).to.equal(true);
      });

      it('should skip undefined children', () => {
        expect(nodeEqual(
          <div>{undefined}</div>,
          <div />,
        )).to.equal(true);
      });

      it('should skip empty children', () => {
        expect(nodeEqual(
          <div>{[]}</div>,
          <div />,
        )).to.equal(true);
      });

      it('should skip array of null children', () => {
        expect(nodeEqual(
          <div>{[null, null, null]}</div>,
          <div />,
        )).to.equal(true);
      });
    });

    describe('basic props and children mixed', () => {
      it('should match equal nodes', () => {
        expect(nodeEqual(
          <div className="foo">child</div>,
          <div className="foo">child</div>,
        )).to.equal(true);
      });

      it('should not match when basic props are not equal', () => {
        expect(nodeEqual(
          <div className="foo">child</div>,
          <div className="bar">child</div>,
        )).to.equal(false);

        expect(nodeEqual(
          <div className="foo">child</div>,
          <div className="bar">child</div>,
        )).to.equal(false);
      });

      it('should not match when children are not equal', () => {
        expect(nodeEqual(
          <div className="foo">child</div>,
          <div className="foo">other child</div>,
        )).to.equal(false);

        expect(nodeEqual(
          <div className="foo">child</div>,
          <div className="foo">other child</div>,
        )).to.equal(false);
      });

      it('should match nodes when children are different but falsy', () => {
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

    it('should match empty elements of same tag, not distinguishing null/undefined/absent', () => {
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

    it('should not match empty elements of different type, not distinguishing null/undefined/absent', () => {
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

    it('should match basic prop types', () => {
      nodesMatchTwoWays({ className: 'foo' }, { className: 'foo' });
      nodesMatchTwoWays({ id: 'foo', className: 'bar' }, { id: 'foo', className: 'bar' });
      nodesDoNotMatchTwoWays({ id: 'foo', className: 'bar' }, { id: 'foo', className: 'baz' });
    });

    it('should check children as well, not distinguishing null/undefined/absent', () => {
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

    it('should test deepEquality with object props', () => {
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
      it('should match equal nodes', () => {
        expect(nodeMatches(
          <div>child</div>,
          <div>child</div>,
        )).to.equal(true);
      });

      it('should not match not equal nodes', () => {
        expect(nodeMatches(
          <div>child</div>,
          <div />,
        )).to.equal(false);

        expect(nodeMatches(
          <div />,
          <div>child</div>,
        )).to.equal(false);
      });

      it('should skip null children', () => {
        expect(nodeMatches(
          <div>{null}</div>,
          <div />,
        )).to.equal(true);
      });

      it('should skip undefined children', () => {
        expect(nodeMatches(
          <div>{undefined}</div>,
          <div />,
        )).to.equal(true);
      });

      it('should skip empty children', () => {
        expect(nodeMatches(
          <div>{[]}</div>,
          <div />,
        )).to.equal(true);
      });

      it('should skip array of null children', () => {
        expect(nodeMatches(
          <div>{[null, null, null]}</div>,
          <div />,
        )).to.equal(true);
      });
    });

    describe('basic props and children mixed', () => {
      it('should match equal nodes', () => {
        expect(nodeMatches(
          <div className="foo">child</div>,
          <div className="foo">child</div>,
        )).to.equal(true);
      });

      it('should not match when basic props are not equal', () => {
        expect(nodeMatches(
          <div className="foo">child</div>,
          <div className="bar">child</div>,
        )).to.equal(false);

        expect(nodeMatches(
          <div className="foo">child</div>,
          <div className="bar">child</div>,
        )).to.equal(false);
      });

      it('should not match when children are not equal', () => {
        expect(nodeMatches(
          <div className="foo">child</div>,
          <div className="foo">other child</div>,
        )).to.equal(false);

        expect(nodeMatches(
          <div className="foo">child</div>,
          <div className="foo">other child</div>,
        )).to.equal(false);
      });

      it('should match nodes when children are different but falsy', () => {
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
    const fn = propFromEvent;

    it('should work', () => {
      expect(fn('click')).to.equal('onClick');
      expect(fn('mouseEnter')).to.equal('onMouseEnter');
    });
  });

  describe('mapNativeEventNames', () => {
    describe('given an event that isn\'t a mapped', () => {
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
  });

  describe('displayNameOfNode', () => {
    describe('given a node with displayName', () => {
      it('should return the displayName', () => {
        class Foo extends React.Component {
          render() { return <div />; }
        }

        Foo.displayName = 'CustomWrapper';

        expect(displayNameOfNode(<Foo />)).to.equal('CustomWrapper');
      });

      describeIf(!REACT013, 'stateless function components', () => {
        it('should return the displayName', () => {
          const Foo = () => <div />;
          Foo.displayName = 'CustomWrapper';

          expect(displayNameOfNode(<Foo />)).to.equal('CustomWrapper');
        });
      });
    });

    describe('given a node without displayName', () => {
      it('should return the name', () => {
        class Foo extends React.Component {
          render() { return <div />; }
        }

        expect(displayNameOfNode(<Foo />)).to.equal('Foo');
      });

      it('should return the name even if it is falsy', () => {
        const makeFoo = () => () => <div />;

        const Foo = makeFoo();

        expect(displayNameOfNode(<Foo />)).to.equal('');
      });

      describeIf(!REACT013, 'stateless function components', () => {
        it('should return the name', () => {
          const Foo = () => <div />;

          expect(displayNameOfNode(<Foo />)).to.equal('Foo');
        });
      });
    });

    describe('given a DOM node', () => {
      it('should return the type', () => {
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

    it('should join string and numerical children as a string', () => {
      const children = [3, 'textual', 'children'];
      const simplified = ['3textualchildren'];
      expectEqualArrays(childrenToSimplifiedArray(children), simplified);
    });

    it('should handle non-textual nodes', () => {
      const children = ['with', 1, <div />, 'other node'];
      const simplified = ['with1', <div />, 'other node'];
      expectEqualArrays(childrenToSimplifiedArray(children), simplified);
    });
  });

  describe('flatten', () => {
    it('should recursively flatten a nested iterable structure', () => {
      const nested = [1, [2, [3, [4]], 5], 6, [7, [8, 9]], 10];
      const flat = flatten(nested);
      expect(flat).to.deep.equal([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });
  });
});
