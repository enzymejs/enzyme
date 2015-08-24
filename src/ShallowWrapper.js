import React from 'react/addons';
import {
  nodeEqual,
  single,
  treeForEach,
  treeFilter,
  hasClassName,
} from './Utils';
const {
  createRenderer,
  } = React.addons.TestUtils;

export default class ShallowWrapper {

  constructor(node) {
    this.renderer = createRenderer();
    this.node = node;
    this.renderer.render(this.node);
    this.tree = this.renderer.getRenderOutput();
  }

  /**
   *
   * @param {Function} test
   * @returns {Array<HTMLElement|ReactElement>}
   */
  findWhere(test) {
    return treeFilter(this.tree, test);
  }

  /**
   *
   * @param {String|Function} selector
   * @returns {Array<HTMLElement|ReactElement>}
   */
  findAll(selector) {
    switch (typeof selector) {
      case "function":
        return this.findWhere(node => node.type === selector);
      case "string":
        if (selector[0] === ".") {
          return this.findWhere(node => hasClassName(node, selector.substr(1)));
        } else {
          return this.findWhere(node => node.type === selector);
        }
      default:
        throw new TypeError("Expecting a string or Component Constructor");
    }
  }

  /**
   *
   * @param {String|Function} selector
   * @returns {HTMLElement|ReactElement}
   */
  find(selector) {
    return single(this.findAll(selector));
  }

  /**
   *
   * @param {ReactElement} node
   * @returns {Boolean}
   */
  contains(node) {
    return this.findWhere(other => nodeEqual(node, other)).length > 0;
  }
}