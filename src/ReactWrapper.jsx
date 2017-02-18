import React from 'react';
import cheerio from 'cheerio';
import flatten from 'lodash/flatten';
import unique from 'lodash/uniq';
import compact from 'lodash/compact';

import ComplexSelector from './ComplexSelector';
import createWrapperComponent from './ReactWrapperComponent';
import {
  instHasClassName,
  childrenOfInst,
  parentsOfInst,
  buildInstPredicate,
  instEqual,
  instMatches,
  treeFilter,
  getNode,
  internalInstanceOrComponent,
} from './MountedTraversal';
import {
  renderWithOptions,
  Simulate,
  findDOMNode,
  unmountComponentAtNode,
} from './react-compat';
import {
  mapNativeEventNames,
  containsChildrenSubArray,
  propsOfNode,
  typeOfNode,
  displayNameOfNode,
  ITERATOR_SYMBOL,
} from './Utils';
import {
  debugInsts,
} from './Debug';
import { REACT15 } from './version';

/**
 * Finds all nodes in the current wrapper nodes' render trees that match the provided predicate
 * function.
 *
 * @param {ReactWrapper} wrapper
 * @param {Function} predicate
 * @param {Function} filter
 * @returns {ReactWrapper}
 */
function findWhereUnwrapped(wrapper, predicate, filter = treeFilter) {
  return wrapper.flatMap(n => filter(n.getNode(), predicate));
}

/**
 * Returns a new wrapper instance with only the nodes of the current wrapper instance that match
 * the provided predicate function.
 *
 * @param {ReactWrapper} wrapper
 * @param {Function} predicate
 * @returns {ReactWrapper}
 */
function filterWhereUnwrapped(wrapper, predicate) {
  return wrapper.wrap(compact(wrapper.getNodes().filter(predicate)));
}

/**
 * @class ReactWrapper
 */
class ReactWrapper {

  constructor(nodes, root, options = {}) {
    if (!global.window && !global.document) {
      throw new Error(
        'It looks like you called `mount()` without a global document being loaded.',
      );
    }

    if (!root) {
      const ReactWrapperComponent = createWrapperComponent(nodes, options);
      this.component = renderWithOptions(
        <ReactWrapperComponent
          Component={nodes.type}
          props={nodes.props}
          context={options.context}
        />,
      options);
      this.root = this;
      this.node = this.component.getWrappedComponent();
      this.nodes = [this.node];
      this.length = 1;
    } else {
      this.component = null;
      this.root = root;
      if (!nodes) {
        this.nodes = [];
      } else if (!Array.isArray(nodes)) {
        this.node = nodes;
        this.nodes = [nodes];
      } else {
        this.node = nodes[0];
        this.nodes = nodes;
      }
      this.length = this.nodes.length;
    }
    this.options = options;
    this.complexSelector = new ComplexSelector(
      buildInstPredicate,
      findWhereUnwrapped,
      childrenOfInst,
    );
  }

  /**
   * Returns the wrapped component.
   *
   * @return {ReactComponent}
   */
  getNode() {
    if (this.length !== 1) {
      throw new Error(
        'ReactWrapper::getNode() can only be called when wrapping one node',
      );
    }
    return this.nodes[0];
  }

  /**
   * Returns the the wrapped components.
   *
   * @return {Array<ReactComponent>}
   */
  getNodes() {
    return this.nodes;
  }

  /**
   * Returns the outer most DOMComponent of the current wrapper.
   *
   * NOTE: can only be called on a wrapper of a single node.
   *
   * @returns {DOMComponent}
   */
  getDOMNode() {
    return this.single('getDOMNode', findDOMNode);
  }

  /**
   * If the root component contained a ref, you can access it here
   * and get a wrapper around it.
   *
   * NOTE: can only be called on a wrapper instance that is also the root instance.
   *
   * @param {String} refname
   * @returns {ReactWrapper}
   */
  ref(refname) {
    if (this.root !== this) {
      throw new Error('ReactWrapper::ref(refname) can only be called on the root');
    }
    return this.wrap(this.instance().refs[refname]);
  }

  /**
   * Gets the instance of the component being rendered as the root node passed into `mount()`.
   *
   * NOTE: can only be called on a wrapper instance that is also the root instance.
   *
   * Example:
   * ```
   * const wrapper = mount(<MyComponent />);
   * const inst = wrapper.instance();
   * expect(inst).to.be.instanceOf(MyComponent);
   * ```
   * @returns {ReactComponent}
   */
  instance() {
    if (this.root !== this) {
      throw new Error('ReactWrapper::instance() can only be called on the root');
    }
    return this.component.getInstance();
  }

  /**
   * Forces a re-render. Useful to run before checking the render output if something external
   * may be updating the state of the component somewhere.
   *
   * NOTE: can only be called on a wrapper instance that is also the root instance.
   *
   * @returns {ReactWrapper}
   */
  update() {
    if (this.root !== this) {
      // TODO(lmr): this requirement may not be necessary for the ReactWrapper
      throw new Error('ReactWrapper::update() can only be called on the root');
    }
    this.single('update', () => {
      this.component.forceUpdate();
    });
    return this;
  }

  /**
   * A method that unmounts the component. This can be used to simulate a component going through
   * and unmount/mount lifecycle.
   *
   * @returns {ReactWrapper}
   */
  unmount() {
    if (this.root !== this) {
      throw new Error('ReactWrapper::unmount() can only be called on the root');
    }
    this.single('unmount', () => {
      this.component.setState({ mount: false });
    });
    return this;
  }

  /**
   * A method that re-mounts the component. This can be used to simulate a component going through
   * an unmount/mount lifecycle.
   *
   * @returns {ReactWrapper}
   */
  mount() {
    if (this.root !== this) {
      throw new Error('ReactWrapper::mount() can only be called on the root');
    }
    this.single('mount', () => {
      this.component.setState({ mount: true });
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
   * @param {Function} cb - callback function
   * @returns {ReactWrapper}
   */
  setProps(props, callback = undefined) {
    if (this.root !== this) {
      throw new Error('ReactWrapper::setProps() can only be called on the root');
    }
    this.component.setChildProps(props, callback);
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
   * @param {Function} cb - callback function
   * @returns {ReactWrapper}
   */
  setState(state, callback = undefined) {
    if (this.root !== this) {
      throw new Error('ReactWrapper::setState() can only be called on the root');
    }
    this.instance().setState(state, callback);
    return this;
  }

  /**
   * A method that sets the context of the root component, and re-renders. Useful for when you are
   * wanting to test how the component behaves over time with changing contexts.
   *
   * NOTE: can only be called on a wrapper instance that is also the root instance.
   *
   * @param {Object} context object
   * @returns {ReactWrapper}
   */
  setContext(context) {
    if (this.root !== this) {
      throw new Error('ReactWrapper::setContext() can only be called on the root');
    }
    if (!this.options.context) {
      throw new Error(
        'ShallowWrapper::setContext() can only be called on a wrapper that was originally passed ' +
        'a context option',
      );
    }
    this.component.setChildContext(context);
    return this;
  }

  /**
   * Whether or not a given react element matches the current render tree.
   * It will determine if the wrapper root node "looks like" the expected
   * element by checking if all props of the expected element are present
   * on the wrapper root node and equals to each other.
   *
   * Example:
   * ```
   * // MyComponent outputs <div class="foo">Hello</div>
   * const wrapper = mount(<MyComponent />);
   * expect(wrapper.matchesElement(<div>Hello</div>)).to.equal(true);
   * ```
   *
   * @param {ReactElement} node
   * @returns {Boolean}
   */
  matchesElement(node) {
    return this.single('matchesElement', () => instMatches(node, this.getNode(), (a, b) => a <= b));
  }

  /**
   * Whether or not a given react element exists in the mount render tree.
   *
   * Example:
   * ```
   * const wrapper = mount(<MyComponent />);
   * expect(wrapper.contains(<div className="foo bar" />)).to.equal(true);
   * ```
   *
   * @param {ReactElement|Array<ReactElement>} nodeOrNodes
   * @returns {Boolean}
   */
  contains(nodeOrNodes) {
    const predicate = Array.isArray(nodeOrNodes)
      ? other => containsChildrenSubArray(instEqual, other, nodeOrNodes)
      : other => instEqual(nodeOrNodes, other);
    return findWhereUnwrapped(this, predicate).length > 0;
  }

  /**
   * Whether or not a given react element exists in the current render tree.
   * It will determine if one of the wrappers element "looks like" the expected
   * element by checking if all props of the expected element are present
   * on the wrappers element and equals to each other.
   *
   * Example:
   * ```
   * // MyComponent outputs <div><div class="foo">Hello</div></div>
   * const wrapper = mount(<MyComponent />);
   * expect(wrapper.containsMatchingElement(<div>Hello</div>)).to.equal(true);
   * ```
   *
   * @param {ReactElement} node
   * @returns {Boolean}
   */
  containsMatchingElement(node) {
    const predicate = other => instMatches(node, other, (a, b) => a <= b);
    return findWhereUnwrapped(this, predicate).length > 0;
  }

  /**
   * Whether or not all the given react elements exists in the current render tree.
   * It will determine if one of the wrappers element "looks like" the expected
   * element by checking if all props of the expected element are present
   * on the wrappers element and equals to each other.
   *
   * Example:
   * ```
   * const wrapper = mount(<MyComponent />);
   * expect(wrapper.containsAllMatchingElements([
   *   <div>Hello</div>,
   *   <div>Goodbye</div>,
   * ])).to.equal(true);
   * ```
   *
   * @param {Array<ReactElement>} nodes
   * @returns {Boolean}
   */
  containsAllMatchingElements(nodes) {
    const invertedEquals = (n1, n2) => instMatches(n2, n1, (a, b) => a <= b);
    const predicate = other => containsChildrenSubArray(invertedEquals, other, nodes);
    return findWhereUnwrapped(this, predicate).length > 0;
  }

  /**
   * Whether or not one of the given react elements exists in the current render tree.
   * It will determine if one of the wrappers element "looks like" the expected
   * element by checking if all props of the expected element are present
   * on the wrappers element and equals to each other.
   *
   * Example:
   * ```
   * const wrapper = mount(<MyComponent />);
   * expect(wrapper.containsAnyMatchingElements([
   *   <div>Hello</div>,
   *   <div>Goodbye</div>,
   * ])).to.equal(true);
   * ```
   *
   * @param {Array<ReactElement>} nodes
   * @returns {Boolean}
   */
  containsAnyMatchingElements(nodes) {
    return Array.isArray(nodes) && nodes.some(node => this.containsMatchingElement(node));
  }

  /**
   * Finds every node in the render tree of the current wrapper that matches the provided selector.
   *
   * @param {String|Function} selector
   * @returns {ReactWrapper}
   */
  find(selector) {
    return this.complexSelector.find(selector, this);
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
    const predicate = buildInstPredicate(selector);
    return this.single('is', n => predicate(n));
  }

  /**
   * Returns true if the component rendered nothing, i.e., null or false.
   *
   * @returns {boolean}
   */
  isEmptyRender() {
    return this.single('isEmptyRender', (n) => {
      // Stateful components and stateless function components have different internal structures,
      // so we need to find the correct internal instance, and validate the rendered node type
      // equals 2, which is the `ReactNodeTypes.EMPTY` value.
      if (REACT15) {
        return internalInstanceOrComponent(n)._renderedNodeType === 2;
      }

      return findDOMNode(n) === null;
    });
  }

  /**
   * Returns a new wrapper instance with only the nodes of the current wrapper instance that match
   * the provided predicate function.
   *
   * @param {Function} predicate
   * @returns {ReactWrapper}
   */
  filterWhere(predicate) {
    return filterWhereUnwrapped(this, n => predicate(this.wrap(n)));
  }

  /**
   * Returns a new wrapper instance with only the nodes of the current wrapper instance that match
   * the provided selector.
   *
   * @param {String|Function} selector
   * @returns {ReactWrapper}
   */
  filter(selector) {
    const predicate = buildInstPredicate(selector);
    return filterWhereUnwrapped(this, predicate);
  }

  /**
   * Returns a new wrapper instance with only the nodes of the current wrapper that did not match
   * the provided selector. Essentially the inverse of `filter`.
   *
   * @param {String|Function} selector
   * @returns {ReactWrapper}
   */
  not(selector) {
    const predicate = buildInstPredicate(selector);
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
    return this.single('text', n => findDOMNode(n).textContent);
  }

  /**
   * Returns the HTML of the node.
   *
   * NOTE: can only be called on a wrapper of a single node.
   *
   * @returns {String}
   */
  html() {
    return this.single('html', (n) => {
      const node = findDOMNode(n);
      return node === null ? null :
        node.outerHTML.replace(/\sdata-(reactid|reactroot)+="([^"]*)+"/g, '');
    });
  }

  /**
   * Returns the current node rendered to HTML and wrapped in a CheerioWrapper.
   *
   * NOTE: can only be called on a wrapper of a single node.
   *
   * @returns {CheerioWrapper}
   */
  render() {
    const html = this.html();
    return html === null ? cheerio() : cheerio.load(html).root();
  }

  /**
   * Used to simulate events. Pass an eventname and (optionally) event arguments. This method of
   * testing events should be met with some skepticism.
   *
   * @param {String} event
   * @param {Object} mock (optional)
   * @returns {ReactWrapper}
   */
  simulate(event, mock = {}) {
    this.single('simulate', (n) => {
      const mappedEvent = mapNativeEventNames(event);
      const eventFn = Simulate[mappedEvent];
      if (!eventFn) {
        throw new TypeError(`ReactWrapper::simulate() event '${event}' does not exist`);
      }

      eventFn(findDOMNode(n), mock);
    });
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
    return this.single('props', propsOfNode);
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
      throw new Error('ReactWrapper::state() can only be called on the root');
    }
    const _state = this.single('state', () => this.instance().state);
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
      throw new Error('ReactWrapper::context() can only be called on the root');
    }
    const _context = this.single('context', () => this.instance().context);
    if (name !== undefined) {
      return _context[name];
    }
    return _context;
  }

  /**
   * Returns a new wrapper with all of the children of the current wrapper.
   *
   * @param {String|Function} [selector]
   * @returns {ReactWrapper}
   */
  children(selector) {
    const allChildren = this.flatMap(n => childrenOfInst(n.getNode()));
    return selector ? allChildren.filter(selector) : allChildren;
  }

  /**
   * Returns a new wrapper with a specific child
   *
   * @param {Number} [index]
   * @returns {ReactWrapper}
   */
  childAt(index) {
    return this.single('childAt', () => this.children().at(index));
  }

  /**
   * Returns a wrapper around all of the parents/ancestors of the wrapper. Does not include the node
   * in the current wrapper.
   *
   * NOTE: can only be called on a wrapper of a single node.
   *
   * @param {String|Function} [selector]
   * @returns {ReactWrapper}
   */
  parents(selector) {
    const allParents = this.wrap(
      this.single('parents', n => parentsOfInst(n, this.root.getNode())),
    );
    return selector ? allParents.filter(selector) : allParents;
  }

  /**
   * Returns a wrapper around the immediate parent of the current node.
   *
   * @returns {ReactWrapper}
   */
  parent() {
    return this.flatMap(n => [n.parents().get(0)]);
  }

  /**
   *
   * @param {String|Function} selector
   * @returns {ReactWrapper}
   */
  closest(selector) {
    return this.is(selector) ? this : this.parents().filter(selector).first();
  }

  /**
   * Returns the value of  prop with the given name of the root node.
   *
   * @param {String} propName
   * @returns {*}
   */
  prop(propName) {
    return this.props()[propName];
  }

  /**
   * Returns the key assigned to the current node.
   *
   * @returns {String}
   */
  key() {
    return this.single('key', n => getNode(n).key);
  }

  /**
   * Returns the type of the root node of this wrapper. If it's a composite component, this will be
   * the component constructor. If it's native DOM node, it will be a string.
   *
   * @returns {String|Function}
   */
  type() {
    return this.single('type', n => typeOfNode(getNode(n)));
  }

  /**
   * Returns the name of the root node of this wrapper.
   *
   * In order of precedence => type.displayName -> type.name -> type.
   *
   * @returns {String}
   */
  name() {
    return this.single('name', n => displayNameOfNode(getNode(n)));
  }

  /**
   * Returns whether or not the current root node has the given class name or not.
   *
   * NOTE: can only be called on a wrapper of a single node.
   *
   * @param {String} className
   * @returns {Boolean}
   */
  hasClass(className) {
    if (className && className.indexOf('.') !== -1) {
      // eslint-disable-next-line no-console
      console.warn(
        'It looks like you\'re calling `ReactWrapper::hasClass()` with a CSS selector. ' +
        'hasClass() expects a class name, not a CSS selector.',
      );
    }
    return this.single('hasClass', n => instHasClassName(n, className));
  }

  /**
   * Iterates through each node of the current wrapper and executes the provided function with a
   * wrapper around the corresponding node passed in as the first argument.
   *
   * @param {Function} fn
   * @returns {ReactWrapper}
   */
  forEach(fn) {
    this.getNodes().forEach((n, i) => fn.call(this, this.wrap(n), i));
    return this;
  }

  /**
   * Maps the current array of nodes to another array. Each node is passed in as a `ReactWrapper`
   * to the map function.
   *
   * @param {Function} fn
   * @returns {Array}
   */
  map(fn) {
    return this.getNodes().map((n, i) => fn.call(this, this.wrap(n), i));
  }

  /**
   * Reduces the current array of nodes to another array.
   * Each node is passed in as a `ShallowWrapper` to the reducer function.
   *
   * @param {Function} fn - the reducer function
   * @param {*} initialValue - the initial value
   * @returns {*}
   */
  reduce(fn, initialValue) {
    return this.getNodes().reduce(
      (accum, n, i) => fn.call(this, accum, this.wrap(n), i),
      initialValue,
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
    return this.getNodes().reduceRight(
      (accum, n, i) => fn.call(this, accum, this.wrap(n), i),
      initialValue,
    );
  }

  /**
   * Returns a new wrapper with a subset of the nodes of the original wrapper, according to the
   * rules of `Array#slice`.
   *
   * @param {Number} begin
   * @param {Number} end
   * @returns {ShallowWrapper}
   */
  slice(begin, end) {
    return this.wrap(this.getNodes().slice(begin, end));
  }

  /**
   * Returns whether or not any of the nodes in the wrapper match the provided selector.
   *
   * @param {Function|String} selector
   * @returns {Boolean}
   */
  some(selector) {
    if (this.root === this) {
      throw new Error('ReactWrapper::some() can not be called on the root');
    }
    const predicate = buildInstPredicate(selector);
    return this.getNodes().some(predicate);
  }

  /**
   * Returns whether or not any of the nodes in the wrapper pass the provided predicate function.
   *
   * @param {Function} predicate
   * @returns {Boolean}
   */
  someWhere(predicate) {
    return this.getNodes().some((n, i) => predicate.call(this, this.wrap(n), i));
  }

  /**
   * Returns whether or not all of the nodes in the wrapper match the provided selector.
   *
   * @param {Function|String} selector
   * @returns {Boolean}
   */
  every(selector) {
    const predicate = buildInstPredicate(selector);
    return this.getNodes().every(predicate);
  }

  /**
   * Returns whether or not any of the nodes in the wrapper pass the provided predicate function.
   *
   * @param {Function} predicate
   * @returns {Boolean}
   */
  everyWhere(predicate) {
    return this.getNodes().every((n, i) => predicate.call(this, this.wrap(n), i));
  }

  /**
   * Utility method used to create new wrappers with a mapping function that returns an array of
   * nodes in response to a single node wrapper. The returned wrapper is a single wrapper around
   * all of the mapped nodes flattened (and de-duplicated).
   *
   * @param {Function} fn
   * @returns {ReactWrapper}
   */
  flatMap(fn) {
    const nodes = this.getNodes().map((n, i) => fn.call(this, this.wrap(n), i));
    const flattened = flatten(nodes, true);
    const uniques = unique(flattened);
    const compacted = compact(uniques);
    return this.wrap(compacted);
  }

  /**
   * Finds all nodes in the current wrapper nodes' render trees that match the provided predicate
   * function.
   *
   * @param {Function} predicate
   * @returns {ReactWrapper}
   */
  findWhere(predicate) {
    return findWhereUnwrapped(this, n => predicate(this.wrap(n)));
  }

  /**
   * Returns the node at a given index of the current wrapper.
   *
   * @param {Number} index
   * @returns {ReactElement}
   */
  get(index) {
    return this.getNodes()[index];
  }

  /**
   * Returns a wrapper around the node at a given index of the current wrapper.
   *
   * @param {Number} index
   * @returns {ReactWrapper}
   */
  at(index) {
    return this.wrap(this.getNodes()[index]);
  }

  /**
   * Returns a wrapper around the first node of the current wrapper.
   *
   * @returns {ReactWrapper}
   */
  first() {
    return this.at(0);
  }

  /**
   * Returns a wrapper around the last node of the current wrapper.
   *
   * @returns {ReactWrapper}
   */
  last() {
    return this.at(this.length - 1);
  }

  /**
   * Delegates to exists()
   *
   * @returns {boolean}
   */
  isEmpty() {
    // eslint-disable-next-line no-console
    console.warn('Enzyme::Deprecated method isEmpty() called, use exists() instead.');
    return !this.exists();
  }

  /**
   * Returns true if the current wrapper has nodes. False otherwise.
   *
   * @returns {boolean}
   */
  exists() {
    return this.length > 0;
  }

  /**
   * Utility method that throws an error if the current instance has a length other than one.
   * This is primarily used to enforce that certain methods are only run on a wrapper when it is
   * wrapping a single node.
   *
   * @param {Function} fn
   * @returns {*}
   */
  single(name, fn) {
    const fnName = typeof name === 'string' ? name : 'unknown';
    const callback = typeof fn === 'function' ? fn : name;
    if (this.length !== 1) {
      throw new Error(
        `Method “${fnName}” is only meant to be run on a single node. ${this.length} found instead.`,
      );
    }
    return callback.call(this, this.getNode());
  }

  /**
   * Helpful utility method to create a new wrapper with the same root as the current wrapper, with
   * any nodes passed in as the first parameter automatically wrapped.
   *
   * @param {ReactWrapper|ReactElement|Array<ReactElement>} node
   * @returns {ReactWrapper}
   */
  wrap(node) {
    if (node instanceof ReactWrapper) {
      return node;
    }
    return new ReactWrapper(node, this.root);
  }

  /**
   * Returns an HTML-like string of the shallow render for debugging purposes.
   *
   * @returns {String}
   */
  debug() {
    return debugInsts(this.getNodes());
  }

  /**
   * Invokes intercepter and returns itself. intercepter is called with itself.
   * This is helpful when debugging nodes in method chains.
   * @param fn
   * @returns {ReactWrapper}
   */
  tap(intercepter) {
    intercepter(this);
    return this;
  }

  /**
   * Detaches the react tree from the DOM. Runs `ReactDOM.unmountComponentAtNode()` under the hood.
   *
   * This method will most commonly be used as a "cleanup" method if you decide to use the
   * `attachTo` option in `mount(node, options)`.
   *
   * The method is intentionally not "fluent" (in that it doesn't return `this`) because you should
   * not be doing anything with this wrapper after this method is called.
   */
  detach() {
    if (this.root !== this) {
      throw new Error('ReactWrapper::detach() can only be called on the root');
    }
    if (!this.options.attachTo) {
      throw new Error(
        'ReactWrapper::detach() can only be called on when the `attachTo` option was passed into ' +
        '`mount()`.',
      );
    }
    unmountComponentAtNode(this.options.attachTo);
  }
}


if (ITERATOR_SYMBOL) {
  Object.defineProperty(ReactWrapper.prototype, ITERATOR_SYMBOL, {
    configurable: true,
    value: function iterator() {
      return this.nodes[ITERATOR_SYMBOL]();
    },
  });
}

export default ReactWrapper;
