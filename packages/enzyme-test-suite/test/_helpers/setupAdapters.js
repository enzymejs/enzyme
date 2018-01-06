/* eslint global-require: 0, import/no-extraneous-dependencies: 0, import/no-unresolved: 0 */
/**
 * This file is needed only because we run our unit tests on multiple
 * versions of React at a time. This file basically figures out which
 * version of React is loaded, and configures enzyme to use the right
 * corresponding adapter.
 */
const {
  REACT013,
  REACT014,
  REACT15,
  REACT155,
  REACT16,
} = require('./version');
const Enzyme = require('enzyme');

let Adapter = null;

if (REACT013) {
  Adapter = require('enzyme-adapter-react-13');
} else if (REACT014) {
  Adapter = require('enzyme-adapter-react-14');
} else if (REACT155) {
  Adapter = require('enzyme-adapter-react-15');
} else if (REACT15) {
  Adapter = require('enzyme-adapter-react-15.4');
} else if (REACT16) {
  Adapter = require('enzyme-adapter-react-16');
}

Enzyme.configure({ adapter: new Adapter() });
