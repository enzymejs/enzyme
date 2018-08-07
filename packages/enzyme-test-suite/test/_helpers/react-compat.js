/* eslint
  global-require: 0,
  import/no-mutable-exports: 0,
  import/prefer-default-export: 0,
*/

import { is } from './version';

let createClass;
let renderToString;
let createPortal;
let createContext;
let forwardRef;
let Fragment;
let StrictMode;
let AsyncMode;
let Profiler;

if (is('>=15.5 || ^16.0.0-alpha || ^16.3.0-alpha')) {
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

if (is('^16.0.0-0 || ^16.3.0-0')) {
  ({ createPortal } = require('react-dom'));
} else {
  createPortal = null;
}

if (is('^16.2.0-0')) {
  ({ Fragment } = require('react'));
} else {
  Fragment = null;
}

if (is('^16.3.0-0')) {
  ({
    createContext,
    forwardRef,
    StrictMode,
    unstable_AsyncMode: AsyncMode,
  } = require('react'));
} else {
  createContext = null;
  forwardRef = null;
  StrictMode = null;
  AsyncMode = null;
}

if (is('^16.4.0-0')) {
  ({
    unstable_Profiler: Profiler,
  } = require('react'));
} else {
  Profiler = null;
}

export {
  createClass,
  renderToString,
  createPortal,
  createContext,
  forwardRef,
  Fragment,
  StrictMode,
  AsyncMode,
  Profiler,
};
