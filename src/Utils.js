/* eslint no-use-before-define:0 */
import isEqual from 'lodash/isEqual';
import React from 'react';
import is from 'object-is';
import uuid from 'uuid';
import entries from 'object.entries';
import assign from 'object.assign';
import functionName from 'function.prototype.name';
import {
  isDOMComponent,
  findDOMNode,
  childrenToArray,
} from './react-compat';
import {
  REACT013,
  REACT15,
} from './version';

export const ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;

function internalInstanceKey(node) {
  return Object.keys(Object(node)).filter(key => key.match(/^__reactInternalInstance\$/))[0];
}

export function internalInstance(inst) {
  return inst._reactInternalInstance ||
    inst[internalInstanceKey(inst)];
}

export function isFunctionalComponent(inst) {
  return !!inst && !!inst.constructor && typeof inst.constructor === 'function' &&
    functionName(inst.constructor) === 'StatelessComponent';
}

export function isCustomComponentElement(inst) {
  return !!inst && React.isValidElement(inst) && typeof inst.type === 'function';
}

export function propsOfNode(node) {
  if (REACT013 && node && node._store) {
    return (node._store.props) || {};
  }
  if (node && node._reactInternalComponent && node._reactInternalComponent._currentElement) {
    return (node._reactInternalComponent._currentElement.props) || {};
  }
  if (node && node._currentElement) {
    return (node._currentElement.props) || {};
  }
  if (REACT15 && node) {
    if (internalInstance(node) && internalInstance(node)._currentElement) {
      return (internalInstance(node)._currentElement.props) || {};
    }
  }

  return (node && node.props) || {};
}

export function typeOfNode(node) {
  return node ? node.type : null;
}

export function getNode(node) {
  return isDOMComponent(node) ? findDOMNode(node) : node;
}

export function nodeHasType(node, type) {
  if (!type || !node) return false;
  if (!node.type) return false;
  if (typeof node.type === 'string') return node.type === type;
  return (typeof node.type === 'function' ?
    functionName(node.type) === type : node.type.name === type) || node.type.displayName === type;
}

export function childrenEqual(a, b, lenComp) {
  if (a === b) return true;
  if (!Array.isArray(a) && !Array.isArray(b)) {
    return nodeEqual(a, b, lenComp);
  }
  if (!a && !b) return true;
  if (a.length !== b.length) return false;
  if (a.length === 0 && b.length === 0) return true;
  for (let i = 0; i < a.length; i += 1) {
    if (!nodeEqual(a[i], b[i], lenComp)) return false;
  }
  return true;
}

export function nodeEqual(a, b, lenComp = is) {
  if (a === b) return true;
  if (!a || !b) return false;
  if (a.type !== b.type) return false;
  const left = propsOfNode(a);
  const leftKeys = Object.keys(left);
  const right = propsOfNode(b);
  for (let i = 0; i < leftKeys.length; i += 1) {
    const prop = leftKeys[i];
    // we will check children later
    if (prop === 'children') {
      // continue;
    } else if (!(prop in right)) {
      return false;
    } else if (right[prop] === left[prop]) {
      // continue;
    } else if (typeof right[prop] === typeof left[prop] && typeof left[prop] === 'object') {
      if (!isEqual(left[prop], right[prop])) return false;
    } else {
      return false;
    }
  }

  const leftHasChildren = 'children' in left;
  const rightHasChildren = 'children' in right;
  if (leftHasChildren || rightHasChildren) {
    if (!childrenEqual(
        childrenToArray(left.children),
        childrenToArray(right.children),
        lenComp)) {
      return false;
    }
  }

  if (!isTextualNode(a)) {
    const rightKeys = Object.keys(right);
    return lenComp(leftKeys.length - leftHasChildren, rightKeys.length - rightHasChildren);
  }

  return false;
}

export function containsChildrenSubArray(match, node, subArray) {
  const children = childrenOfNode(node);
  const checker = (_, i) => arraysEqual(match, children.slice(i, i + subArray.length), subArray);
  return children.some(checker);
}

function arraysEqual(match, left, right) {
  return left.length === right.length && left.every((el, i) => match(el, right[i]));
}

function childrenOfNode(node) {
  const props = propsOfNode(node);
  const { children } = props;
  return childrenToArray(children);
}

function isTextualNode(node) {
  return typeof node === 'string' || typeof node === 'number';
}

export function isReactElementAlike(arg) {
  return React.isValidElement(arg) || isTextualNode(arg) || Array.isArray(arg);
}

// 'click' => 'onClick'
// 'mouseEnter' => 'onMouseEnter'
export function propFromEvent(event) {
  const nativeEvent = mapNativeEventNames(event);
  return `on${nativeEvent[0].toUpperCase()}${nativeEvent.slice(1)}`;
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

export function splitSelector(selector) {
  // step 1: make a map of all quoted strings with a uuid
  const quotedSegments = selector.split(/[^" ]+|("[^"]*")|.*/g)
    .filter(Boolean)
    .reduce((obj, match) => assign({}, obj, { [match]: uuid.v4() }), {});

  return selector
    // step 2: replace all quoted strings with the uuid, so we don't have to properly parse them
    .replace(/[^" ]+|("[^"]*")|.*/g, x => quotedSegments[x] || x)
    // step 3: split as best we can without a proper parser
    .split(/(?=\.|\[.*])|(?=#|\[#.*])/)
    // step 4: restore the quoted strings by swapping back the uuid's for the original segments
    .map((selectorSegment) => {
      let restoredSegment = selectorSegment;
      entries(quotedSegments).forEach(([k, v]) => {
        restoredSegment = restoredSegment.replace(v, k);
      });
      return restoredSegment;
    });
}


const containsQuotes = /'|"/;
const containsColon = /:/;


export function isPseudoClassSelector(selector) {
  if (containsColon.test(selector)) {
    if (!containsQuotes.test(selector)) {
      return true;
    }
    const tokens = selector.split(containsQuotes);
    return tokens.some((token, i) =>
      containsColon.test(token) && i % 2 === 0,
    );
  }
  return false;
}

export function selectorError(selector, type = '') {
  return new TypeError(
    `Enzyme received a ${type} CSS selector ('${selector}') that it does not currently support`,
  );
}

export const isCompoundSelector = /^[.#]?-?[_a-z]+[_a-z0-9-]*[.[#]/i;

const isPropSelector = /^\[.*]$/;

export const SELECTOR = {
  CLASS_TYPE: 0,
  ID_TYPE: 1,
  PROP_TYPE: 2,
};

export function selectorType(selector) {
  if (isPseudoClassSelector(selector)) {
    throw selectorError(selector, 'pseudo-class');
  }
  if (selector[0] === '.') {
    return SELECTOR.CLASS_TYPE;
  } else if (selector[0] === '#') {
    return SELECTOR.ID_TYPE;
  } else if (isPropSelector.test(selector)) {
    return SELECTOR.PROP_TYPE;
  }
  return undefined;
}

export function AND(fns) {
  const fnsReversed = fns.slice().reverse();
  return x => fnsReversed.every(fn => fn(x));
}

export function coercePropValue(propName, propValue) {
  // can be undefined
  if (propValue === undefined) {
    return propValue;
  }

  // can be the empty string
  if (propValue === '') {
    return propValue;
  }

  if (propValue === 'NaN') {
    return NaN;
  }

  if (propValue === 'null') {
    return null;
  }

  const trimmedValue = propValue.trim();

  // if propValue includes quotes, it should be
  // treated as a string
  // eslint override pending https://github.com/eslint/eslint/issues/7472
  // eslint-disable-next-line no-useless-escape
  if (/^(['"]).*\1$/.test(trimmedValue)) {
    return trimmedValue.slice(1, -1);
  }

  const numericPropValue = +trimmedValue;

  // if parseInt is not NaN, then we've wanted a number
  if (!is(NaN, numericPropValue)) {
    return numericPropValue;
  }

  // coerce to boolean
  if (trimmedValue === 'true') return true;
  if (trimmedValue === 'false') return false;

  // user provided an unquoted string value
  throw new TypeError(
    `Enzyme::Unable to parse selector '[${propName}=${propValue}]'. ` +
    `Perhaps you forgot to escape a string? Try '[${propName}="${trimmedValue}"]' instead.`,
  );
}

export function nodeHasProperty(node, propKey, stringifiedPropValue) {
  const nodeProps = propsOfNode(node);
  const descriptor = Object.getOwnPropertyDescriptor(nodeProps, propKey);
  if (descriptor && descriptor.get) {
    return false;
  }
  const nodePropValue = nodeProps[propKey];

  const propValue = coercePropValue(propKey, stringifiedPropValue);

  if (nodePropValue === undefined) {
    return false;
  }

  if (propValue !== undefined) {
    return is(nodePropValue, propValue);
  }

  return Object.prototype.hasOwnProperty.call(nodeProps, propKey);
}

export function mapNativeEventNames(event) {
  const nativeToReactEventMap = {
    compositionend: 'compositionEnd',
    compositionstart: 'compositionStart',
    compositionupdate: 'compositionUpdate',
    keydown: 'keyDown',
    keyup: 'keyUp',
    keypress: 'keyPress',
    contextmenu: 'contextMenu',
    dblclick: 'doubleClick',
    doubleclick: 'doubleClick', // kept for legacy. TODO: remove with next major.
    dragend: 'dragEnd',
    dragenter: 'dragEnter',
    dragexist: 'dragExit',
    dragleave: 'dragLeave',
    dragover: 'dragOver',
    dragstart: 'dragStart',
    mousedown: 'mouseDown',
    mousemove: 'mouseMove',
    mouseout: 'mouseOut',
    mouseover: 'mouseOver',
    mouseup: 'mouseUp',
    touchcancel: 'touchCancel',
    touchend: 'touchEnd',
    touchmove: 'touchMove',
    touchstart: 'touchStart',
    canplay: 'canPlay',
    canplaythrough: 'canPlayThrough',
    durationchange: 'durationChange',
    loadeddata: 'loadedData',
    loadedmetadata: 'loadedMetadata',
    loadstart: 'loadStart',
    ratechange: 'rateChange',
    timeupdate: 'timeUpdate',
    volumechange: 'volumeChange',
  };

  if (!REACT013) {
    // these could not be simulated in React 0.13:
    // https://github.com/facebook/react/issues/1297
    nativeToReactEventMap.mouseenter = 'mouseEnter';
    nativeToReactEventMap.mouseleave = 'mouseLeave';
  }

  return nativeToReactEventMap[event] || event;
}

export function displayNameOfNode(node) {
  const { type } = node;

  if (!type) return null;

  return type.displayName || (typeof type === 'function' ? functionName(type) : type.name) || type;
}
