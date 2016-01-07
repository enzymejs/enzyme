export function describeWithDOM(a, b) {
  describe('(uses jsdom)', () => {
    if (global.document) {
      describe(a, b);
    } else {
      // if jsdom isn't available, skip every test in this describe context
      describe.skip(a, b);
    }
  });
}

/**
 * Simple wrapper around mocha describe which allows a boolean to be passed in first which
 * determines whether or not the test will be run
 */
export function describeIf(test, a, b) {
  if (test) {
    describe(a, b);
  } else {
    describe.skip(a, b);
  }
}

/**
 * Simple wrapper around mocha it which allows a boolean to be passed in first which
 * determines whether or not the test will be run
 */
export function itIf(test, a, b) {
  if (test) {
    it(a, b);
  } else {
    it.skip(a, b);
  }
}
