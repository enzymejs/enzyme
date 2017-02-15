import React from 'react';
import flatten from 'lodash/flatten';
import unique from 'lodash/uniq';
import compact from 'lodash/compact';
import cheerio from 'cheerio';
import assign from 'object.assign';

import ComplexSelector from './ComplexSelector';
import {
  nodeEqual,
  nodeMatches,
  containsChildrenSubArray,
  propFromEvent,
  withSetStateAllowed,
  propsOfNode,
  typeOfNode,
  isReactElementAlike,
  displayNameOfNode,
  isFunctionalComponent,
  isCustomComponentElement,
  ITERATOR_SYMBOL,
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
  batchedUpdates,
  isDOMComponentElement,
} from './react-compat';

/**
 * Finds all nodes in the current wrapper nodes' render trees that match the provided predicate
 * function.
 *
 * @param {ShallowWrapper} wrapper
 * @param {Function} predicate
 * @param {Function} filter
 * @returns {ShallowWrapper}
 */
function findWhereUnwrapped(wrapper, predicate, filter = treeFilter) {
  return wrapper.flatMap(n => filter(n.getNode(), predicate));
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
  return wrapper.wrap(compact(wrapper.getNodes().filter(predicate)));
}

/**
 * @class ShallowWrapper
 */
class ShallowWrapper {

  constructor(nodes, root, options = {}) {
    if (!root) {
      this.root = this;
      this.unrendered = nodes;
      this.renderer = createShallowRenderer();
      withSetStateAllowed(() => {
        batchedUpdates(() => {
          this.renderer.render(nodes, options.context);
          const instance = this.instance();
          if (
            options.lifecycleExperimental &&
            instance &&
            typeof instance.componentDidMount === 'function'
          ) {
            instance.componentDidMount();
          }
        });
      });
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
    this.complexSelector = new ComplexSelector(buildPredicate, findWhereUnwrapped, childrenOfNode);
  }

  /**
   * Returns the wrapped ReactElement.
   *
   * @return {ReactElement}
   */
  getNode() {
    if (this.length !== 1) {
      throw new Error(
        'ShallowWrapper::getNode() can only be called when wrapping one node',
      );
    }
    return this.root === this ? this.renderer.getRenderOutput() : this.node;
  }

  /**
   * Returns the wrapped ReactElements.
   *
   * @return {Array<ReactElement>}
   */
  getNodes() {
    return this.root === this ? [this.renderer.getRenderOutput()] : this.nodes;
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
    if (this.root !== this) {
      throw new Error('ShallowWrapper::instance() can only be called on the root');
    }
    return this.renderer._instance ? this.renderer._instance._instance : null;
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
    this.single('update', () => {
      this.node = this.renderer.getRenderOutput();
      this.nodes = [this.node];
    });
    return this;
  }

  /**
   * A method is for re-render with new props and context.
   * This calls componentDidUpdate method if lifecycleExperimental is enabled.
   *
   * NOTE: can only be called on a wrapper instance that is also the root instance.
   *
   * @param {Object} props
   * @param {Object} context
   * @returns {ShallowWrapper}
   */
  rerender(props, context) {
    this.single('rerender', () => {
      withSetStateAllowed(() => {
        const instance = this.instance();
        const state = instance.state;
        const prevProps = instance.props;
        const prevContext = instance.context;
        const nextProps = props || prevProps;
        const nextContext = context || prevContext;
        batchedUpdates(() => {
          let shouldRender = true;
          // dirty hack:
          // make sure that componentWillReceiveProps is called before shouldComponentUpdate
          let originalComponentWillReceiveProps;
          if (
            this.options.lifecycleExperimental &&
            instance &&
            typeof instance.componentWillReceiveProps === 'function'
          ) {
            instance.componentWillReceiveProps(nextProps, nextContext);
            originalComponentWillReceiveProps = instance.componentWillReceiveProps;
            instance.componentWillReceiveProps = () => {};
          }
          // dirty hack: avoid calling shouldComponentUpdate twice
          let originalShouldComponentUpdate;
          if (
            this.options.lifecycleExperimental &&
            instance &&
            typeof instance.shouldComponentUpdate === 'function'
          ) {
            shouldRender = instance.shouldComponentUpdate(nextProps, state, nextContext);
            originalShouldComponentUpdate = instance.shouldComponentUpdate;
          }
          if (shouldRender) {
            if (props) this.unrendered = React.cloneElement(this.unrendered, props);
            if (originalShouldComponentUpdate) {
              instance.shouldComponentUpdate = () => true;
            }

            this.renderer.render(this.unrendered, nextContext);

            if (originalShouldComponentUpdate) {
              instance.shouldComponentUpdate = originalShouldComponentUpdate;
            }
            if (
              this.options.lifecycleExperimental &&
              instance &&
              typeof instance.componentDidUpdate === 'function'
            ) {
              instance.componentDidUpdate(prevProps, state, prevContext);
            }
            this.update();
          // If it doesn't need to rerender, update only its props.
          } else if (props) {
            instance.props = props;
          }
          if (originalComponentWillReceiveProps) {
            instance.componentWillReceiveProps = originalComponentWillReceiveProps;
          }
        });
      });
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
    return this.rerender(props);
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
   * @returns {ShallowWrapper}
   */
  setState(state, callback = undefined) {
    if (this.root !== this) {
      throw new Error('ShallowWrapper::setState() can only be called on the root');
    }
    if (isFunctionalComponent(this.instance())) {
      throw new Error('ShallowWrapper::setState() can only be called on class components');
    }
    this.single('setState', () => {
      withSetStateAllowed(() => {
        this.instance().setState(state, callback);
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
        'a context option',
      );
    }
    return this.rerender(null, context);
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
    if (!isReactElementAlike(nodeOrNodes)) {
      throw new Error(
        'ShallowWrapper::contains() can only be called with ReactElement (or array of them), ' +
        'string or number as argument.',
      );
    }

    const predicate = Array.isArray(nodeOrNodes)
      ? other => containsChildrenSubArray(nodeEqual, other, nodeOrNodes)
      : other => nodeEqual(nodeOrNodes, other);

    return findWhereUnwrapped(this, predicate).length > 0;
  }

  /**
   * Whether or not a given react element exists in the shallow render tree.
   * Match is based on the expected element and not on wrappers element.
   * It will determine if one of the wrappers element "looks like" the expected
   * element by checking if all props of the expected element are present
   * on the wrappers element and equals to each other.
   *
   * Example:
   * ```
   * // MyComponent outputs <div><div class="foo">Hello</div></div>
   * const wrapper = shallow(<MyComponent />);
   * expect(wrapper.containsMatchingElement(<div>Hello</div>)).to.equal(true);
   * ```
   *
   * @param {ReactElement} node
   * @returns {Boolean}
   */
  containsMatchingElement(node) {
    const predicate = other => nodeMatches(node, other, (a, b) => a <= b);
    return findWhereUnwrapped(this, predicate).length > 0;
  }

  /**
   * Whether or not all the given react elements exists in the shallow render tree.
   * Match is based on the expected element and not on wrappers element.
   * It will determine if one of the wrappers element "looks like" the expected
   * element by checking if all props of the expected element are present
   * on the wrappers element and equals to each other.
   *
   * Example:
   * ```
   * const wrapper = shallow(<MyComponent />);
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
    const invertedEquals = (n1, n2) => nodeMatches(n2, n1, (a, b) => a <= b);
    const predicate = other => containsChildrenSubArray(invertedEquals, other, nodes);
    return findWhereUnwrapped(this, predicate).length > 0;
  }

  /**
   * Whether or not one of the given react elements exists in the shallow render tree.
   * Match is based on the expected element and not on wrappers element.
   * It will determine if one of the wrappers element "looks like" the expected
   * element by checking if all props of the expected element are present
   * on the wrappers element and equals to each other.
   *
   * Example:
   * ```
   * const wrapper = shallow(<MyComponent />);
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
    return this.single('equals', () => nodeEqual(this.getNode(), node));
  }

  /**
   * Whether or not a given react element matches the shallow render tree.
   * Match is based on the expected element and not on wrapper root node.
   * It will determine if the wrapper root node "looks like" the expected
   * element by checking if all props of the expected element are present
   * on the wrapper root node and equals to each other.
   *
   * Example:
   * ```
   * // MyComponent outputs <div class="foo">Hello</div>
   * const wrapper = shallow(<MyComponent />);
   * expect(wrapper.matchesElement(<div>Hello</div>)).to.equal(true);
   * ```
   *
   * @param {ReactElement} node
   * @returns {Boolean}
   */
  matchesElement(node) {
    return this.single('matchesElement', () => nodeMatches(node, this.getNode(), (a, b) => a <= b));
  }

  /**
   * Finds every node in the render tree of the current wrapper that matches the provided selector.
   *
   * @param {String|Function} selector
   * @returns {ShallowWrapper}
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
    const predicate = buildPredicate(selector);
    return this.single('is', n => predicate(n));
  }

  /**
   * Returns true if the component rendered nothing, i.e., null or false.
   *
   * @returns {boolean}
   */
  isEmptyRender() {
    return this.type() === null;
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
    return this.single('text', getTextFromNode);
  }

  /**
   * Returns the HTML of the node.
   *
   * NOTE: can only be called on a wrapper of a single node.
   *
   * @returns {String}
   */
  html() {
    return this.single('html', n => (this.type() === null ? null : renderToStaticMarkup(n)));
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
        batchedUpdates(() => {
          handler(...args);
        });
        this.root.update();
      });
    }
    return this;
  }

  /**
   * Returns the props hash for the current node of the wrapper.
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
      throw new Error('ShallowWrapper::state() can only be called on the root');
    }
    if (isFunctionalComponent(this.instance())) {
      throw new Error('ShallowWrapper::state() can only be called on class components');
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
      throw new Error('ShallowWrapper::context() can only be called on the root');
    }
    if (!this.options.context) {
      throw new Error(
        'ShallowWrapper::context() can only be called on a wrapper that was originally passed ' +
        'a context option',
      );
    }
    const _context = this.single('context', () => this.instance().context);
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
    const allChildren = this.flatMap(n => childrenOfNode(n.getNode()));
    return selector ? allChildren.filter(selector) : allChildren;
  }

  /**
   * Returns a new wrapper with a specific child
   *
   * @param {Number} [index]
   * @returns {ShallowWrapper}
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
   * @returns {ShallowWrapper}
   */
  parents(selector) {
    const allParents = this.wrap(
        this.single('parents', n => parentsOfNode(n, this.root.getNode())),
    );
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
    return this.single('shallow', n => new ShallowWrapper(n, null, options));
  }

  /**
   * Returns the value of prop with the given name of the current node.
   *
   * @param propName
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
    return this.single('key', n => n.key);
  }

  /**
   * Returns the type of the current node of this wrapper. If it's a composite component, this will
   * be the component constructor. If it's a native DOM node, it will be a string.
   *
   * @returns {String|Function}
   */
  type() {
    return this.single('type', typeOfNode);
  }

  /**
   * Returns the name of the current node of this wrapper.
   *
   * In order of precedence => type.displayName -> type.name -> type.
   *
   * @returns {String}
   */
  name() {
    return this.single('name', displayNameOfNode);
  }

  /**
   * Returns whether or not the current node has the given class name or not.
   *
   * NOTE: can only be called on a wrapper of a single node.
   *
   * @param className
   * @returns {Boolean}
   */
  hasClass(className) {
    if (className && className.indexOf('.') !== -1) {
      // eslint-disable-next-line no-console
      console.warn(
        'It looks like you\'re calling `ShallowWrapper::hasClass()` with a CSS selector. ' +
        'hasClass() expects a class name, not a CSS selector.',
      );
    }
    return this.single('hasClass', n => hasClassName(n, className));
  }

  /**
   * Iterates through each node of the current wrapper and executes the provided function with a
   * wrapper around the corresponding node passed in as the first argument.
   *
   * @param {Function} fn
   * @returns {ShallowWrapper}
   */
  forEach(fn) {
    this.getNodes().forEach((n, i) => fn.call(this, this.wrap(n), i));
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
    return this.getNodes().map((n, i) => fn.call(this, this.wrap(n), i));
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
      throw new Error('ShallowWrapper::some() can not be called on the root');
    }
    const predicate = buildPredicate(selector);
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
    const predicate = buildPredicate(selector);
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
   * @returns {ShallowWrapper}
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
    return this.getNodes()[index];
  }

  /**
   * Returns a wrapper around the node at a given index of the current wrapper.
   *
   * @param index
   * @returns {ShallowWrapper}
   */
  at(index) {
    return this.wrap(this.getNodes()[index]);
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
   * @param fn
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
    return debugNodes(this.getNodes());
  }

  /**
   * Invokes intercepter and returns itself. intercepter is called with itself.
   * This is helpful when debugging nodes in method chains.
   * @param fn
   * @returns {ShallowWrapper}
   */
  tap(intercepter) {
    intercepter(this);
    return this;
  }

  /**
   * Primarily useful for HOCs (higher-order components), this method may only be
   * run on a single, non-DOM node, and will return the node, shallow-rendered.
   *
   * @param options object
   * @returns {ShallowWrapper}
   */
  dive(options = {}) {
    const name = 'dive';
    return this.single(name, (n) => {
      if (isDOMComponentElement(n)) {
        throw new TypeError(`ShallowWrapper::${name}() can not be called on DOM components`);
      }
      if (!isCustomComponentElement(n)) {
        throw new TypeError(`ShallowWrapper::${name}() can only be called on components`);
      }
      return new ShallowWrapper(n, null, assign({}, this.options, options));
    });
  }
}

if (ITERATOR_SYMBOL) {
  Object.defineProperty(ShallowWrapper.prototype, ITERATOR_SYMBOL, {
    configurable: true,
    value: function iterator() {
      return this.nodes[ITERATOR_SYMBOL]();
    },
  });
}

export default ShallowWrapper;
