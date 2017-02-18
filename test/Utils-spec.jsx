/* globals window */

import React from 'react';
import { expect } from 'chai';

import { describeWithDOM, describeIf } from './_helpers';
import { mount } from '../src';
import {
  coercePropValue,
  getNode,
  nodeEqual,
  nodeMatches,
  isPseudoClassSelector,
  propFromEvent,
  SELECTOR,
  selectorType,
  mapNativeEventNames,
  displayNameOfNode,
} from '../src/Utils';
import { REACT013 } from '../src/version';

describe('Utils', () => {

  describeWithDOM('getNode', () => {
    it('should return a DOMNode when a DOMComponent is given', () => {
      const div = mount(<div />).getNode();
      expect(getNode(div)).to.be.instanceOf(window.HTMLElement);
    });

    it('should return the component when a component is given', () => {
      class Foo extends React.Component {
        render() { return <div />; }
      }
      const foo = mount(<Foo />).getNode();
      expect(getNode(foo)).to.equal(foo);
    });

    describeIf(!REACT013, 'stateless function components', () => {
      it('should return the component when a component is given', () => {
        const Foo = () => <div />;
        const foo = mount(<Foo />).getNode();
        expect(getNode(foo)).to.equal(foo);
      });
    });
  });

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


  describe('isPseudoClassSelector', () => {
    describe('prohibited selectors', () => {
      function isNotPseudo(selector) {
        it(selector, () => {
          expect(isPseudoClassSelector(selector)).to.equal(false);
        });
      }
      isNotPseudo('.foo');
      isNotPseudo('div');
      isNotPseudo('.foo .bar');
      isNotPseudo('[hover]');
      isNotPseudo('[checked=""]');
      isNotPseudo('[checked=":checked"]');
      isNotPseudo('[checked=\':checked\']');
      isNotPseudo('.foo>.bar');
      isNotPseudo('.foo > .bar');
      isNotPseudo('.foo~.bar');
      isNotPseudo('#foo');
    });

    describe('allowed selectors', () => {
      function isPseudo(selector) {
        it(selector, () => {
          expect(isPseudoClassSelector(selector)).to.equal(true);
        });
      }
      isPseudo(':checked');
      isPseudo(':focus');
      isPseudo(':hover');
      isPseudo(':disabled');
      isPseudo(':any');
      isPseudo(':last-child');
      isPseudo(':nth-child(1)');
      isPseudo('div:checked');
      isPseudo('[data-foo=":hover"]:hover');
    });
  });

  describe('selectorType', () => {
    it('returns CLASS_TYPE for a prefixed .', () => {
      const type = selectorType('.foo');

      expect(type).to.be.equal(SELECTOR.CLASS_TYPE);
    });

    it('returns ID_TYPE for a prefixed #', () => {
      const type = selectorType('#foo');

      expect(type).to.be.equal(SELECTOR.ID_TYPE);
    });

    it('returns PROP_TYPE for []', () => {
      function isProp(selector) {
        expect(selectorType(selector)).to.be.equal(SELECTOR.PROP_TYPE);
      }

      isProp('[foo]');
      isProp('[foo="bar"]');
    });
  });

  describe('coercePropValue', () => {
    const key = 'foo';
    it('returns undefined if passed undefined', () => {
      expect(coercePropValue(key, undefined)).to.equal(undefined);
    });

    it('returns number if passed a stringified number', () => {
      expect(coercePropValue(key, '1')).to.be.equal(1);
      expect(coercePropValue(key, '0')).to.be.equal(0);
    });

    it('returns a boolean if passed a stringified bool', () => {
      expect(coercePropValue(key, 'true')).to.equal(true);
      expect(coercePropValue(key, 'false')).to.equal(false);
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

});
