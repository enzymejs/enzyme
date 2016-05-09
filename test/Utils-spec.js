import { describeWithDOM } from './_helpers.js';
import React from 'react';
import { expect } from 'chai';
import { mount } from '../src/';
import {
  coercePropValue,
  getNode,
  nodeEqual,
  isSimpleSelector,
  propFromEvent,
  SELECTOR,
  selectorType,
  mapNativeEventNames,
  displayNameOfNode,
} from '../src/Utils';

describe('Utils', () => {

  describeWithDOM('getNode', () => {

    it('should return a DOMNode when a DOMComponent is given', () => {
      const div = mount(<div />).node;
      expect(getNode(div)).to.be.instanceOf(window.HTMLElement);
    });

    it('should return the component when a component is given', () => {
      class Foo extends React.Component {
        render() { return <div />; }
      }
      const foo = mount(<Foo />).node;
      expect(getNode(foo)).to.equal(foo);
    });

  });

  describe('nodeEqual', () => {

    it('should match empty elements of same tag', () => {

      expect(nodeEqual(
        <div />,
        <div />
      )).to.equal(true);

    });

    it('should not match empty elements of different type', () => {

      expect(nodeEqual(
        <div />,
        <nav />
      )).to.equal(false);

    });

    it('should match basic prop types', () => {

      expect(nodeEqual(
        <div className="foo" />,
        <div className="foo" />
      )).to.equal(true);

      expect(nodeEqual(
        <div id="foo" className="bar" />,
        <div id="foo" className="bar" />
      )).to.equal(true);

      expect(nodeEqual(
        <div id="foo" className="baz" />,
        <div id="foo" className="bar" />
      )).to.equal(false);

    });

    it('should check children as well', () => {

      expect(nodeEqual(
        <div>
          <div />
        </div>,
        <div />
      )).to.equal(false);

      expect(nodeEqual(
        <div>
          <div />
        </div>,
        <div>
          <div />
        </div>
      )).to.equal(true);

      expect(nodeEqual(
        <div>
          <div className="foo" />
        </div>,
        <div>
          <div className="foo" />
        </div>
      )).to.equal(true);

      expect(nodeEqual(
        <div>
          <div className="foo" />
        </div>,
        <div>
          <div />
        </div>
      )).to.equal(false);

    });

    it('should test deepEquality with object props', () => {

      expect(nodeEqual(
        <div foo={{ a: 1, b: 2 }} />,
        <div foo={{ a: 1, b: 2 }} />
      )).to.equal(true);

      expect(nodeEqual(
        <div foo={{ a: 2, b: 2 }} />,
        <div foo={{ a: 1, b: 2 }} />
      )).to.equal(false);

    });

    describe('children props', () => {
      it('should match equal nodes', () => {
        expect(nodeEqual(
          <div>child</div>,
          <div>child</div>
        )).to.equal(true);
      });

      it('should not match not equal nodes', () => {
        expect(nodeEqual(
          <div>child</div>,
          <div></div>
        )).to.equal(false);

        expect(nodeEqual(
          <div></div>,
          <div>child</div>
        )).to.equal(false);
      });

      it('should skip null children', () => {
        expect(nodeEqual(
          <div>{null}</div>,
          <div></div>
        )).to.equal(true);
      });

      it('should skip undefined children', () => {
        expect(nodeEqual(
          <div>{undefined}</div>,
          <div></div>
        )).to.equal(true);
      });

      it('should skip empty children', () => {
        expect(nodeEqual(
          <div>{[]}</div>,
          <div></div>
        )).to.equal(true);
      });

      it('should skip array of null children', () => {
        expect(nodeEqual(
          <div>{[null, null, null]}</div>,
          <div></div>
        )).to.equal(true);
      });

    });

    describe('basic props and children mixed', () => {

      it('should match equal nodes', () => {
        expect(nodeEqual(
          <div className="foo">child</div>,
          <div className="foo">child</div>
        )).to.equal(true);
      });

      it('should not match when basic props are not equal', () => {
        expect(nodeEqual(
          <div className="foo">child</div>,
          <div className="bar">child</div>
        )).to.equal(false);

        expect(nodeEqual(
          <div children="child" className="foo" />,
          <div children="child" className="bar" />
        )).to.equal(false);
      });

      it('should not match when children are not equal', () => {
        expect(nodeEqual(
          <div className="foo">child</div>,
          <div className="foo">other child</div>
        )).to.equal(false);

        expect(nodeEqual(
          <div children="child" className="foo" />,
          <div children="other child" className="foo" />
        )).to.equal(false);
      });

      it('should match nodes when children are different but falsy', () => {
        expect(nodeEqual(
          <div className="foo">{null}</div>,
          <div className="foo" />
        )).to.equal(true);

        expect(nodeEqual(
          <div children={null} className="foo" />,
          <div className="foo" />
        )).to.equal(true);
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


  describe('isSimpleSelector', () => {

    describe('prohibited selectors', () => {
      function isComplex(selector) {
        it(selector, () => {
          expect(isSimpleSelector(selector)).to.equal(false);
        });
      }

      isComplex('.foo .bar');
      isComplex(':visible');
      isComplex('.foo>.bar');
      isComplex('.foo > .bar');
      isComplex('.foo~.bar');

    });

    describe('allowed selectors', () => {
      function isSimple(selector) {
        it(selector, () => {
          expect(isSimpleSelector(selector)).to.equal(true);
        });
      }

      isSimple('.foo');
      isSimple('.foo-and-foo');
      isSimple('input[foo="bar"]');
      isSimple('input[foo="bar"][bar="baz"][baz="foo"]');
      isSimple('.FoOaNdFoO');
      isSimple('tag');
      isSimple('.foo.bar');
      isSimple('input.foo');

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
    });

    describe('given a node without displayName', () => {
      it('should return the name', () => {
        class Foo extends React.Component {
          render() { return <div />; }
        }

        expect(displayNameOfNode(<Foo />)).to.equal('Foo');
      });
    });

    describe('given a DOM node', () => {
      it('should return the type', () => {
        expect(displayNameOfNode(<div />)).to.equal('div');
      });
    });
  });

});
