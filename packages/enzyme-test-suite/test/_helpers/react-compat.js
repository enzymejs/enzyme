/* eslint
  global-require: 0,
  import/no-mutable-exports: 0,
  import/prefer-default-export: 0,
*/

import { is } from './version';

let createClass;
let renderToString;
let createPortal;

if (is('>=15.5 || ^16.0.0-alpha')) {
  // eslint-disable-next-line import/no-extraneous-dependencies
  createClass = require('create-react-class');
} else {
  ({ createClass } = require('react'));
}

if (is('^0.13.0')) {
  renderToString = require('react').renderToStaticMarkup;
} else {
  // eslint-disable-next-line import/no-extraneous-dependencies
  ({ renderToString } = require('react-dom/server'));
}

if (is('^16.0.0-alpha')) {
  ({ createPortal } = require('react-dom'));
} else {
  createPortal = null;
}

export {
  createClass,
  renderToString,
  createPortal,
};
