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

function only(a, b) {
  describe('(uses jsdom)', () => {
    if (typeof jsdom === 'function') {
      jsdom();
      describe.only(a, b);
    } else {
      // if jsdom isn't available, skip every test in this describe context
      describe.skip(a, b);
    }
  });
}

function skip(a, b) {
  describe('(uses jsdom)', () => {
    if (typeof jsdom === 'function') {
      jsdom();
      describe.skip(a, b);
    } else {
      // if jsdom isn't available, skip every test in this describe context
      describe.skip(a, b);
    }
  });
}

describeWithDOM.only = only;
describeWithDOM.skip = skip;
