import { REACT155 } from './version';

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
