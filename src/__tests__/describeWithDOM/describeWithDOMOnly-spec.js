import { expect } from 'chai';
import { describeWithDOM } from '../..';

describe('describeWithDOM', () => {
  describe('.only()', () => {
    describeWithDOM.only('will skip all tests not called with only', () => {
      it('will run only this test', () => {
        expect(true).to.equal(true);
      });
    });

    describeWithDOM('will not call other tests', () => {
      it('will not run this test', () => {
        // purposefully failing test that won't be called
        expect(true).to.equal(false);
      });
    });
  });
});
