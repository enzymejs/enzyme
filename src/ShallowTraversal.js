import React from 'react';
import { isEmpty } from 'underscore';
import isSubset from 'is-subset';
import {
  coercePropValue,
  propsOfNode,
  isSimpleSelector,
  splitSelector,
  selectorError,
  isCompoundSelector,
  selectorType,
  AND,
  SELECTOR,
} from './Utils';


export function childrenOfNode(node) {
  if (!node) return [];
  const maybeArray = propsOfNode(node).children;
  const result = [];
  React.Children.forEach(maybeArray, child => result.push(child));
  return result;
}

export function hasClassName(node, className) {
  const classes = propsOfNode(node).className || '';
  return ` ${classes} `.indexOf(` ${className} `) > -1;
}

export function treeForEach(tree, fn) {
  if (tree !== null && tree !== false) {
    fn(tree);
  }
  childrenOfNode(tree).forEach(node => treeForEach(node, fn));
}

export function treeFilter(tree, fn) {
  const results = [];
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
    const current = queue.pop();
    const children = childrenOfNode(current);

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
  return propsOfNode(node).id === id;
}


export function nodeHasProperty(node, propKey, stringifiedPropValue) {
  const nodeProps = propsOfNode(node);
  const propValue = coercePropValue(propKey, stringifiedPropValue);
  const nodePropValue = nodeProps[propKey];

  if (nodePropValue === undefined) {
    return false;
  }

  if (propValue) {
    return nodePropValue === propValue;
  }

  return nodeProps.hasOwnProperty(propKey);
}


export function nodeHasType(node, type) {
  if (!type || !node) return false;
  if (!node.type) return false;
  if (typeof node.type === 'string') return node.type === type;
  return node.type.name === type || node.type.displayName === type;
}

export function nodeMatchesObjectProps(node, props) {
  return isSubset(propsOfNode(node), props);
}

export function buildPredicate(selector) {
  switch (typeof selector) {
    case 'function':
      // selector is a component constructor
      return node => node && node.type === selector;

    case 'string':
      if (!isSimpleSelector(selector)) {
        throw selectorError(selector);
      }
      if (isCompoundSelector.test(selector)) {
        return AND(splitSelector(selector).map(buildPredicate));
      }

      switch (selectorType(selector)) {
        case SELECTOR.CLASS_TYPE:
          return node => hasClassName(node, selector.substr(1));

        case SELECTOR.ID_TYPE:
          return node => nodeHasId(node, selector.substr(1));

        case SELECTOR.PROP_TYPE:
          const propKey = selector.split(/\[([a-zA-Z\-]*?)(=|\])/)[1];
          const propValue = selector.split(/=(.*?)\]/)[1];

          return node => nodeHasProperty(node, propKey, propValue);
        default:
          // selector is a string. match to DOM tag or constructor displayName
          return node => nodeHasType(node, selector);
      }
      break;

    case 'object':
      if (!Array.isArray(selector) && selector !== null && !isEmpty(selector)) {
        return node => nodeMatchesObjectProps(node, selector);
      }
      throw new TypeError(
        'Enzyme::Selector does not support an array, null, or empty object as a selector'
      );

    default:
      throw new TypeError(`Enzyme::Selector expects a string, object, or Component Constructor`);
  }
}


export function getTextFromNode(node) {
  if (node === null || node === undefined) {
    return '';
  }

  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }

  if (node.type && typeof node.type === 'function') {
    return `<${node.type.name || node.type.displayName} />`;
  }

  return childrenOfNode(node).map(getTextFromNode).join('').replace(/\s+/, ' ');
}
