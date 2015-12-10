let jsdomify;

try {
  jsdomify = require('jsdomify');
  jsdomify.create();
  require('react'); // require react explicitly after jsdomify.create() has been called
  jsdomify.destroy();
} catch (e) {
  // jsdom is not supported
}

export function jsdomSetup() {
  if (!jsdomify) return;
  jsdomify.create();
}

export function jsdomTeardown() {
  if (!jsdomify) return;
  jsdomify.destroy();
}

export function describeWithDOM(a, b) {
  describe('(uses jsdom)', () => {
    if (typeof jsdom === 'function') {
      beforeEach(jsdomSetup);
      afterEach(jsdomTeardown);
      describe(a, b);
    } else {
      // if jsdom isn't available, skip every test in this describe context
      describe.skip(a, b);
    }
  });
}
