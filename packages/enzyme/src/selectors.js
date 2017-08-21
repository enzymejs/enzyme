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
// @TODOD we dont support these, throw if they are used
const PSEUDO_CLASS = 'pseudoClassSelector';
const PSEUDO_ELEMENT = 'pseudoElementSelector';

// psuedo class types
const PSUEDO_CLASS_NOT = 'not';

function safelyGeneratorTokens(selector) {
  try {
    return parser.parse(selector);
  } catch (err) {
    throw new Error(`Failed to parse selector: ${selector}`);
  }
}

function nodeMatchesToken(node, token) {
  if (node === null || typeof node === 'string') {
    return false;
  }
  switch (token.type) {
    // Parse .class queries
    case CLASS_SELECTOR:
      return hasClassName(node, token.name);
    case TYPE_SELECTOR:
      return nodeHasType(node, token.name);
    case ID_SELECTOR:
      return nodeHasId(node, token.name);
    case ATTRIBUTE_VALUE:
      return nodeHasProperty(node, token.name, token.value);
    case ATTRIBUTE_PRESENCE:
      return nodeHasProperty(node, token.name);
    default:
      throw new Error(`Unknown token type: ${token.type}`);
  }
}

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
      const tokens = safelyGeneratorTokens(selector);
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

export function reduceTreeBySelector(selector, wrapper) {
  const root = wrapper.getNodeInternal();
  let results = [];
  switch (typeof selector) {
    case 'function':
    case 'object':
      results = treeFilter(root, buildPredicate(selector));
      break;
    case 'string': {
      const tokens = safelyGeneratorTokens(selector);
      let index = 0;
      // let next = null;
      let token = null;
      while (index < tokens.length) {
        token = tokens[index];
        if (token.type === SELECTOR) {
          const predicate = buildPredicateFromToken(token);
          results = results.concat(treeFilter(root, predicate));
          // eslint-disable-next-line no-loop-func
        } else {
          // Combinator tokens dictate the "direction" we should
          // parse from the previously matched tokens. We can assume
          // There always all previously matched tokens since selectors
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
            case DESCENDANT: {
              const matched = results.reduce(
                (matches, node) => matches.concat(treeFilter(node, predicate)),
                [],
              );
              results = unique(matched);
              break;
            }
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
