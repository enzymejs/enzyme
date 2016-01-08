import {
  childrenOfNode,
} from './ShallowTraversal';
import {
  propsOfNode,
} from './Utils';
import { without, escape, compact } from 'underscore';

export function typeName(node) {
  return typeof node.type === 'function'
    ? (node.type.displayName || 'Component')
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
      return `{{...}}`;
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
  if (!node) return '';
  if (typeof node === 'string') return escape(node);

  const children = compact(childrenOfNode(node).map(n => debugNode(n, indentLength)));
  const type = typeName(node);
  const props = propsString(node);
  const beforeProps = props ? ' ' : '';
  const nodeClose = children.length ? `</${type}>` : '/>';
  const afterProps = children.length
    ? '>'
    : ' ';
  const childrenIndented = children.length
    ? '\n' + children.map(x => indent(indentLength, x)).join('\n') + '\n'
    : '';
  return `<${type}${beforeProps}${props}${afterProps}${childrenIndented}${nodeClose}`;
}

export function debugNodes(nodes) {
  return nodes.map(debugNode).join('\n\n\n');
}
