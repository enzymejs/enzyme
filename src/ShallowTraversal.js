import React from 'react';
import isEmpty from 'lodash/isEmpty';
import isSubset from 'is-subset';
import {
  coercePropValue,
  propsOfNode,
  splitSelector,
  isCompoundSelector,
  selectorType,
  AND,
  SELECTOR,
  nodeHasType,
} from './Utils';


export function childrenOfNode(node) {
  if (!node) return [];
  const maybeArray = propsOfNode(node).children;
  const result = [];
  React.Children.forEach(maybeArray, child => {
    if (child !== null && child !== false && typeof child !== 'undefined') {
      result.push(child);
    }
  });
  return result;
}

export function hasClassName(node, className) {
  let classes = propsOfNode(node).className || '';
  classes = String(classes).replace(/\s/g, ' ');
  return ` ${classes} `.indexOf(` ${className} `) > -1;
}

export function treeForEach(tree, fn) {
  if (tree !== null && tree !== false && typeof tree !== 'undefined') {
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

function pathFilter(path, fn) {
  return path.filter(tree => treeFilter(tree, fn).length !== 0);
}

export function pathToNode(node, root) {
  const queue = [root];
  const path = [];

  const hasNode = (testNode) => node === testNode;

  while (queue.length) {
    const current = queue.pop();
    const children = childrenOfNode(current);
    if (current === node) return pathFilter(path, hasNode);

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
  const descriptor = Object.getOwnPropertyDescriptor(nodeProps, propKey);
  if (descriptor && descriptor.get) {
    return false;
  }
  const nodePropValue = nodeProps[propKey];

  if (nodePropValue === undefined) {
    return false;
  }

  if (propValue) {
    return nodePropValue === propValue;
  }

  return nodeProps.hasOwnProperty(propKey);
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
      if (isCompoundSelector.test(selector)) {
        return AND(splitSelector(selector).map(buildPredicate));
      }

      switch (selectorType(selector)) {
        case SELECTOR.CLASS_TYPE:
          return node => hasClassName(node, selector.substr(1));

        case SELECTOR.ID_TYPE:
          return node => nodeHasId(node, selector.substr(1));

        case SELECTOR.PROP_TYPE: {
          const propKey = selector.split(/\[([a-zA-Z\-]*?)(=|\])/)[1];
          const propValue = selector.split(/=(.*?)\]/)[1];

          return node => nodeHasProperty(node, propKey, propValue);
        }
        default:
          // selector is a string. match to DOM tag or constructor displayName
          return node => nodeHasType(node, selector);
      }

    case 'object':
      if (!Array.isArray(selector) && selector !== null && !isEmpty(selector)) {
        return node => nodeMatchesObjectProps(node, selector);
      }
      throw new TypeError(
        'Enzyme::Selector does not support an array, null, or empty object as a selector'
      );

    default:
      throw new TypeError('Enzyme::Selector expects a string, object, or Component Constructor');
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
    return `<${node.type.displayName || node.type.name} />`;
  }

  return childrenOfNode(node).map(getTextFromNode)
    .join('')
    .replace(/\s+/, ' ');
}
