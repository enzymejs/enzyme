import React from 'react';
import gOPDs from 'object.getownpropertydescriptors';

import ifReact from './ifReact';

function assertFunction(fn) {
  if (typeof fn !== 'function') {
    throw new TypeError('Component must be a function');
  }
  return fn;
}

function copyStatics(source, target) {
  assertFunction(source);

  // eslint-disable-next-line no-param-reassign
  target.displayName = source.displayName || source.name;
  const {
    prototype: oldProto,
    ...descriptors
  } = gOPDs(source);
  Object.defineProperties(target, descriptors);

  return target;
}

function nullToNoScript(fn) {
  // eslint-disable-next-line prefer-arrow-callback
  return copyStatics(fn, function NullHandler(...args) {
    const element = fn(...args);
    return element === null ? <noscript /> : element;
  });
}

const maybeNullWrapper = ifReact('^0.14', nullToNoScript, assertFunction);

function safeSFC(fn) {
  return copyStatics(fn, class SafeSFC extends React.Component {
    render() {
      return maybeNullWrapper(fn(this.props, this.context));
    }
  });
}

export default ifReact('>= 0.14', maybeNullWrapper, safeSFC);
