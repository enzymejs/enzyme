import entries from 'object.entries';
import isSubset from 'is-subset';
import { propsOfNode } from './Utils';

export function hasClassName(node, className) {
  let classes = propsOfNode(node).className || '';
  classes = String(classes).replace(/\s/g, ' ');
  return ` ${classes} `.indexOf(` ${className} `) > -1;
}

export function nodeHasId(node, id) {
  return propsOfNode(node).id === id;
}

const CAN_NEVER_MATCH = {};
function replaceUndefined(v) {
  return typeof v !== 'undefined' ? v : CAN_NEVER_MATCH;
}
function replaceUndefinedValues(obj) {
  return entries(obj).reduce((acc, [k, v]) => ({ ...acc, [k]: replaceUndefined(v) }), {});
}

export function nodeMatchesObjectProps(node, props) {
  return isSubset(propsOfNode(node), replaceUndefinedValues(props));
}
