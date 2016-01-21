import { expect } from 'chai';
import { describeWithDOM } from '../..';

describe('describeWithDOM', () => {
  describe('.skip()', () => {
    describeWithDOM.skip('will skip tests called with skip', () => {
      it('will not run this test', () => {
        // purposefully failing test that won't be run
        expect(true).to.equal(false);
      });
    });

    describeWithDOM('will still call describeWithDOM tests without .skip', () => {
      it('will run this test', () => {
        expect(true).to.equal(true);
      });
    });
  });
});
