/* eslint global-require: 0 */
/**
 * This file is needed only because we run our unit tests on multiple
 * versions of React at a time. This file basically figures out which
 * version of React is loaded, and configures enzyme to use the right
 * corresponding adapter.
 */
const Version = require('./src/version');
const Enzyme = require('./src');

let Adapter = null;

if (Version.REACT013) {
  Adapter = require('./src/adapters/ReactThirteenAdapter');
} else if (Version.REACT014) {
  Adapter = require('./src/adapters/ReactFourteenAdapter');
} else if (Version.REACT155) {
  Adapter = require('./src/adapters/ReactFifteenAdapter');
} else if (Version.REACT15) {
  Adapter = require('./src/adapters/ReactFifteenFourAdapter');
} else if (Version.REACT16) {
  Adapter = require('./src/adapters/ReactSixteenAdapter');
}

Enzyme.configure({ adapter: new Adapter() });
