import isEmpty from 'lodash/isEmpty';
import isSubset from 'is-subset';
import {
  internalInstance,
  nodeEqual,
  propsOfNode,
  isFunctionalComponent,
  splitSelector,
  selectorType,
  isCompoundSelector,
  AND,
  SELECTOR,
  nodeHasType,
  nodeHasProperty,
} from './Utils';
import {
  isDOMComponent,
  isCompositeComponent,
  isCompositeComponentWithType,
  isElement,
  findDOMNode,
} from './react-compat';
import { REACT013 } from './version';

export function getNode(inst) {
  if (!inst || inst._store || typeof inst === 'string') {
    return inst;
  }
  if (inst._currentElement) {
    return inst._currentElement;
  }
  if (internalInstance(inst)) {
    return internalInstance(inst)._currentElement;
  }
  if (inst._reactInternalInstance) {
    return inst._reactInternalInstance._currentElement;
  }
  if (inst._reactInternalComponent) {
    return inst._reactInternalComponent._currentElement;
  }
  return inst;
}

export function instEqual(a, b, lenComp) {
  return nodeEqual(getNode(a), getNode(b), lenComp);
}

export function instHasClassName(inst, className) {
  if (!isDOMComponent(inst)) {
    return false;
  }
  const node = findDOMNode(inst);
  if (node.classList) {
    return node.classList.contains(className);
  }
  let classes = node.className || '';
  if (typeof classes === 'object') {
    classes = classes.baseVal;
  }
  classes = classes.replace(/\s/g, ' ');
  return ` ${classes} `.indexOf(` ${className} `) > -1;
}

export function instHasId(inst, id) {
  if (!isDOMComponent(inst)) return false;
  const instId = findDOMNode(inst).id || '';
  return instId === id;
}

function isFunctionalComponentWithType(inst, func) {
  return isFunctionalComponent(inst) && getNode(inst).type === func;
}

export function instHasType(inst, type) {
  switch (typeof type) {
    case 'string':
      return nodeHasType(getNode(inst), type);
    case 'function':
      return isCompositeComponentWithType(inst, type) ||
        isFunctionalComponentWithType(inst, type);
    default:
      return false;
  }
}

export function instHasProperty(inst, propKey, stringifiedPropValue) {
  if (!isDOMComponent(inst)) return false;

  const node = getNode(inst);

  return nodeHasProperty(node, propKey, stringifiedPropValue);
}

// called with private inst
export function renderedChildrenOfInst(inst) {
  return REACT013
    ? inst._renderedComponent._renderedChildren
    : inst._renderedChildren;
}

// called with a private instance
export function childrenOfInstInternal(inst) {
  if (!inst) {
    return [];
  }
  if (!inst.getPublicInstance) {
    const internal = internalInstance(inst);
    return childrenOfInstInternal(internal);
  }

  const publicInst = inst.getPublicInstance();
  const currentElement = inst._currentElement;
  if (isDOMComponent(publicInst)) {
    const renderedChildren = renderedChildrenOfInst(inst);
    return Object.keys(renderedChildren || {}).filter((key) => {
      if (REACT013 && !renderedChildren[key].getPublicInstance) {
        return false;
      }
      return true;
    }).map((key) => {
      if (!REACT013 && typeof renderedChildren[key]._currentElement.type === 'function') {
        return renderedChildren[key]._instance;
      }
      return renderedChildren[key].getPublicInstance();
    });
  } else if (
    !REACT013 &&
    isElement(currentElement) &&
    typeof currentElement.type === 'function'
  ) {
    return childrenOfInstInternal(inst._renderedComponent);
  } else if (
    REACT013 &&
    isCompositeComponent(publicInst)
  ) {
    return childrenOfInstInternal(inst._renderedComponent);
  }
  return [];
}

export function internalInstanceOrComponent(node) {
  if (REACT013) {
    return node;
  } else if (node._reactInternalComponent) {
    return node._reactInternalComponent;
  } else if (node._reactInternalInstance) {
    return node._reactInternalInstance;
  }
  return node;
}

export function childrenOfInst(node) {
  return childrenOfInstInternal(internalInstanceOrComponent(node));
}

export function pathToNode(node, root) {
  const queue = [root];
  const path = [];

  while (queue.length) {
    const current = queue.pop();
    const children = childrenOfInst(current);

    if (current === node) return path;

    path.push(current);

    if (children.length === 0) {
      // leaf node. if it isn't the node we are looking for, we pop.
      path.pop();
    }
    queue.push(...children);
  }

  return null;
}

export function parentsOfInst(inst, root) {
  return pathToNode(inst, root).reverse();
}

export function instMatchesObjectProps(inst, props) {
  if (!isDOMComponent(inst)) return false;
  const node = getNode(inst);
  return isSubset(propsOfNode(node), props);
}

export function buildInstPredicate(selector) {
  switch (typeof selector) {
    case 'function':
      // selector is a component constructor
      return inst => instHasType(inst, selector);

    case 'string':
      if (isCompoundSelector.test(selector)) {
        return AND(splitSelector(selector).map(buildInstPredicate));
      }

      switch (selectorType(selector)) {
        case SELECTOR.CLASS_TYPE:
          return inst => instHasClassName(inst, selector.substr(1));
        case SELECTOR.ID_TYPE:
          return inst => instHasId(inst, selector.substr(1));
        case SELECTOR.PROP_TYPE: {
          const propKey = selector.split(/\[([a-zA-Z][a-zA-Z_\d\-:]*?)(=|])/)[1];
          const propValue = selector.split(/=(.*?)]/)[1];

          return node => instHasProperty(node, propKey, propValue);
        }
        default:
          // selector is a string. match to DOM tag or constructor displayName
          return inst => instHasType(inst, selector);
      }

    case 'object':
      if (!Array.isArray(selector) && selector !== null && !isEmpty(selector)) {
        return node => instMatchesObjectProps(node, selector);
      }
      throw new TypeError(
        'Enzyme::Selector does not support an array, null, or empty object as a selector',
      );

    default:
      throw new TypeError('Enzyme::Selector expects a string, object, or Component Constructor');
  }
}

// This function should be called with an "internal instance". Nevertheless, if it is
// called with a "public instance" instead, the function will call itself with the
// internal instance and return the proper result.
function findAllInRenderedTreeInternal(inst, test) {
  if (!inst) {
    return [];
  }

  if (!inst.getPublicInstance) {
    const internal = internalInstance(inst);
    return findAllInRenderedTreeInternal(internal, test);
  }
  const publicInst = inst.getPublicInstance() || inst._instance;
  let ret = test(publicInst) ? [publicInst] : [];
  const currentElement = inst._currentElement;
  if (isDOMComponent(publicInst)) {
    const renderedChildren = renderedChildrenOfInst(inst);
    Object.keys(renderedChildren || {}).filter((key) => {
      if (REACT013 && !renderedChildren[key].getPublicInstance) {
        return false;
      }
      return true;
    }).forEach((key) => {
      ret = ret.concat(
        findAllInRenderedTreeInternal(renderedChildren[key], test),
      );
    });
  } else if (
    !REACT013 &&
    isElement(currentElement) &&
    typeof currentElement.type === 'function'
  ) {
    ret = ret.concat(
      findAllInRenderedTreeInternal(
        inst._renderedComponent,
        test,
      ),
    );
  } else if (
    REACT013 &&
    isCompositeComponent(publicInst)
  ) {
    ret = ret.concat(
      findAllInRenderedTreeInternal(
        inst._renderedComponent,
        test,
      ),
    );
  }
  return ret;
}

// This function could be called with a number of different things technically, so we need to
// pass the *right* thing to our internal helper.
export function treeFilter(node, test) {
  return findAllInRenderedTreeInternal(internalInstanceOrComponent(node), test);
}
