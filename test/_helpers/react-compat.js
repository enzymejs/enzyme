/* eslint
  global-require: 0,
  import/no-mutable-exports: 0,
  import/prefer-default-export: 0,
*/

import { is } from './version';

let createClass;

if (is('>=15.5 || ^16.0.0-alpha')) {
  // eslint-disable-next-line import/no-extraneous-dependencies
  createClass = require('create-react-class');
} else {
  createClass = require('react').createClass;
}

export {
  createClass,
};
