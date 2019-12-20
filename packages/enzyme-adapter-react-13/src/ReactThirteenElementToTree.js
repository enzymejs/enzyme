import { flatten, isArrayLike, ensureKeyOrUndefined } from 'enzyme-adapter-utils';

export function nodeTypeFromType(type) {
  if (typeof type === 'string') {
    return 'host';
  }
  if (type && type.prototype && typeof type.prototype.render === 'function') {
    return 'class';
  }
  return 'function';
}

export default function elementToTree(el) {
  if (el === null || typeof el !== 'object' || !('type' in el)) {
    return el;
  }
  const {
    type,
    props,
    key,
    ref,
  } = el;
  const { children } = props;
  let rendered = null;
  if (isArrayLike(children)) {
    rendered = flatten([...children]).map(elementToTree);
  } else if (typeof children !== 'undefined') {
    rendered = elementToTree(children);
  }

  const nodeType = nodeTypeFromType(type);

  if (nodeType === 'host' && props.dangerouslySetInnerHTML) {
    if (props.children != null) {
      const error = new Error('Can only set one of `children` or `props.dangerouslySetInnerHTML`.');
      error.name = 'Invariant Violation';
      throw error;
    }
  }

  return {
    nodeType,
    type,
    props,
    key: ensureKeyOrUndefined(key),
    ref,
    instance: null,
    rendered,
  };
}
