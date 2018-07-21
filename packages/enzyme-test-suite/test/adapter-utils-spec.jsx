import { expect } from 'chai';
import { ensureKeyOrUndefined } from 'enzyme-adapter-utils';

describe('enzyme-adapter-utils', () => {
  describe('ensureKeyOrUndefined', () => {
    it('returns the key if truthy', () => {
      [true, 42, 'foo', [], {}, () => {}].forEach((truthy) => {
        expect(ensureKeyOrUndefined(truthy)).to.equal(truthy);
      });
    });

    it('returns the empty string if the key is the empty string', () => {
      expect(ensureKeyOrUndefined('')).to.equal('');
    });

    it('returns undefined if falsy and not the empty string', () => {
      [null, undefined, false, 0, NaN].forEach((falsy) => {
        expect(ensureKeyOrUndefined(falsy)).to.equal(undefined);
      });
    });
  });
});
