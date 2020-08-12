/* eslint global-require: 0, import/no-extraneous-dependencies: 0, import/no-unresolved: 0 */
/**
 * This file is needed only because we run our unit tests on multiple
 * versions of React at a time. This file basically figures out which
 * version of React is loaded, and exports the correct adapter for configuring.
 */
const { is } = require('./version');

let Adapter = null;

if (process.env.ADAPTER) {
  // eslint-disable-next-line import/no-dynamic-require
  Adapter = require(`enzyme-adapter-react-${process.env.ADAPTER}`);
} else if (is('^0.13')) {
  Adapter = require('enzyme-adapter-react-13');
} else if (is('^0.14')) {
  Adapter = require('enzyme-adapter-react-14');
} else if (is('^15.5')) {
  Adapter = require('enzyme-adapter-react-15');
} else if (is('^15') && is('< 15.5')) {
  Adapter = require('enzyme-adapter-react-15.4');
} else if (is('~16.0.0-0 || ~16.1')) {
  Adapter = require('enzyme-adapter-react-16.1');
} else if (is('~16.2')) {
  Adapter = require('enzyme-adapter-react-16.2');
} else if (is('~16.3.0-0')) {
  Adapter = require('enzyme-adapter-react-16.3');
} else if (is('^16.4.0-0')) {
  Adapter = require('enzyme-adapter-react-16');
} else if (is('^17')) {
  Adapter = require('enzyme-adapter-react-17');
}

module.exports = Adapter;
