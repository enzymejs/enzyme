import React from 'react/addons';
import {
  nodeEqual,
  isSimpleSelector,
  splitSelector,
  selectorError,
  isCompoundSelector,
  AND,
} from './Utils';
const {
  findDOMNode,
} = React;
const {
  isDOMComponent,
  isCompositeComponent,
  isCompositeComponentElement,
  isCompositeComponentWithType,
  findAllInRenderedTree,
} = React.addons.TestUtils;

function getNode(inst) {
  if (!inst || inst._store || typeof inst === 'string') {
    return inst;
  }
  if (inst._currentElement) {
    return inst._currentElement;
  }
  if (internalInstance(inst)) {
    return internalInstance(inst)._currentElement;
  }
  return inst;
}

export function instEqual(a, b) {
  return nodeEqual(getNode(a), getNode(b));
}

export function childrenOfInst(inst) {
  if (!inst) {
    return [];
  }
  if (!inst.getPublicInstance) {
    const internal = internalInstance(inst);
    if (internal) return childrenOfInst(internal);

    console.log("childrenOfInst: falsy instance or no getPublicInstance method");
    console.log(inst);
    return [];
  }
  const publicInst = inst.getPublicInstance();
  if (isDOMComponent(publicInst)) {
    const children = [];
    const renderedChildren = inst._renderedComponent._renderedChildren;
    var key;
    for (key in renderedChildren) {
      if (!renderedChildren.hasOwnProperty(key)) {
        continue;
      }
      if (!renderedChildren[key].getPublicInstance) {
        continue;
      }
      children.push(renderedChildren[key].getPublicInstance());
    }
    return children;
  } else if (isCompositeComponent(publicInst)) {
    return childrenOfInst(inst._renderedComponent);
  } else {
    console.log("childrenOfInst: neither DOMComponent or CompositeComponent");
    console.log(inst);
    return [];
  }
}

export function internalInstance(inst) {
  return inst._reactInternalInstance;
}

export function instHasClassName(inst, className) {
  if (!isDOMComponent(inst)) return false;
  var classes = findDOMNode(inst).className || '';
  return (' ' + classes + ' ').indexOf(' ' + className + ' ') > -1;
}

export function instHasId(inst, id) {
  if (!isDOMComponent(inst)) return false;
  var instId = findDOMNode(inst).id || '';
  return instId === id;
}

export function instHasType(inst, type) {
  switch (typeof type) {
    case 'string':
      return isDOMComponent(inst) &&
        inst.tagName.toUpperCase() === type.toUpperCase();
    case 'function':
      return isCompositeComponentWithType(inst, type);
  }
}

export function pathToNode(node, root) {
  const queue = [root];
  const path = [];

  while (queue.length) {
    let current = queue.pop();
    let children = childrenOfInst(current);

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

export function parentsOfInst(inst, root) {
  return pathToNode(inst, root).reverse();
}

export function buildInstPredicate(selector) {
  switch (typeof selector) {
    case "function":
      // selector is a component constructor
      return inst => instHasType(inst, selector);

    case "string":
      if (!isSimpleSelector(selector)) {
        throw selectorError(selector);
      }
      if (isCompoundSelector.test(selector)) {
        return AND(splitSelector(selector).map(buildInstPredicate));
      }
      if (selector[0] === '.') {
        // selector is a class name
        return inst => instHasClassName(inst, selector.substr(1));
      } else if (selector[0] === '#') {
        // selector is an id name
        return inst => instHasId(inst, selector.substr(1));
      } else {
        // selector is a string. match to DOM tag or constructor displayName
        return inst => instHasType(inst, selector);
      }
    default:
      throw new TypeError("Expecting a string or Component Constructor");
  }
}
