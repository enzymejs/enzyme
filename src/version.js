/* eslint-disable no-var,object-shorthand */

var React = require('react');

var VERSION = React.version;

module.exports = {
  VERSION: VERSION,
  REACT013: VERSION.slice(0, 4) === '0.13',
  REACT014: VERSION.slice(0, 4) === '0.14',
  REACT15: VERSION.slice(0, 3) === '15.',
};
