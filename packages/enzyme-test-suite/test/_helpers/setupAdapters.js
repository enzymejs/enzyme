const util = require('util');
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
      /* eslint prefer-rest-params: 1 */
      origError.apply(console, arguments);
      throw new EvalError(arguments.length > 1 ? util.format.apply(util, arguments) : msg);
    },
    warn(msg) {
      /* eslint prefer-rest-params: 1, prefer-spread: 1 */
      origWarn.apply(console, arguments);
      throw new EvalError(arguments.length > 1 ? util.format.apply(util, arguments) : msg);
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
