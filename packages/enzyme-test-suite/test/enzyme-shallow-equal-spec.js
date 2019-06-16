import shallowEqual from 'enzyme-shallow-equal';

import { expect } from 'chai';

describe('shallowEqual', () => {
  it('returns true for things that are SameValue', () => {
    [{}, [], NaN, 42, 'foo', '', 0, Infinity, () => {}, /a/g, true, false, null, undefined].forEach((x) => {
      expect(shallowEqual(x, x)).to.equal(true);
    });
  });

  it('returns false if one is falsy and one is truthy', () => {
    [null, undefined, false, 0, NaN].forEach((x) => {
      expect(shallowEqual(true, x)).to.equal(false);
    });
  });

  it('returns true if both have zero keys', () => {
    expect(shallowEqual({}, {})).to.equal(true);
  });

  it('returns false if they have different numbers of keys', () => {
    expect(shallowEqual({ a: 1 }, {})).to.equal(false);
    expect(shallowEqual({}, { a: 1 })).to.equal(false);
  });

  it('returns false if they have the same number, but differently named, keys', () => {
    expect(shallowEqual({ a: 1 }, { b: 1 })).to.equal(false);
  });

  it('returns false if they have the same keys, with different values', () => {
    [{}, [], NaN, 42, 'foo', '', 0, Infinity, () => {}, /a/g, true, false, null, undefined].forEach((x) => {
      expect(shallowEqual({ a: x }, { a: {} })).to.equal(false);
      expect(shallowEqual({ a: {} }, { a: x })).to.equal(false);
    });
  });

  it('returns false if an undefined key in one is absent in the other', () => {
    expect(shallowEqual({ a: undefined, b: true }, { b: true, c: undefined })).to.equal(false);
    expect(shallowEqual({ c: undefined, b: true }, { b: true, a: undefined })).to.equal(false);
  });

  it('returns true if they have the same keys, with the same values', () => {
    [{}, [], NaN, 42, 'foo', '', 0, Infinity, () => {}, /a/g, true, false, null, undefined].forEach((x) => {
      expect(shallowEqual({ a: x }, { a: x })).to.equal(true);
      expect(shallowEqual({ a: x }, { a: x })).to.equal(true);
    });
  });
});
