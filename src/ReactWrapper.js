import React from 'react/addons';
import { deepEqual } from 'underscore';
import {
  getNode,
} from './Utils';
const {
  isDOMComponent,
  renderIntoDocument,
  findAllInRenderedTree,
  scryRenderedDOMComponentsWithClass,
  findRenderedDOMComponentWithClass,
  scryRenderedDOMComponentsWithTag,
  findRenderedDOMComponentWithTag,
  scryRenderedComponentsWithType,
  findRenderedComponentWithType,
  } = React.addons.TestUtils;

export class ReactWrapperComponent extends React.Component {

  constructor(props) {
    super(props);
    this.state = Object.assign({}, props.props);
  }

  setProps(newProps) {
    return new Promise(resolve => this.setState(newProps, resolve));
  }

  render() {
    const { Component } = this.props;
    return (
      <Component ref="component" {...this.state} />
    );
  }
}

export default class ReactWrapper {

  constructor(node) {
    if (!global.window && !global.document) {
      throw new Error(
        `It looks like you called \`mount()\` without having ` +
        `called \`useJsDom()\` first. As a result, the DOM isn't ` +
        `loaded and \`renderIntoDocument\` will fail.`
      );
    }
    this.component = renderIntoDocument(
      <ReactWrapperComponent
        Component={node.type}
        props={node.props}
        />
    );
  }

  /**
   * Used like `setState(...)` but sets the propsn directly on the component this class wraps
   *
   * @param {Object} newProps
   * @returns {Promise}
   */
  setProps(newProps) {
    return this.component.setProps(newProps);
  }

  /**
   * Force the component to update
   */
  forceUpdate() {
    this.component.forceUpdate();
  }

  /**
   * Get a ref of the component. If the ref is a DOM Node, it returns the DOM Node directly.
   *
   * @param {String} refname
   * @returns {HtmlElement|ReactElement}
   */
  ref(refname) {
    const ref = this.component.refs.component.refs[refname];
    if (!ref) return null;
    return getNode(ref);
  }

  /**
   *
   * @returns {ReactElement}
   */
  root() {
    return this.component.refs.component;
  }

  /**
   * Finds all components in the tree that pass the passed in text
   *
   * @param {Function} test function
   * @returns {Array}
   */
  findWhere(test) {
    return findAllInRenderedTree(this.component, test);
  }

  /**
   *
   * @param {Function|String} selector
   * @returns {Array<ReactComponent>} results
   */
  findAll(selector) {
    switch (typeof selector) {
      case "function":
        return scryRenderedComponentsWithType(this.component, selector);
      case "string":
        if (selector[0] === ".") {
          return scryRenderedDOMComponentsWithClass(this.component, selector.substr(1))
            .map(getNode);
        } else {
          return scryRenderedDOMComponentsWithTag(this.component, selector)
            .map(getNode);
        }
      default:
        throw new TypeError("Expecting a string or Component Constructor");
    }
  }

  /**
   *
   * @param {Function|String} selector
   * @returns {ReactElement} resulting component
   */
  find(selector) {
    switch (typeof selector) {
      case "function":
        return findRenderedComponentWithType(this.component, selector);
      case "string":
        if (selector[0] === ".") {
          return getNode(findRenderedDOMComponentWithClass(this.component, selector.substr(1)));
        } else {
          return getNode(findRenderedDOMComponentWithTag(this.component, selector));
        }
      default:
        throw new TypeError("Expecting a string or Component Constructor");
    }
  }
}
