import React from 'react';
import ReactDOM from 'react-dom';
// eslint-disable-next-line import/no-unresolved, import/extensions
import ReactDOMServer from 'react-dom/server';
// eslint-disable-next-line import/no-unresolved, import/extensions
import TestUtils from 'react-addons-test-utils';
import values from 'object.values';
import { isElement, isValidElementType } from 'react-is';
import { EnzymeAdapter } from 'enzyme';
import {
  displayNameOfNode,
  elementToTree,
  mapNativeEventNames,
  propFromEvent,
  withSetStateAllowed,
  assertDomAvailable,
  createRenderWrapper,
  createMountWrapper,
  propsWithKeysAndRef,
  ensureKeyOrUndefined,
  wrap,
  RootFinder,
  getNodeFromRootFinder,
  wrapWithWrappingComponent,
  getWrappingComponentMountRenderer,
} from 'enzyme-adapter-utils';

function typeToNodeType(type) {
  if (typeof type === 'function') {
    if (type.prototype && typeof type.prototype.render === 'function') {
      return 'class';
    }
    return 'function';
  }
  return 'host';
}

function instanceToTree(inst) {
  if (!inst || typeof inst !== 'object') {
    return inst;
  }
  const el = inst._currentElement;
  if (!el) {
    return null;
  }
  if (typeof el !== 'object') {
    return el;
  }
  if (inst._tag) {
    if (typeof el !== 'object') {
      return el;
    }
    const children = inst._renderedChildren || { '.0': el.props.children };
    return {
      nodeType: 'host',
      type: el.type,
      props: el.props,
      key: ensureKeyOrUndefined(el.key),
      ref: el.ref,
      instance: ReactDOM.findDOMNode(inst.getPublicInstance()) || null,
      rendered: values(children).map(instanceToTree),
    };
  }
  if (inst._renderedComponent) {
    return {
      nodeType: typeToNodeType(el.type),
      type: el.type,
      props: el.props,
      key: ensureKeyOrUndefined(el.key),
      ref: el.ref,
      instance: inst._instance || null,
      rendered: instanceToTree(inst._renderedComponent),
    };
  }
  throw new Error('Enzyme Internal Error: unknown instance encountered');
}

class ReactFourteenAdapter extends EnzymeAdapter {
  constructor() {
    super();

    const { lifecycles } = this.options;
    this.options = {
      ...this.options,
      supportPrevContextArgumentOfComponentDidUpdate: true, // TODO: remove, semver-major
      legacyContextMode: 'parent',
      lifecycles: {
        ...lifecycles,
        componentDidUpdate: {
          prevContext: true,
        },
        getChildContext: {
          calledByRenderer: true,
        },
      },
    };
  }

  createMountRenderer(options) {
    assertDomAvailable('mount');
    const domNode = options.attachTo || global.document.createElement('div');
    let instance = null;
    const adapter = this;
    return {
      render(el, context, callback) {
        if (instance === null) {
          const { type, props, ref } = el;
          const wrapperProps = {
            Component: type,
            wrappingComponentProps: options.wrappingComponentProps,
            props,
            context,
            ...(ref && { refProp: ref }),
          };
          const ReactWrapperComponent = createMountWrapper(el, { ...options, adapter });
          const wrappedEl = React.createElement(ReactWrapperComponent, wrapperProps);
          instance = ReactDOM.render(wrappedEl, domNode);
          if (typeof callback === 'function') {
            callback();
          }
        } else {
          instance.setChildProps(el.props, context, callback);
        }
      },
      unmount() {
        ReactDOM.unmountComponentAtNode(domNode);
        instance = null;
      },
      getNode() {
        if (!instance) {
          return null;
        }
        return getNodeFromRootFinder(
          adapter.isCustomComponent,
          instanceToTree(instance._reactInternalInstance),
          options,
        );
      },
      simulateEvent(node, event, mock) {
        const mappedEvent = mapNativeEventNames(event);
        const eventFn = TestUtils.Simulate[mappedEvent];
        if (!eventFn) {
          throw new TypeError(`ReactWrapper::simulate() event '${event}' does not exist`);
        }
        // eslint-disable-next-line react/no-find-dom-node
        eventFn(ReactDOM.findDOMNode(node.instance), mock);
      },
      batchedUpdates(fn) {
        return ReactDOM.unstable_batchedUpdates(fn);
      },
      getWrappingComponentRenderer() {
        return {
          ...this,
          ...getWrappingComponentMountRenderer({
            toTree: (inst) => instanceToTree(inst._reactInternalInstance),
            getMountWrapperInstance: () => instance,
          }),
        };
      },
    };
  }

  createShallowRenderer(/* options */) {
    const renderer = TestUtils.createRenderer();
    let isDOM = false;
    let cachedNode = null;
    return {
      render(el, context) {
        cachedNode = el;
        /* eslint consistent-return: 0 */
        if (typeof el.type === 'string') {
          isDOM = true;
        } else {
          isDOM = false;
          return withSetStateAllowed(() => renderer.render(el, context));
        }
      },
      unmount() {
        renderer.unmount();
      },
      getNode() {
        if (isDOM) {
          return elementToTree(cachedNode);
        }
        const output = renderer.getRenderOutput();
        return {
          nodeType: typeToNodeType(cachedNode.type),
          type: cachedNode.type,
          props: cachedNode.props,
          key: ensureKeyOrUndefined(cachedNode.key),
          ref: cachedNode.ref,
          instance: renderer._instance._instance,
          rendered: elementToTree(output),
        };
      },
      simulateEvent(node, event, ...args) {
        const handler = node.props[propFromEvent(event)];
        if (handler) {
          withSetStateAllowed(() => {
            // TODO(lmr): create/use synthetic events
            // TODO(lmr): emulate React's event propagation
            ReactDOM.unstable_batchedUpdates(() => {
              handler(...args);
            });
          });
        }
      },
      batchedUpdates(fn) {
        return withSetStateAllowed(() => ReactDOM.unstable_batchedUpdates(fn));
      },
    };
  }

  createStringRenderer(options) {
    return {
      render(el, context) {
        if (options.context && (el.type.contextTypes || options.childContextTypes)) {
          const childContextTypes = {
            ...(el.type.contextTypes || {}),
            ...options.childContextTypes,
          };
          const ContextWrapper = createRenderWrapper(el, context, childContextTypes);
          return ReactDOMServer.renderToStaticMarkup(React.createElement(ContextWrapper));
        }
        return ReactDOMServer.renderToStaticMarkup(el);
      },
    };
  }

  // Provided a bag of options, return an `EnzymeRenderer`. Some options can be implementation
  // specific, like `attach` etc. for React, but not part of this interface explicitly.
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  createRenderer(options) {
    switch (options.mode) {
      case EnzymeAdapter.MODES.MOUNT: return this.createMountRenderer(options);
      case EnzymeAdapter.MODES.SHALLOW: return this.createShallowRenderer(options);
      case EnzymeAdapter.MODES.STRING: return this.createStringRenderer(options);
      default:
        throw new Error(`Enzyme Internal Error: Unrecognized mode: ${options.mode}`);
    }
  }

  wrap(element) {
    return wrap(element);
  }

  // converts an RSTNode to the corresponding JSX Pragma Element. This will be needed
  // in order to implement the `Wrapper.mount()` and `Wrapper.shallow()` methods, but should
  // be pretty straightforward for people to implement.
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  nodeToElement(node) {
    if (!node || typeof node !== 'object') return null;
    return React.createElement(node.type, propsWithKeysAndRef(node));
  }

  elementToNode(element) {
    return elementToTree(element);
  }

  nodeToHostNode(node) {
    return ReactDOM.findDOMNode(node.instance);
  }

  displayNameOfNode(node) {
    return displayNameOfNode(node);
  }

  isValidElement(element) {
    return isElement(element);
  }

  isValidElementType(object) {
    return isValidElementType(object);
  }

  isCustomComponent(component) {
    return typeof component === 'function';
  }

  createElement(...args) {
    return React.createElement(...args);
  }

  wrapWithWrappingComponent(node, options) {
    return {
      RootFinder,
      node: wrapWithWrappingComponent(React.createElement, node, options),
    };
  }
}

module.exports = ReactFourteenAdapter;
