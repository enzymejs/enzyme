import flatten from 'lodash/flatten';
import nodeTypeFromType from './nodeTypeFromType';

const ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
const FAUX_ITERATOR_SYMBOL = '@@iterator'; // Before Symbol spec.

/**
 * Returns the iterator method function contained on the iterable object.
 *
 * Be sure to invoke the function with the iterable as context:
 *
 *     const iteratorFn = getIteratorFn(myIterable);
 *     if (iteratorFn) {
 *       const iterator = iteratorFn.call(myIterable);
 *       ...
 *     }
 *
 * @param {?object} maybeIterable
 * @return {?function}
 */
function getIteratorFn(maybeIterable) {
  const iteratorFn = (
    maybeIterable && (
      (ITERATOR_SYMBOL && maybeIterable[ITERATOR_SYMBOL]) ||
      maybeIterable[FAUX_ITERATOR_SYMBOL]
    )
  );
  if (typeof iteratorFn === 'function') {
    return iteratorFn;
  }
  return undefined;
}

export default function elementToTree(el) {
  if (el === null || typeof el !== 'object' || !('type' in el)) {
    return el;
  }
  const { type, props, key, ref } = el;
  const { children } = props;
  let rendered = null;
  if (Array.isArray(children)) {
    rendered = flatten(children, true).map(elementToTree);
  } else if (typeof children === 'string') {
    rendered = elementToTree(children);
  } else {
    // This allows children to be iterables that aren't Arrays,
    // e.g. Immutable-js Lists, Seqs, etc.
    // For more info see the relevant React pull request,
    // off which this code is based:
    // https://github.com/facebook/react/pull/2376
    const iteratorFn = getIteratorFn(children);
    if (typeof iteratorFn === 'function') {
      const iterator = iteratorFn.call(children);
      let step = null;
      while (step && !step.done) {
        const child = step.value;
        rendered = elementToTree(child);
        step = iterator.next();
      }
    } else if (typeof children !== 'undefined') {
      rendered = elementToTree(children);
    }
  }
  return {
    nodeType: nodeTypeFromType(type),
    type,
    props,
    key,
    ref,
    instance: null,
    rendered,
  };
}
