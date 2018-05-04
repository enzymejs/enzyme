import React from 'react';
import cheerio from 'cheerio';
import ReactDOM from 'react-dom';
import ReactDOMServer from 'react-dom/server';
import ReactTestRendererAdapter from './ReactTestRendererAdapter';
import ReactTestInstance from './ReactTestInstance';

import { reduceTreesBySelector } from './selectors';

const noop = () => {};

const flatMap = (collection, fn) =>
  collection.map(fn).reduce((curr, existing) => [...existing, ...curr], []);

const instanceToElement = instance => React.createElement(instance.type, instance.props);

class ReactMountWrapper {
  constructor(instances, rootWrapper, rootNode) {
    // private api
    this.instances = instances;
    this.rootWrapper = rootWrapper;
    this.rootNode = rootNode;
    // public api
    this.length = instances.length;
  }

  /**
   * Returns a wrapper around the node at a given index of the current wrapper.
   *
   * @param {Number} index
   * @returns {ReactWrapper}
   */
  at(index) {
    return new ReactMountWrapper([this.instances[index]], this.rootWrapper, this.rootNode);
  }

  /**
   * Returns a new wrapper with all of the children of the current wrapper.
   *
   * @param {String|Function} [selector]
   * @returns {ReactWrapper}
   */
  children(selector) {
    return new ReactMountWrapper(
      flatMap(this.instances, instance => instance.children),
      this.rootWrapper,
      this.rootNode,
    );
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
    if (this.isRoot()) {
      throw new Error('ReactWrapper::context() can only be called on the root');
    }
    const rootInstance = this.single('context', instance => instance.instance);
    if (rootInstance === null) {
      throw new Error('ReactWrapper::context() can only be called on components with instances');
    }
    const _context = rootInstance.context;
    if (typeof name !== 'undefined') {
      return _context[name];
    }
    return _context;
  }

  /**
   * Finds every node in the render tree of the current wrapper that matches the provided selector.
   *
   * @param {String|Function} selector
   * @returns {ReactWrapper}
   */
  find(selector) {
    return new ReactMountWrapper(
      reduceTreesBySelector(selector, this.instances),
      this.rootWrapper,
      this.rootNode,
    );
  }

  /**
   * Finds all nodes in the current wrapper nodes' render trees that match the provided predicate
   * function.
   *
   * @param {Function} predicate
   * @returns {ReactWrapper}
   */
  findWhere(predicate) {
    return new ReactMountWrapper(
      flatMap(this.instances, instance =>
        instance.findAll(testInstance =>
          predicate(new ReactMountWrapper([testInstance], this.rootWrapper, this.rootNode)))),
      this.rootWrapper,
      this.rootNode,
    );
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
   * Returns the HTML of the node.
   *
   * @returns {String}
   */
  html() {
    const markup = ReactDOMServer.renderToStaticMarkup(this.instances.map(instanceToElement));
    return markup.length > 0 ? markup : null;
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
    return this.single('instance', instance => instance.instance);
  }

  /**
   * Returns true if the component rendered nothing, i.e., null or false.
   *
   * @returns {boolean}
   */
  isEmptyRender() {
    return this.html() === null;
  }

  isRoot() {
    const [first] = this.instances;
    return first && first.parent.instance !== this.rootWrapper;
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
   * Returns the name of the root node of this wrapper.
   *
   * In order of precedence => type.displayName -> type.name -> type.
   *
   * @returns {String}
   */
  name() {
    return this.single('name', (instance) => {
      const { type } = instance;
      return type.displayName || type.name || type;
    });
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
   * Returns the props hash for the root node of the wrapper.
   *
   * NOTE: can only be called on a wrapper of a single node.
   *
   * @returns {Object}
   */
  props() {
    return this.single('props', instance => instance.props);
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
    return html === null ? cheerio() : cheerio.load('')(html);
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
    if (this.isRoot()) {
      throw new Error('ReactWrapper::setContext() can only be called on the root');
    }
    if (!this.instances[0].parent.props.context) {
      throw new Error('ShallowWrapper::setContext() can only be called on a wrapper that was originally passed a context option');
    }
    this.rootWrapper.setChildProps({}, context);
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
  setProps(props, callback = noop) {
    if (this.isRoot()) {
      throw new Error('ReactWrapper::setProps() can only be called on the root');
    }
    if (typeof callback !== 'function') {
      throw new TypeError('ReactWrapper::setProps() expects a function as its second argument');
    }
    this.rootWrapper.setChildProps(props, {}, callback);
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
  setState(state, callback = noop) {
    if (this.isRoot()) {
      throw new Error('ReactWrapper::setState() can only be called on the root');
    }
    if (typeof callback !== 'function') {
      throw new TypeError('ReactWrapper::setState() expects a function as its second argument');
    }
    this.instance().setState(state, () => {
      callback();
    });
    return this;
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
      throw new Error(`Method “${fnName}” is only meant to be run on a single node. ${
        this.length
      } found instead.`);
    }
    return callback.call(this, this.instances[0]);
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
    if (this.isRoot()) {
      throw new Error('ReactWrapper::state() can only be called on the root');
    }
    const _state = this.single('state', instance => instance.instance.state);
    if (typeof name !== 'undefined') {
      return _state[name];
    }
    return _state;
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
    return this.single(
      'text',
      instance => (instance.instance ? ReactDOM.findDOMNode(instance.instance).textContent : ''),
    );
  }

  /**
   * Returns the type of the root node of this wrapper. If it's a composite component, this will be
   * the component constructor. If it's native DOM node, it will be a string.
   *
   * @returns {String|Function}
   */
  type() {
    return this.single('type', instance => instance.type);
  }
}

const createWrapper = (rootNode, passedOptions = {}) => {
  const adapter = new ReactTestRendererAdapter();
  const renderer = adapter.createMountRenderer(passedOptions);
  const rootWrapper = renderer.render(rootNode, passedOptions.context);
  const rootInstance = new ReactTestInstance(rootWrapper._reactInternalFiber);
  return new ReactMountWrapper(rootInstance.children, rootWrapper, rootNode);
};

module.exports = createWrapper;
