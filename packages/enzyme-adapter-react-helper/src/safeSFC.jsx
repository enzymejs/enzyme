import React from 'react';
import gOPDs from 'object.getownpropertydescriptors';

import ifReact from './ifReact';

function assertFunction(fn) {
  if (typeof fn !== 'function') {
    throw new TypeError('Component must be a function');
  }
  return fn;
}

function safeSFC(fn) {
  assertFunction(fn);

  class SafeSFC extends React.Component {
    render() {
      return fn(this.props, this.context);
    }
  }
  SafeSFC.displayName = fn.displayName || fn.name;
  const {
    prototype: oldProto,
    ...descriptors
  } = gOPDs(fn);
  Object.defineProperties(SafeSFC, descriptors);
  return SafeSFC;
}

export default ifReact('>= 0.14', assertFunction, safeSFC);
