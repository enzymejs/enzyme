import { isEqual } from 'underscore';
import React from 'react/addons';
const {
  Simulate,
  mockComponent,
  isElement,
  isElementOfType,
  isDOMComponent,
  isCompositeComponent,
  } = React.addons.TestUtils;

export function onPrototype(Component, lifecycle, method) {
  let proto = Component.prototype;
  Object.getOwnPropertyNames(proto).forEach((name) => {
    if (typeof proto[name] !== "function") return;
    switch (name) {
      case "componentDidMount":
      case "componentWillMount":
      case "componentDidUnmount":
      case "componentWillUnmount":
      case "componentWillReceiveProps":
      case "componentDidUpdate":
      case "componentWillUpdate":
      case "shouldComponentUpdate":
      case "render":
        if (lifecycle) lifecycle(proto, name);
        break;
      case "constructor":
        // don't spy on the constructor, even though it shows up in the prototype
        break;
      default:
        if (method) method(proto, name);
        break;
    }
  });
}

export function getNode(node) {
  return isDOMComponent(node) ? React.findDOMNode(node) : node;
}

export function childrenEqual(a, b) {
  if (a === b) return true;
  if (!Array.isArray(a) && !Array.isArray(b)) {
    return nodeEqual(a, b);
  }
  if (!a && !b) return true;
  if (a.length !== b.length) return false;
  if (a.length === 0 && b.length === 0) return true;
  for (var i = 0; i < a.length; i++) {
    if (!nodeEqual(a[i], b[i])) return false;
  }
  return true;
}

export function nodeEqual(a, b) {
  if (a === b) return true;
  if (!a || !b) return false;
  if (a.type !== b.type) return false;
  var aLength = 0;
  var bLength = 0;
  var prop;
  a = a._store.props;
  b = b._store.props;
  for (prop in a) {
    if (!a.hasOwnProperty(prop)) continue;
    aLength++;
    if (!(prop in b)) return false;
    if (prop === "children") {
      if (!childrenEqual(a.children, b.children)) return false;
    } else if (b[prop] === a[prop]) {
      // continue;
    } else if (typeof b[prop] === typeof a[prop] && typeof a[prop] === "object") {
      if (!isEqual(a[prop], b[prop])) return false;
    } else {
      return false;
    }
  }
  for (prop in b) {
    if (!b.hasOwnProperty(prop)) continue;
    bLength++;
  }
  return aLength === bLength;
}

// 'click' => 'onClick'
// 'mouseEnter' => 'onMouseEnter'
export function propFromEvent(event) {
  return `on${event[0].toUpperCase()}${event.substring(1)}`;
}

export function withSetStateAllowed(fn) {
  // NOTE(lmr):
  // this is currently here to circumvent a React bug where `setState()` is
  // not allowed without global being defined.
  let cleanup = false;
  if (typeof global.document === 'undefined') {
    cleanup = true;
    global.document = {};
  }
  fn();
  if (cleanup) {
    delete global.document;
  }
}
