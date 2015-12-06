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

let jsdom;
try {
  require('jsdom'); // could throw
  jsdom = require('mocha-jsdom');
} catch (e) {
  // jsdom is not supported...
}

export function describeWithDOM(a, b) {
  describe('(uses jsdom)', () => {
    if (typeof jsdom === 'function') {
      jsdom();
      describe(a, b);
    } else {
      // if jsdom isn't available, skip every test in this describe context
      describe.skip(a, b);
    }
  });
}
