/* eslint global-require: 0, import/no-extraneous-dependencies: 0, import/no-unresolved: 0 */
/**
 * This file is needed only because we run our unit tests on multiple
 * versions of React at a time. This file basically figures out which
 * version of React is loaded, and configures enzyme to use the right
 * corresponding adapter.
 */
const Version = require('./version');
const Enzyme = require('enzyme');

let Adapter = null;

if (Version.REACT013) {
  Adapter = require('enzyme-adapter-react-13');
} else if (Version.REACT014) {
  Adapter = require('enzyme-adapter-react-14');
} else if (Version.REACT155) {
  Adapter = require('enzyme-adapter-react-15');
} else if (Version.REACT15) {
  Adapter = require('enzyme-adapter-react-15.4');
} else if (Version.REACT16) {
  Adapter = require('enzyme-adapter-react-16');
}

Enzyme.configure({ adapter: new Adapter() });
