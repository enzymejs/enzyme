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
import without from 'lodash/without';
import escape from 'lodash/escape';
import compact from 'lodash/compact';
import { REACT013 } from './version';
import objectValues from 'object.values';

export function typeName(node) {
  return typeof node.type === 'function'
    ? (node.type.displayName || node.type.name || 'Component')
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

export function debugNode(node, indentLength = 2) {
  if (typeof node === 'string' || typeof node === 'number') return escape(node);
  if (!node) return '';

  const children = compact(childrenOfNode(node).map(n => debugNode(n, indentLength)));
  const type = typeName(node);
  const props = propsString(node);
  const beforeProps = props ? ' ' : '';
  const nodeClose = children.length ? `</${type}>` : '/>';
  const afterProps = children.length
    ? '>'
    : ' ';
  const childrenIndented = children.length
    ? `\n${children.map(x => indent(indentLength, x)).join('\n')}\n`
    : '';
  return `<${type}${beforeProps}${props}${afterProps}${childrenIndented}${nodeClose}`;
}

export function debugNodes(nodes) {
  return nodes.map(debugNode).join('\n\n\n');
}

export function debugInst(inst, indentLength = 2) {
  if (typeof inst === 'string' || typeof inst === 'number') return escape(inst);
  if (!inst) return '';

  if (inst._stringText) {
    return inst._stringText;
  }

  if (!inst.getPublicInstance) {
    const internal = internalInstance(inst);
    return debugInst(internal, indentLength);
  }
  const publicInst = inst.getPublicInstance();

  if (typeof publicInst === 'string' || typeof publicInst === 'number') return escape(publicInst);
  if (!publicInst && !inst._renderedComponent) return '';

  // do stuff with publicInst
  const currentElement = inst._currentElement;
  const type = typeName(currentElement);
  const props = propsString(currentElement);
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

  const childrenStrs = compact(children.map(n => debugInst(n, indentLength)));

  const beforeProps = props ? ' ' : '';
  const nodeClose = childrenStrs.length ? `</${type}>` : '/>';
  const afterProps = childrenStrs.length
    ? '>'
    : ' ';
  const childrenIndented = childrenStrs.length
    ? `\n${childrenStrs.map(x => indent(indentLength + 2, x)).join('\n')}\n`
    : '';
  return `<${type}${beforeProps}${props}${afterProps}${childrenIndented}${nodeClose}`;
}

export function debugInsts(insts) {
  return insts.map(debugInst).join('\n\n\n');
}
