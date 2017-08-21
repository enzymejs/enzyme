import { createParser } from 'scalpel';
import isEmpty from 'lodash/isEmpty';
import unique from 'lodash/uniq';
import {
  treeFilter,
  nodeHasId,
  findParentNode,
  nodeMatchesObjectProps,
  childrenOfNode,
  hasClassName,
} from './RSTTraversal';
import { nodeHasType, nodeHasProperty } from './Utils';
// our CSS selector parser instance
const parser = createParser();

// Combinators that allow you to chance selectors
const CHILD = 'childCombinator';
const ADJACENT_SIBLING = 'adjacentSiblingCombinator';
const GENERAL_SIBLING = 'generalSiblingCombinator';
const DESCENDANT = 'descendantCombinator';

// Selectors for targeting elements
const SELECTOR = 'selector';
const TYPE_SELECTOR = 'typeSelector';
const CLASS_SELECTOR = 'classSelector';
const ID_SELECTOR = 'idSelector';
const ATTRIBUTE_PRESENCE = 'attributePresenceSelector';
const ATTRIBUTE_VALUE = 'attributeValueSelector';
// @TODO we dont support these, throw if they are used
// const PSEUDO_CLASS = 'pseudoClassSelector';
// const PSEUDO_ELEMENT = 'pseudoElementSelector';


/**
 * Takes a CSS selector and returns a set of tokens parsed
 * by scalpel.
 * @param {String} selector 
 */
function safelyGenerateTokens(selector) {
  try {
    return parser.parse(selector);
  } catch (err) {
    throw new Error(`Failed to parse selector: ${selector}`);
  }
}

/**
 * Takes a node and a token and determines if the node
 * matches the predicate defined by the token.
 * @param {Node} node 
 * @param {Token} token 
 */
function nodeMatchesToken(node, token) {
  if (node === null || typeof node === 'string') {
    return false;
  }
  switch (token.type) {
     /**
     * Match against the className prop
     * @example '.active' matches <div className='active' />
     */
    case CLASS_SELECTOR:
      return hasClassName(node, token.name);
    /**
     * Simple type matching
     * @example 'div' matches <div />
     */
    case TYPE_SELECTOR:
      return nodeHasType(node, token.name);
    /**
     * Match against the `id` prop
     * @example '#nav' matches <ul id="nav" />
     */
    case ID_SELECTOR:
      return nodeHasId(node, token.name);
    /**
     * Matches if an attribute is present, regardless
     * of its value
     * @example '[disabled]' matches <a disabled />
     */
    case ATTRIBUTE_PRESENCE:
    return nodeHasProperty(node, token.name);
    /**
     * Matches if an attribute is present with the
     * provided value
     * @example '[data-foo=foo]' matches <div data-foo="foo" />
     */
    case ATTRIBUTE_VALUE:
      return nodeHasProperty(node, token.name, token.value);
    default:
      throw new Error(`Unknown token type: ${token.type}`);
  }
}

/**
 * Returns a predicate function that checks if a
 * node matches every token in the body of a selector
 * token.
 * @param {Token} token 
 */
function buildPredicateFromToken(token) {
  return node => token.body.every(
    bodyToken => nodeMatchesToken(node, bodyToken),
  );
}

/**
 * Returns whether a parsed selector is a complex selector, which
 * is defined as a selector that contains combinators.
 * @param {Array<Token>} tokens 
 */
function isComplexSelector(tokens) {
  return tokens.some(token => token.type !== SELECTOR);
}


/**
 * Takes a component constructor, object, or string representing
 * a simple selector and returns a predicate function that can
 * be applied to a single node. 
 * @param {Function|Object|String} selector 
 */
export function buildPredicate(selector) {
  switch (typeof selector) {
    case 'function':
      // constructor
      return node => node && node.type === selector;
    case 'object':
      if (!Array.isArray(selector) && selector !== null && !isEmpty(selector)) {
        return node => nodeMatchesObjectProps(node, selector);
      }
      throw new TypeError(
        'Enzyme::Selector does not support an array, null, or empty object as a selector',
      );
    case 'string': {
      const tokens = safelyGenerateTokens(selector);
      if (isComplexSelector(tokens)) {
        // @TODO throw a helpful error.
      }
      // Simple selectors only have a single selector token
      return buildPredicateFromToken(tokens[0]);
    }
    default:
      throw new TypeError('Enzyme::Selector expects a string, object, or Component Constructor');
  }
}

/**
 * Takes an RST and reduces it to a set of nodes matching
 * the selector. The selector can be a simple selector, which
 * is handled by `buildPredicate`, or a complex CSS selector which
 * reduceTreeBySelector parses and reduces the tree based on the combinators.
 * @param {Function|Object|String} selector 
 * @param {ReactWrapper|ShallowWrapper} wrapper 
 */
export function reduceTreeBySelector(selector, wrapper) {
  const root = wrapper.getNodeInternal();
  let results = [];
  switch (typeof selector) {
    case 'function':
    case 'object':
      results = treeFilter(root, buildPredicate(selector));
      break;
    case 'string': {
      const tokens = safelyGenerateTokens(selector);
      let index = 0;
      let token = null;
      while (index < tokens.length) {
        token = tokens[index];
        /**
         * There are two types of tokens in a CSS selector:
         * 
         * 1. Selector tokens. These target nodes directly, like
         *    type or attribute selectors. These are easy to apply
         *    because we can travserse the tree and return only
         *    the nodes that match the predicate.
         * 
         * 2. Combinator tokens. These tokens chain together
         *    selector nodes. For example > for children, or +
         *    for adjecent siblings. These are harder to match
         *    as we have to track where in the tree we are
         *    to determine if a selector node applies or not.
         */
        if (token.type === SELECTOR) {
          const predicate = buildPredicateFromToken(token);
          results = results.concat(treeFilter(root, predicate));
        } else {
          // We can assume there always all previously matched tokens since selectors
          // cannot start with combinators.
          const type = token.type;
          // We assume the next token is a selector, so move the index
          // forward and build the predicate.
          index += 1;
          token = tokens[index];
          const predicate = buildPredicateFromToken(token);
          // We match against only the nodes which have already been matched,
          // since a combinator is meant to refine a previous selector.
          switch (type) {
            // The + combinator
            case ADJACENT_SIBLING: {
              results = results.reduce((matches, node) => {
                const parent = findParentNode(root, node);
                // If there's no parent, there's no siblings
                if (!parent) {
                  return matches;
                }
                const nodeIndex = parent.rendered.indexOf(node);
                const adjacentSibling = parent.rendered[nodeIndex + 1];
                // No sibling
                if (!adjacentSibling) {
                  return matches;
                }
                if (predicate(adjacentSibling)) {
                  matches.push(adjacentSibling);
                }
                return matches;
              }, []);
              break;
            }
            // The ~ combinator
            case GENERAL_SIBLING: {
              const matched = results.reduce((matches, node) => {
                const parent = findParentNode(root, node);
                const nodeIndex = parent.rendered.indexOf(node);
                parent.rendered.forEach((sibling, i) => {
                  if (i > nodeIndex && predicate(sibling)) {
                    matches.push(sibling);
                  }
                });
                return matches;
              }, []);
              results = unique(matched);
              break;
            }
            // The > combinator
            case CHILD: {
              const matched = results.reduce((matches, node) => {
                const children = childrenOfNode(node);
                children.forEach((child) => {
                  if (predicate(child)) {
                    matches.push(child);
                  }
                });
                return matches;
              }, []);
              results = unique(matched);
              break;
            }
            // The ' ' (whitespace) combinator
            case DESCENDANT: {
              const matched = results.reduce(
                (matches, node) => matches.concat(treeFilter(node, predicate)),
                [],
              );
              results = unique(matched);
              break;
            }
            default:
              throw new Error(`Unkown combinator selector: ${type}`);
          }
        }
        index += 1;
      }
      break;
    }
    default:
      throw new TypeError('Enzyme::Selector expects a string, object, or Component Constructor');
  }
  return wrapper.wrap(results);
}
