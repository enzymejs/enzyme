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

export function children(node) {
  const maybeArray = node && node._store && node._store.props && node._store.props.children;
  if (!maybeArray) return [];
  if (Array.isArray(maybeArray)) return maybeArray;
  return [maybeArray];
}

export function hasClassName(node, className) {
  var classes = node && node._store && node._store.props && node._store.props.className || '';
  return (
      ' ' + classes + ' '
    ).indexOf(' ' + className + ' ') > -1;
}

export function treeForEach(tree, fn) {
  fn(tree);
  children(tree).forEach(node => treeForEach(node, fn));
}

export function treeFilter(tree, fn) {
  var results = [];
  treeForEach(tree, node => {
    if (fn(node)) {
      results.push(node);
    }
  });
  return results;
}

export function single(array) {
  if (array.length !== 1) {
    throw new Error(`Expected single element but found ${array.length} instead`);
  }
  return array[0];
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
  if (a.type !== b.type) return false;
  var aLength = 0;
  var bLength = 0;
  var prop;
  a = a._store.props;
  b = b._store.props;
  for (prop in a) {
    if (!a.hasOwnProperty(prop)) continue;
    aLength++;
    if (!(
        prop in b
      )) return false;
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