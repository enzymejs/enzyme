import React from 'react/addons';
import {
  nodeEqual,
} from './Utils';

export function childrenOfNode(node) {
  const maybeArray = node && node._store && node._store.props && node._store.props.children;
  const result = [];
  React.Children.forEach(maybeArray, child => result.push(child));
  return result;
}

export function hasClassName(node, className) {
  var classes = node && node._store && node._store.props && node._store.props.className || '';
  return (' ' + classes + ' ').indexOf(' ' + className + ' ') > -1;
}

export function treeForEach(tree, fn) {
  fn(tree);
  childrenOfNode(tree).forEach(node => treeForEach(node, fn));
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

export function pathToNode(node, root) {
  const queue = [root];
  const path = [];

  while (queue.length) {
    let current = queue.pop();
    let children = childrenOfNode(current);

    if (current === node) return path;

    path.push(current);

    if (children.length === 0) {
      // leaf node. if it isn't the node we are looking for, we pop.
      path.pop();
    }
    queue.push.apply(queue, children);
  }

  return null;
}

export function parentsOfNode(node, root) {
  return pathToNode(node, root).reverse();
}

export function nodeHasId(node, id) {
  const maybeId = node && node._store && node._store.props && node._store.props.id;
  return maybeId === id;
}

export function nodeHasType(node, type) {
  if (!type || !node) return false;
  if (!node.type) return false;
  if (typeof node.type === 'string') return node.type == type;
  return node.type.displayName == type;
}

export function isSimpleSelector(selector) {
  // any of these characters pretty much guarantee it's a complex selector
  if (/[~\s\[\]:>]/.test(selector)) {
    return false;
  }
  return true;
}

export function selectorError(selector) {
  return new TypeError(
    `Catalyst received a complex CSS selector ('${selector}') that it does not currently support`
  );
}

function AND(fns) {
  return x => {
    let i = fns.length;
    while (i--) {
      if (!fns[i](x)) return false;
    }
    return true;
  };
}

export function splitSelector(selector) {
  return selector.split(/(?=\.)/);
}

const isCompoundSelector = /[a-z]\.[a-z]/i;

export function buildPredicate(selector) {
  switch (typeof selector) {
    case "function":
      // selector is a component constructor
      return node => node && node.type === selector;

    case "string":
      if (!isSimpleSelector(selector)) {
        throw selectorError(selector);
      }
      if (isCompoundSelector.test(selector)) {
        return AND(splitSelector(selector).map(buildPredicate));
      }
      if (selector[0] === '.') {
        // selector is a class name
        return node => hasClassName(node, selector.substr(1));
      } else if (selector[0] === '#') {
        // selector is an id name
        return node => nodeHasId(node, selector.substr(1));
      } else {
        // selector is a string. match to DOM tag or constructor displayName
        return node => nodeHasType(node, selector);
      }
    default:
      throw new TypeError("Expecting a string or Component Constructor");
  }
}

export function getTextFromNode(node) {
  if (node === null || node === undefined) {
    return '';
  }

  if (typeof node === 'string' || typeof node === 'number') {
    return '' + node;
  }

  if (node.type && typeof node.type === 'function') {
    return `<${node.type.displayName} />`;
  }

  return childrenOfNode(node).map(getTextFromNode).join('').replace(/\s+/, ' ');
}
