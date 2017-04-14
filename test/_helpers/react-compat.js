/* eslint
  global-require: 0,
  import/no-mutable-exports: 0,
  import/prefer-default-export: 0,
*/

import { REACT155 } from '../../src/version';

let createClass;

if (REACT155) {
  // eslint-disable-next-line import/no-extraneous-dependencies
  createClass = require('create-react-class');
} else {
  createClass = require('react').createClass;
}

export {
  createClass,
};
