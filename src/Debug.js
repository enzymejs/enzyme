import without from 'lodash/without';
import escape from 'lodash/escape';
import compact from 'lodash/compact';
import functionName from 'function.prototype.name';

import {
  propsOfNode,
  childrenOfNode,
} from './RSTTraversal';

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
