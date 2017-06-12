import without from 'lodash/without';
import escape from 'lodash/escape';
import compact from 'lodash/compact';
import objectValues from 'object.values';
import functionName from 'function.prototype.name';

import {
  childrenOfNode,
} from './ShallowTraversal';
import {
  renderedChildrenOfInst,
} from './MountedTraversal';
import {
  isDOMComponent,
  isCompositeComponent,
  isElement,
} from './react-compat';
import {
  internalInstance,
  propsOfNode,
} from './Utils';
import { REACT013 } from './version';

export function typeName(node) {
  return typeof node.type === 'function'
    ? (node.type.displayName || functionName(node.type) || 'Component')
    : node.type;
}

export function spaces(n) {
  return Array(n + 1).join(' ');
}

export function indent(depth, string) {
  return string.split('\n').map(x => `${spaces(depth)}${x}`).join('\n');
}

function propString(prop) {
  switch (typeof prop) {
    case 'function':
      return '{[Function]}';
    case 'string':
      return `"${prop}"`;
    case 'number':
    case 'boolean':
      return `{${prop}}`;
    case 'object':
      return '{{...}}';
    default:
      return `{[${typeof prop}]}`;
  }
}

function propsString(node) {
  const props = propsOfNode(node);
  const keys = without(Object.keys(props), 'children');
  return keys.map(key => `${key}=${propString(props[key])}`).join(' ');
}

function indentChildren(childrenStrs, indentLength) {
  return childrenStrs.length
    ? `\n${childrenStrs.map(x => indent(indentLength, x)).join('\n')}\n`
    : '';
}

export function debugNode(node, indentLength = 2, options = {}) {
  if (typeof node === 'string' || typeof node === 'number') return escape(node);
  if (!node) return '';

  const childrenStrs = compact(childrenOfNode(node).map(n => debugNode(n, indentLength, options)));
  const type = typeName(node);

  const props = options.ignoreProps ? '' : propsString(node);
  const beforeProps = props ? ' ' : '';
  const afterProps = childrenStrs.length
    ? '>'
    : ' ';
  const childrenIndented = indentChildren(childrenStrs, indentLength);
  const nodeClose = childrenStrs.length ? `</${type}>` : '/>';
  return `<${type}${beforeProps}${props}${afterProps}${childrenIndented}${nodeClose}`;
}

export function debugNodes(nodes, options = {}) {
  return nodes.map(node => debugNode(node, undefined, options)).join('\n\n\n');
}

export function debugInst(inst, indentLength = 2, options = {}) {
  if (typeof inst === 'string' || typeof inst === 'number') return escape(inst);
  if (!inst) return '';

  if (inst._stringText) {
    return inst._stringText;
  }

  if (!inst.getPublicInstance) {
    const internal = internalInstance(inst);
    return debugInst(internal, indentLength, options);
  }
  const publicInst = inst.getPublicInstance();

  if (typeof publicInst === 'string' || typeof publicInst === 'number') return escape(publicInst);
  if (!publicInst && !inst._renderedComponent) return '';

  // do stuff with publicInst
  const currentElement = inst._currentElement;
  const type = typeName(currentElement);
  const props = options.ignoreProps ? '' : propsString(currentElement);
  const children = [];
  if (isDOMComponent(publicInst)) {
    const renderedChildren = renderedChildrenOfInst(inst);
    if (!renderedChildren) {
      children.push(...childrenOfNode(currentElement));
    } else {
      children.push(...objectValues(renderedChildren));
    }
  } else if (
    !REACT013 &&
    isElement(currentElement) &&
    typeof currentElement.type === 'function'
  ) {
    children.push(inst._renderedComponent);
  } else if (
    REACT013 &&
    isCompositeComponent(publicInst)
  ) {
    children.push(inst._renderedComponent);
  }

  const childrenStrs = compact(children.map(n => debugInst(n, indentLength, options)));

  const beforeProps = props ? ' ' : '';
  const nodeClose = childrenStrs.length ? `</${type}>` : '/>';
  const afterProps = childrenStrs.length
    ? '>'
    : ' ';
  const childrenIndented = indentChildren(childrenStrs, indentLength);
  return `<${type}${beforeProps}${props}${afterProps}${childrenIndented}${nodeClose}`;
}

export function debugInsts(insts, options = {}) {
  return insts.map(inst => debugInst(inst, undefined, options)).join('\n\n\n');
}
