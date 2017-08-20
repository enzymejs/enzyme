/* eslint no-use-before-define:0 */
import isEqual from 'lodash/isEqual';
import is from 'object-is';
import uuidv4 from 'uuid/v4';
import entries from 'object.entries';
import functionName from 'function.prototype.name';
import configuration from './configuration';
import validateAdapter from './validateAdapter';

export const ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;

export function getAdapter(options = {}) {
  if (options.adapter) {
    validateAdapter(options.adapter);
    return options.adapter;
  }
  const adapter = configuration.get().adapter;
  validateAdapter(adapter);
  return adapter;
}

export function isCustomComponentElement(inst, adapter) {
  return !!inst && adapter.isValidElement(inst) && typeof inst.type === 'function';
}

function propsOfNode(node) {
  return (node && node.props) || {};
}

export function typeOfNode(node) {
  return node ? node.type : null;
}

export function nodeHasType(node, type) {
  if (!type || !node) return false;
  if (!node.type) return false;
  if (typeof node.type === 'string') return node.type === type;
  return (typeof node.type === 'function' ?
    functionName(node.type) === type : node.type.name === type) || node.type.displayName === type;
}

function internalChildrenCompare(a, b, lenComp, isLoose) {
  const nodeCompare = isLoose ? nodeMatches : nodeEqual;

  if (a === b) return true;
  if (!Array.isArray(a) && !Array.isArray(b)) {
    return nodeCompare(a, b, lenComp);
  }
  if (!a && !b) return true;
  if (a.length !== b.length) return false;
  if (a.length === 0 && b.length === 0) return true;
  for (let i = 0; i < a.length; i += 1) {
    if (!nodeCompare(a[i], b[i], lenComp)) return false;
  }
  return true;
}

function childrenMatch(a, b, lenComp) {
  return internalChildrenCompare(a, b, lenComp, true);
}

function childrenEqual(a, b, lenComp) {
  return internalChildrenCompare(a, b, lenComp, false);
}

function removeNullaryReducer(acc, [key, value]) {
  const addition = value == null ? {} : { [key]: value };
  return { ...acc, ...addition };
}

function internalNodeCompare(a, b, lenComp, isLoose) {
  if (a === b) return true;
  if (!a || !b) return false;
  if (a.type !== b.type) return false;

  let left = propsOfNode(a);
  let right = propsOfNode(b);
  if (isLoose) {
    left = entries(left).reduce(removeNullaryReducer, {});
    right = entries(right).reduce(removeNullaryReducer, {});
  }

  const leftKeys = Object.keys(left);
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
  const childCompare = isLoose ? childrenMatch : childrenEqual;
  if (leftHasChildren || rightHasChildren) {
    if (!childCompare(
      childrenToSimplifiedArray(left.children),
      childrenToSimplifiedArray(right.children),
      lenComp,
    )) {
      return false;
    }
  }

  if (!isTextualNode(a)) {
    const rightKeys = Object.keys(right);
    return lenComp(leftKeys.length - leftHasChildren, rightKeys.length - rightHasChildren);
  }

  return false;
}

export function nodeMatches(a, b, lenComp = is) {
  return internalNodeCompare(a, b, lenComp, true);
}

export function nodeEqual(a, b, lenComp = is) {
  return internalNodeCompare(a, b, lenComp, false);
}

export function containsChildrenSubArray(match, node, subArray) {
  const children = childrenOfNode(node);
  const checker = (_, i) => arraysEqual(match, children.slice(i, i + subArray.length), subArray);
  return children.some(checker);
}

function arraysEqual(match, left, right) {
  return left.length === right.length && left.every((el, i) => match(el, right[i]));
}

function childrenToArray(children) {
  const result = [];

  const push = (el) => {
    if (el === null || el === false || el === undefined) return;
    result.push(el);
  };

  if (Array.isArray(children)) {
    children.forEach(push);
  } else {
    push(children);
  }
  return result;
}

export function childrenToSimplifiedArray(nodeChildren) {
  const childrenArray = childrenToArray(nodeChildren);
  const simplifiedArray = [];

  for (let i = 0; i < childrenArray.length; i += 1) {
    const child = childrenArray[i];
    const previousChild = simplifiedArray.pop();

    if (previousChild === undefined) {
      simplifiedArray.push(child);
    } else if (isTextualNode(child) && isTextualNode(previousChild)) {
      simplifiedArray.push(previousChild + child);
    } else {
      simplifiedArray.push(previousChild);
      simplifiedArray.push(child);
    }
  }

  return simplifiedArray;
}

function childrenOfNode(node) {
  const props = propsOfNode(node);
  const { children } = props;
  return childrenToArray(children);
}

function isTextualNode(node) {
  return typeof node === 'string' || typeof node === 'number';
}

export function isReactElementAlike(arg, adapter) {
  return adapter.isValidElement(arg) || isTextualNode(arg) || Array.isArray(arg);
}

// TODO(lmr): can we get rid of this outside of the adapter?
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
    // This works around a bug in node/jest in that developers aren't able to
    // delete things from global when running in a node vm.
    global.document = undefined;
    delete global.document;
  }
}

export function splitSelector(selector) {
  // step 1: make a map of all quoted strings with a uuid
  const quotedSegments = selector.split(/[^" ]+|("[^"]*")|.*/g)
    .filter(Boolean)
    .reduce((obj, match) => ({ ...obj, [match]: uuidv4() }), {});

  const splits = selector
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

  if (splits.length === 1 && splits[0] === selector) {
    // splitSelector expects selector to be "splittable"
    throw new TypeError('Enzyme::Selector received what appears to be a malformed string selector');
  }

  return splits;
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

function selectorError(selector, type = '') {
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

export function displayNameOfNode(node) {
  const { type } = node;

  if (!type) return null;

  return type.displayName || (typeof type === 'function' ? functionName(type) : type.name || type);
}

export function sym(s) {
  return typeof Symbol === 'function' ? Symbol.for(`enzyme.${s}`) : s;
}

export function privateSet(obj, prop, value) {
  Object.defineProperty(obj, prop, {
    value,
    enumerable: false,
    writable: true,
  });
}

export function cloneElement(adapter, el, props) {
  return adapter.createElement(
    el.type,
    { ...el.props, ...props },
  );
}
