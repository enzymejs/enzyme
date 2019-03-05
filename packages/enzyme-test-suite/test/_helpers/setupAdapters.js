const Enzyme = require('enzyme');
const wrap = require('mocha-wrap');
// eslint-disable-next-line prefer-destructuring
const resetWarningCache = require('prop-types').checkPropTypes.resetWarningCache;

const Adapter = require('./adapter');

Enzyme.configure({ adapter: new Adapter() });

const origWarn = console.warn;
const origError = console.error;
wrap.register(function withConsoleThrows() {
  return this.withOverrides(() => console, () => ({
    error(msg) {
      origError.apply(console, arguments); // eslint-disable-line prefer-rest-params
      throw new EvalError(msg);
    },
    warn(msg) {
      origWarn.apply(console, arguments); // eslint-disable-line prefer-rest-params
      throw new EvalError(msg);
    },
  })).extend('with console throws', {
    beforeEach() {
      resetWarningCache();
    },
    afterEach() {
      resetWarningCache();
    },
  });
});
