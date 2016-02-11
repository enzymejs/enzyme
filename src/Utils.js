/* eslint no-use-before-define:0 */
import { isEqual } from 'underscore';
import {
  isDOMComponent,
  findDOMNode,
  childrenToArray,
} from './react-compat';
import {
  REACT013,
  REACT014,
} from './version';

export function propsOfNode(node) {
  if (REACT013 && node && node._store) {
    return (node._store.props) || {};
  }
  if (node && node._reactInternalComponent && node._reactInternalComponent._currentElement) {
    return (node._reactInternalComponent._currentElement.props) || {};
  }
  return (node && node.props) || {};
}

export function typeOfNode(node) {
  return node ? node.type : null;
}

export function getNode(node) {
  return isDOMComponent(node) ? findDOMNode(node) : node;
}

export function childrenEqual(a, b) {
  if (a === b) return true;
  if (!Array.isArray(a) && !Array.isArray(b)) {
    return nodeEqual(a, b);
  }
  if (!a && !b) return true;
  if (a.length !== b.length) return false;
  if (a.length === 0 && b.length === 0) return true;
  for (let i = 0; i < a.length; i++) {
    if (!nodeEqual(a[i], b[i])) return false;
  }
  return true;
}

export function nodeEqual(a, b) {
  if (a === b) return true;
  if (!a || !b) return false;
  if (a.type !== b.type) return false;
  const left = propsOfNode(a);
  const leftKeys = Object.keys(left);
  const right = propsOfNode(b);
  for (let i = 0; i < leftKeys.length; i++) {
    const prop = leftKeys[i];
    if (!(prop in right)) return false;
    if (prop === 'children') {
      if (!childrenEqual(childrenToArray(left.children), childrenToArray(right.children))) {
        return false;
      }
    } else if (right[prop] === left[prop]) {
      // continue;
    } else if (typeof right[prop] === typeof left[prop] && typeof left[prop] === 'object') {
      if (!isEqual(left[prop], right[prop])) return false;
    } else {
      return false;
    }
  }

  if (typeof a !== 'string' && typeof a !== 'number') {
    return leftKeys.length === Object.keys(right).length;
  }

  return false;
}

export function containsChildrenSubArray(match, node, subArray) {
  const children = childrenOfNode(node);
  return children.some((_, i) => arraysEqual(match, children.slice(i, subArray.length), subArray));
}

function arraysEqual(match, left, right) {
  return left.length === right.length && left.every((el, i) => match(el, right[i]));
}

function childrenOfNode(node) {
  const props = propsOfNode(node);
  const { children } = props;
  return childrenToArray(children);
}


// 'click' => 'onClick'
// 'mouseEnter' => 'onMouseEnter'
export function propFromEvent(event) {
  const nativeEvent = mapNativeEventNames(event);
  return `on${nativeEvent[0].toUpperCase()}${nativeEvent.substring(1)}`;
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
  return selector.split(/(?=\.|\[.*\])/);
}

export function isSimpleSelector(selector) {
  // any of these characters pretty much guarantee it's a complex selector
  return !/[~\s:>]/.test(selector);
}

export function selectorError(selector) {
  return new TypeError(
    `Enzyme received a complex CSS selector ('${selector}') that it does not currently support`
  );
}

export const isCompoundSelector = /([a-z]\.[a-z]|[a-z]\[.*\])/i;

const isPropSelector = /^\[.*\]$/;

export const SELECTOR = {
  CLASS_TYPE: 0,
  ID_TYPE: 1,
  PROP_TYPE: 2,
};

export function selectorType(selector) {
  if (selector[0] === '.') {
    return SELECTOR.CLASS_TYPE;
  } else if (selector[0] === '#') {
    return SELECTOR.ID_TYPE;
  } else if (isPropSelector.test(selector)) {
    return SELECTOR.PROP_TYPE;
  }
}

export function AND(fns) {
  return x => {
    let i = fns.length;
    while (i--) {
      if (!fns[i](x)) return false;
    }
    return true;
  };
}

export function coercePropValue(propName, propValue) {
  // can be undefined
  if (propValue === undefined) {
    return propValue;
  }

  const trimmedValue = propValue.trim();

  // if propValue includes quotes, it should be
  // treated as a string
  if (/^(['"]).*\1$/.test(trimmedValue)) {
    return trimmedValue.slice(1, -1);
  }

  const numericPropValue = +trimmedValue;

  // if parseInt is not NaN, then we've wanted a number
  if (!isNaN(numericPropValue)) {
    return numericPropValue;
  }

  // coerce to boolean
  if (trimmedValue === 'true') return true;
  if (trimmedValue === 'false') return false;

  // user provided an unquoted string value
  throw new TypeError(
    `Enzyme::Unable to parse selector '[${propName}=${propValue}]'. ` +
    `Perhaps you forgot to escape a string? Try '[${propName}="${trimmedValue}"]' instead.`
  );
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
    doubleclick: 'doubleClick',
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

  if (REACT014) {
    // these could not be simulated in React 0.13:
    // https://github.com/facebook/react/issues/1297
    nativeToReactEventMap.mouseenter = 'mouseEnter';
    nativeToReactEventMap.mouseleave = 'mouseLeave';
  }

  return nativeToReactEventMap[event] || event;
}
