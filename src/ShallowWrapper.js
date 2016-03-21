import React from 'react';
import flatten from 'lodash/flatten';
import unique from 'lodash/uniq';
import compact from 'lodash/compact';
import cheerio from 'cheerio';
import {
  nodeEqual,
  containsChildrenSubArray,
  propFromEvent,
  withSetStateAllowed,
  propsOfNode,
  typeOfNode,
} from './Utils';
import {
  debugNodes,
} from './Debug';
import {
  getTextFromNode,
  hasClassName,
  childrenOfNode,
  parentsOfNode,
  treeFilter,
  buildPredicate,
} from './ShallowTraversal';
import {
  createShallowRenderer,
  renderToStaticMarkup,
} from './react-compat';

/**
 * Finds all nodes in the current wrapper nodes' render trees that match the provided predicate
 * function.
 *
 * @param {ShallowWrapper} wrapper
 * @param {Function} predicate
 * @returns {ShallowWrapper}
 */
function findWhereUnwrapped(wrapper, predicate) {
  return wrapper.flatMap(n => treeFilter(n.node, predicate));
}

/**
 * Returns a new wrapper instance with only the nodes of the current wrapper instance that match
 * the provided predicate function.
 *
 * @param {ShallowWrapper} wrapper
 * @param {Function} predicate
 * @returns {ShallowWrapper}
 */
function filterWhereUnwrapped(wrapper, predicate) {
  return wrapper.wrap(compact(wrapper.nodes.filter(predicate)));
}

/**
 * @class ShallowWrapper
 */
export default class ShallowWrapper {

  constructor(nodes, root, options = {}) {
    if (!root) {
      this.root = this;
      this.unrendered = nodes;
      this.renderer = createShallowRenderer();
      this.renderer.render(nodes, options.context);
      this.node = this.renderer.getRenderOutput();
      this.nodes = [this.node];
      this.length = 1;
    } else {
      this.root = root;
      this.unrendered = null;
      this.renderer = null;
      if (!Array.isArray(nodes)) {
        this.node = nodes;
        this.nodes = [nodes];
      } else {
        this.node = nodes[0];
        this.nodes = nodes;
      }
      this.length = this.nodes.length;
    }
    this.options = options;
  }

  /**
   * Gets the instance of the component being rendered as the root node passed into `shallow()`.
   *
   * NOTE: can only be called on a wrapper instance that is also the root instance.
   *
   * Example:
   * ```
   * const wrapper = shallow(<MyComponent />);
   * const inst = wrapper.instance();
   * expect(inst).to.be.instanceOf(MyComponent);
   * ```
   * @returns {ReactComponent}
   */
  instance() {
    return this.renderer._instance._instance;
  }

  /**
   * Forces a re-render. Useful to run before checking the render output if something external
   * may be updating the state of the component somewhere.
   *
   * NOTE: can only be called on a wrapper instance that is also the root instance.
   *
   * @returns {ShallowWrapper}
   */
  update() {
    if (this.root !== this) {
      throw new Error('ShallowWrapper::update() can only be called on the root');
    }
    this.single(() => {
      this.node = this.renderer.getRenderOutput();
      this.nodes = [this.node];
    });
    return this;
  }

  /**
   * A method that sets the props of the root component, and re-renders. Useful for when you are
   * wanting to test how the component behaves over time with changing props. Calling this, for
   * instance, will call the `componentWillReceiveProps` lifecycle method.
   *
   * Similar to `setState`, this method accepts a props object and will merge it in with the already
   * existing props.
   *
   * NOTE: can only be called on a wrapper instance that is also the root instance.
   *
   * @param {Object} props object
   * @returns {ShallowWrapper}
   */
  setProps(props) {
    if (this.root !== this) {
      throw new Error('ShallowWrapper::setProps() can only be called on the root');
    }
    this.single(() => {
      withSetStateAllowed(() => {
        this.unrendered = React.cloneElement(this.unrendered, props);
        this.renderer.render(this.unrendered, this.options.context);
        this.update();
      });
    });
    return this;
  }

  /**
   * A method to invoke `setState` on the root component instance similar to how you might in the
   * definition of the component, and re-renders.  This method is useful for testing your component
   * in hard to achieve states, however should be used sparingly. If possible, you should utilize
   * your component's external API in order to get it into whatever state you want to test, in order
   * to be as accurate of a test as possible. This is not always practical, however.
   *
   * NOTE: can only be called on a wrapper instance that is also the root instance.
   *
   * @param {Object} state to merge
   * @returns {ShallowWrapper}
   */
  setState(state) {
    if (this.root !== this) {
      throw new Error('ShallowWrapper::setState() can only be called on the root');
    }
    this.single(() => {
      withSetStateAllowed(() => {
        this.instance().setState(state);
        this.update();
      });
    });
    return this;
  }

  /**
   * A method that sets the context of the root component, and re-renders. Useful for when you are
   * wanting to test how the component behaves over time with changing contexts.
   *
   * NOTE: can only be called on a wrapper instance that is also the root instance.
   *
   * @param {Object} context object
   * @returns {ShallowWrapper}
   */
  setContext(context) {
    if (this.root !== this) {
      throw new Error('ShallowWrapper::setContext() can only be called on the root');
    }
    if (!this.options.context) {
      throw new Error(
        'ShallowWrapper::setContext() can only be called on a wrapper that was originally passed ' +
        'a context option'
      );
    }
    this.renderer.render(this.unrendered, context);
    this.update();
    return this;
  }

  /**
   * Whether or not a given react element exists in the shallow render tree.
   *
   * Example:
   * ```
   * const wrapper = shallow(<MyComponent />);
   * expect(wrapper.contains(<div className="foo bar" />)).to.equal(true);
   * ```
   *
   * @param {ReactElement|Array<ReactElement>} nodeOrNodes
   * @returns {Boolean}
   */
  contains(nodeOrNodes) {
    const predicate = Array.isArray(nodeOrNodes)
      ? other => containsChildrenSubArray(nodeEqual, other, nodeOrNodes)
      : other => nodeEqual(nodeOrNodes, other);

    return findWhereUnwrapped(this, predicate).length > 0;
  }

  /**
   * Whether or not a given react element exists in the shallow render tree.
   *
   * Example:
   * ```
   * const wrapper = shallow(<MyComponent />);
   * expect(wrapper.contains(<div className="foo bar" />)).to.equal(true);
   * ```
   *
   * @param {ReactElement} node
   * @returns {Boolean}
   */
  equals(node) {
    return this.single(() => nodeEqual(this.node, node));
  }

  /**
   * Finds every node in the render tree of the current wrapper that matches the provided selector.
   *
   * @param {String|Function} selector
   * @returns {ShallowWrapper}
   */
  find(selector) {
    const predicate = buildPredicate(selector);
    return findWhereUnwrapped(this, predicate);
  }

  /**
   * Returns whether or not current node matches a provided selector.
   *
   * NOTE: can only be called on a wrapper of a single node.
   *
   * @param {String|Function} selector
   * @returns {boolean}
   */
  is(selector) {
    const predicate = buildPredicate(selector);
    return this.single(predicate);
  }

  /**
   * Returns a new wrapper instance with only the nodes of the current wrapper instance that match
   * the provided predicate function. The predicate should receive a wrapped node as its first
   * argument.
   *
   * @param {Function} predicate
   * @returns {ShallowWrapper}
   */
  filterWhere(predicate) {
    return filterWhereUnwrapped(this, n => predicate(this.wrap(n)));
  }

  /**
   * Returns a new wrapper instance with only the nodes of the current wrapper instance that match
   * the provided selector.
   *
   * @param {String|Function} selector
   * @returns {ShallowWrapper}
   */
  filter(selector) {
    const predicate = buildPredicate(selector);
    return filterWhereUnwrapped(this, predicate);
  }

  /**
   * Returns a new wrapper instance with only the nodes of the current wrapper that did not match
   * the provided selector. Essentially the inverse of `filter`.
   *
   * @param {String|Function} selector
   * @returns {ShallowWrapper}
   */
  not(selector) {
    const predicate = buildPredicate(selector);
    return filterWhereUnwrapped(this, n => !predicate(n));
  }

  /**
   * Returns a string of the rendered text of the current render tree.  This function should be
   * looked at with skepticism if being used to test what the actual HTML output of the component
   * will be. If that is what you would like to test, use enzyme's `render` function instead.
   *
   * NOTE: can only be called on a wrapper of a single node.
   *
   * @returns {String}
   */
  text() {
    return this.single(getTextFromNode);
  }

  /**
   * Returns the HTML of the node.
   *
   * NOTE: can only be called on a wrapper of a single node.
   *
   * @returns {String}
   */
  html() {
    return this.single(n => this.type() === null ? null : renderToStaticMarkup(n));
  }

  /**
   * Returns the current node rendered to HTML and wrapped in a CheerioWrapper.
   *
   * NOTE: can only be called on a wrapper of a single node.
   *
   * @returns {CheerioWrapper}
   */
  render() {
    return this.type() === null ? cheerio() : cheerio.load(this.html()).root();
  }

  /**
   * A method that unmounts the component. This can be used to simulate a component going through
   * and unmount/mount lifecycle.
   * @returns {ShallowWrapper}
   */
  unmount() {
    this.renderer.unmount();
    return this;
  }

  /**
   * Used to simulate events. Pass an eventname and (optionally) event arguments. This method of
   * testing events should be met with some skepticism.
   *
   * @param {String} event
   * @param {Array} args
   * @returns {ShallowWrapper}
   */
  simulate(event, ...args) {
    const handler = this.prop(propFromEvent(event));
    if (handler) {
      withSetStateAllowed(() => {
        // TODO(lmr): create/use synthetic events
        // TODO(lmr): emulate React's event propagation
        handler(...args);
        this.root.update();
      });
    }
    return this;
  }

  /**
   * Returns the props hash for the root node of the wrapper.
   *
   * NOTE: can only be called on a wrapper of a single node.
   *
   * @returns {Object}
   */
  props() {
    return this.single(propsOfNode);
  }

  /**
   * Returns the state hash for the root node of the wrapper. Optionally pass in a prop name and it
   * will return just that value.
   *
   * NOTE: can only be called on a wrapper of a single node.
   *
   * @param {String} name (optional)
   * @returns {*}
   */
  state(name) {
    if (this.root !== this) {
      throw new Error('ShallowWrapper::state() can only be called on the root');
    }
    const _state = this.single(() => this.instance().state);
    if (name !== undefined) {
      return _state[name];
    }
    return _state;
  }

  /**
   * Returns the context hash for the root node of the wrapper.
   * Optionally pass in a prop name and it will return just that value.
   *
   * NOTE: can only be called on a wrapper of a single node.
   *
   * @param {String} name (optional)
   * @returns {*}
   */
  context(name) {
    if (this.root !== this) {
      throw new Error('ShallowWrapper::context() can only be called on the root');
    }
    const _context = this.single(() => this.instance().context);
    if (name) {
      return _context[name];
    }
    return _context;
  }

  /**
   * Returns a new wrapper with all of the children of the current wrapper.
   *
   * @param {String|Function} [selector]
   * @returns {ShallowWrapper}
   */
  children(selector) {
    const allChildren = this.flatMap(n => childrenOfNode(n.node));
    return selector ? allChildren.filter(selector) : allChildren;
  }

  /**
   * Returns a new wrapper with a specific child
   *
   * @param {Number} [index]
   * @returns {ShallowWrapper}
   */
  childAt(index) {
    return this.single(() => this.children().at(index));
  }

  /**
   * Returns a wrapper around all of the parents/ancestors of the wrapper. Does not include the node
   * in the current wrapper.
   *
   * NOTE: can only be called on a wrapper of a single node.
   *
   * @param {String|Function} [selector]
   * @returns {ShallowWrapper}
   */
  parents(selector) {
    const allParents = this.wrap(this.single(n => parentsOfNode(n, this.root.node)));
    return selector ? allParents.filter(selector) : allParents;
  }

  /**
   * Returns a wrapper around the immediate parent of the current node.
   *
   * @returns {ShallowWrapper}
   */
  parent() {
    return this.flatMap(n => [n.parents().get(0)]);
  }

  /**
   *
   * @param {String|Function} selector
   * @returns {ShallowWrapper}
   */
  closest(selector) {
    return this.is(selector) ? this : this.parents().filter(selector).first();
  }

  /**
   * Shallow renders the current node and returns a shallow wrapper around it.
   *
   * NOTE: can only be called on wrapper of a single node.
   *
   * @param options object
   * @returns {ShallowWrapper}
   */
  shallow(options) {
    return this.single((n) => new ShallowWrapper(n, null, options));
  }

  /**
   * Returns the value of  prop with the given name of the root node.
   *
   * @param propName
   * @returns {*}
   */
  prop(propName) {
    return this.props()[propName];
  }

  /**
   * Returns the type of the root ndoe of this wrapper. If it's a composite component, this will be
   * the component constructor. If it's native DOM node, it will be a string.
   *
   * @returns {String|Function}
   */
  type() {
    return this.single(typeOfNode);
  }

  /**
   * Returns whether or not the current root node has the given class name or not.
   *
   * NOTE: can only be called on a wrapper of a single node.
   *
   * @param className
   * @returns {Boolean}
   */
  hasClass(className) {
    if (className && className.indexOf('.') !== -1) {
      console.warn(
        'It looks like you\'re calling `ShallowWrapper::hasClass()` with a CSS selector. ' +
        'hasClass() expects a class name, not a CSS selector.'
      );
    }
    return this.single(n => hasClassName(n, className));
  }

  /**
   * Iterates through each node of the current wrapper and executes the provided function with a
   * wrapper around the corresponding node passed in as the first argument.
   *
   * @param {Function} fn
   * @returns {ShallowWrapper}
   */
  forEach(fn) {
    this.nodes.forEach((n, i) => fn.call(this, this.wrap(n), i));
    return this;
  }

  /**
   * Maps the current array of nodes to another array. Each node is passed in as a `ShallowWrapper`
   * to the map function.
   *
   * @param {Function} fn
   * @returns {Array}
   */
  map(fn) {
    return this.nodes.map((n, i) => fn.call(this, this.wrap(n), i));
  }

  /**
   * Reduces the current array of nodes to a value. Each node is passed in as a `ShallowWrapper`
   * to the reducer function.
   *
   * @param {Function} fn - the reducer function
   * @param {*} initialValue - the initial value
   * @returns {*}
   */
  reduce(fn, initialValue) {
    return this.nodes.reduce(
      (accum, n, i) => fn.call(this, accum, this.wrap(n), i),
      initialValue
    );
  }

  /**
   * Reduces the current array of nodes to another array, from right to left. Each node is passed
   * in as a `ShallowWrapper` to the reducer function.
   *
   * @param {Function} fn - the reducer function
   * @param {*} initialValue - the initial value
   * @returns {*}
   */
  reduceRight(fn, initialValue) {
    return this.nodes.reduceRight(
      (accum, n, i) => fn.call(this, accum, this.wrap(n), i),
      initialValue
    );
  }

  /**
   * Returns whether or not any of the nodes in the wrapper match the provided selector.
   *
   * @param {Function|String} selector
   * @returns {Boolean}
   */
  some(selector) {
    const predicate = buildPredicate(selector);
    return this.nodes.some(predicate);
  }

  /**
   * Returns whether or not any of the nodes in the wrapper pass the provided predicate function.
   *
   * @param {Function} predicate
   * @returns {Boolean}
   */
  someWhere(predicate) {
    return this.nodes.some((n, i) => predicate.call(this, this.wrap(n), i));
  }

  /**
   * Returns whether or not all of the nodes in the wrapper match the provided selector.
   *
   * @param {Function|String} selector
   * @returns {Boolean}
   */
  every(selector) {
    const predicate = buildPredicate(selector);
    return this.nodes.every(predicate);
  }

  /**
   * Returns whether or not any of the nodes in the wrapper pass the provided predicate function.
   *
   * @param {Function} predicate
   * @returns {Boolean}
   */
  everyWhere(predicate) {
    return this.nodes.every((n, i) => predicate.call(this, this.wrap(n), i));
  }

  /**
   * Utility method used to create new wrappers with a mapping function that returns an array of
   * nodes in response to a single node wrapper. The returned wrapper is a single wrapper around
   * all of the mapped nodes flattened (and de-duplicated).
   *
   * @param {Function} fn
   * @returns {ShallowWrapper}
   */
  flatMap(fn) {
    const nodes = this.nodes.map((n, i) => fn.call(this, this.wrap(n), i));
    const flattened = flatten(nodes, true);
    const uniques = unique(flattened);
    return this.wrap(uniques);
  }

  /**
   * Finds all nodes in the current wrapper nodes' render trees that match the provided predicate
   * function. The predicate function will receive the nodes inside a ShallowWrapper as its
   * first argument.
   *
   * @param {Function} predicate
   * @returns {ShallowWrapper}
   */
  findWhere(predicate) {
    return findWhereUnwrapped(this, n => predicate(this.wrap(n)));
  }

  /**
   * Returns the node at a given index of the current wrapper.
   *
   * @param index
   * @returns {ReactElement}
   */
  get(index) {
    return this.nodes[index];
  }

  /**
   * Returns a wrapper around the node at a given index of the current wrapper.
   *
   * @param index
   * @returns {ShallowWrapper}
   */
  at(index) {
    return this.wrap(this.nodes[index]);
  }

  /**
   * Returns a wrapper around the first node of the current wrapper.
   *
   * @returns {ShallowWrapper}
   */
  first() {
    return this.at(0);
  }

  /**
   * Returns a wrapper around the last node of the current wrapper.
   *
   * @returns {ShallowWrapper}
   */
  last() {
    return this.at(this.length - 1);
  }

  /**
   * Returns true if the current wrapper has no nodes. False otherwise.
   *
   * @returns {boolean}
   */
  isEmpty() {
    return this.length === 0;
  }

  /**
   * Utility method that throws an error if the current instance has a length other than one.
   * This is primarily used to enforce that certain methods are only run on a wrapper when it is
   * wrapping a single node.
   *
   * @param fn
   * @returns {*}
   */
  single(fn) {
    if (this.length !== 1) {
      throw new Error(
        `This method is only meant to be run on single node. ${this.length} found instead.`
      );
    }
    return fn.call(this, this.node);
  }

  /**
   * Helpful utility method to create a new wrapper with the same root as the current wrapper, with
   * any nodes passed in as the first parameter automatically wrapped.
   *
   * @param node
   * @returns {ShallowWrapper}
   */
  wrap(node) {
    if (node instanceof ShallowWrapper) {
      return node;
    }
    return new ShallowWrapper(node, this.root);
  }

  /**
   * Returns an HTML-like string of the shallow render for debugging purposes.
   *
   * @returns {String}
   */
  debug() {
    return debugNodes(this.nodes);
  }
}
