'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.onPrototype = onPrototype;
exports.getNode = getNode;
exports.children = children;
exports.hasClassName = hasClassName;
exports.treeForEach = treeForEach;
exports.treeFilter = treeFilter;
exports.single = single;
exports.childrenEqual = childrenEqual;
exports.nodeEqual = nodeEqual;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _underscore = require('underscore');

var _reactAddons = require('react/addons');

var _reactAddons2 = _interopRequireDefault(_reactAddons);

var _React$addons$TestUtils = _reactAddons2['default'].addons.TestUtils;
var Simulate = _React$addons$TestUtils.Simulate;
var mockComponent = _React$addons$TestUtils.mockComponent;
var isElement = _React$addons$TestUtils.isElement;
var isElementOfType = _React$addons$TestUtils.isElementOfType;
var isDOMComponent = _React$addons$TestUtils.isDOMComponent;
var isCompositeComponent = _React$addons$TestUtils.isCompositeComponent;

function onPrototype(Component, lifecycle, method) {
  var proto = Component.prototype;
  Object.getOwnPropertyNames(proto).forEach(function (name) {
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

function getNode(node) {
  return isDOMComponent(node) ? _reactAddons2['default'].findDOMNode(node) : node;
}

function children(node) {
  var maybeArray = node && node._store && node._store.props && node._store.props.children;
  if (!maybeArray) return [];
  if (Array.isArray(maybeArray)) return maybeArray;
  return [maybeArray];
}

function hasClassName(node, className) {
  var classes = node._store.props.className || '';
  return (' ' + classes + ' ').indexOf(' ' + className + ' ') > -1;
}

function treeForEach(tree, fn) {
  fn(tree);
  children(tree).forEach(function (node) {
    return treeForEach(node, fn);
  });
}

function treeFilter(tree, fn) {
  var results = [];
  treeForEach(tree, function (node) {
    if (fn(node)) {
      results.push(node);
    }
  });
  return results;
}

function single(array) {
  if (array.length !== 1) {
    throw new Error('Expected single element but found ' + array.length + ' instead');
  }
  return array[0];
}

function childrenEqual(a, b) {
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

function nodeEqual(a, b) {
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
        if (!(0, _underscore.isEqual)(a[prop], b[prop])) return false;
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