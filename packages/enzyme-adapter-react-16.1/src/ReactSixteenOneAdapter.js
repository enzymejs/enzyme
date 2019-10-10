/* eslint no-use-before-define: 0 */
import React from 'react';
import ReactDOM from 'react-dom';
// eslint-disable-next-line import/no-unresolved
import ReactDOMServer from 'react-dom/server';
// eslint-disable-next-line import/no-unresolved
import ShallowRenderer from 'react-test-renderer/shallow';
// eslint-disable-next-line import/no-unresolved
import TestUtils from 'react-dom/test-utils';
import checkPropTypes from 'prop-types/checkPropTypes';
import {
  isElement,
  isPortal,
  isValidElementType,
  Fragment,
  Portal,
} from 'react-is';
import { EnzymeAdapter } from 'enzyme';
import {
  displayNameOfNode,
  elementToTree as utilElementToTree,
  nodeTypeFromType as utilNodeTypeFromType,
  mapNativeEventNames,
  propFromEvent,
  assertDomAvailable,
  withSetStateAllowed,
  createRenderWrapper,
  createMountWrapper,
  propsWithKeysAndRef,
  ensureKeyOrUndefined,
  simulateError,
  wrap,
  getMaskedContext,
  getComponentStack,
  RootFinder,
  getNodeFromRootFinder,
  wrapWithWrappingComponent,
  getWrappingComponentMountRenderer,
} from 'enzyme-adapter-utils';
import { findCurrentFiberUsingSlowPath } from 'react-reconciler/reflection';

const HostRoot = 3;
const ClassComponent = 2;
const FunctionalComponent = 1;
const HostPortal = 4;
const HostComponent = 5;
const HostText = 6;
const FragmentType = 10;
const Mode = 11;

function nodeAndSiblingsArray(nodeWithSibling) {
  const array = [];
  let node = nodeWithSibling;
  while (node != null) {
    array.push(node);
    node = node.sibling;
  }
  return array;
}

const displayNamesByType = {
  [Fragment]: 'Fragment',
  [Portal]: 'Portal',
};

function flatten(arr) {
  const result = [];
  const stack = [{ i: 0, array: arr }];
  while (stack.length) {
    const n = stack.pop();
    while (n.i < n.array.length) {
      const el = n.array[n.i];
      n.i += 1;
      if (Array.isArray(el)) {
        stack.push(n);
        stack.push({ i: 0, array: el });
        break;
      }
      result.push(el);
    }
  }
  return result;
}

function nodeTypeFromType(type) {
  if (type === Portal) {
    return 'portal';
  }

  return utilNodeTypeFromType(type);
}

function elementToTree(el) {
  if (!isPortal(el)) {
    return utilElementToTree(el, elementToTree);
  }

  const { children, containerInfo } = el;
  const props = { children, containerInfo };

  return {
    nodeType: 'portal',
    type: Portal,
    props,
    key: ensureKeyOrUndefined(el.key),
    ref: el.ref || null,
    instance: null,
    rendered: elementToTree(el.children),
  };
}

function toTree(vnode) {
  if (vnode == null) {
    return null;
  }
  // TODO(lmr): I'm not really sure I understand whether or not this is what
  // i should be doing, or if this is a hack for something i'm doing wrong
  // somewhere else. Should talk to sebastian about this perhaps
  const node = findCurrentFiberUsingSlowPath(vnode);
  switch (node.tag) {
    case HostRoot: // 3
      return childrenToTree(node.child);
    case HostPortal: { // 4
      const {
        stateNode: { containerInfo },
        memoizedProps: children,
      } = node;
      const props = { containerInfo, children };
      return {
        nodeType: 'portal',
        type: Portal,
        props,
        key: ensureKeyOrUndefined(node.key),
        ref: node.ref,
        instance: null,
        rendered: childrenToTree(node.child),
      };
    }
    case ClassComponent:
      return {
        nodeType: 'class',
        type: node.type,
        props: { ...node.memoizedProps },
        key: ensureKeyOrUndefined(node.key),
        ref: node.ref,
        instance: node.stateNode,
        rendered: childrenToTree(node.child),
      };
    case FunctionalComponent: // 1
      return {
        nodeType: 'function',
        type: node.type,
        props: { ...node.memoizedProps },
        key: ensureKeyOrUndefined(node.key),
        ref: node.ref,
        instance: null,
        rendered: childrenToTree(node.child),
      };
    case HostComponent: { // 5
      let renderedNodes = flatten(nodeAndSiblingsArray(node.child).map(toTree));
      if (renderedNodes.length === 0) {
        renderedNodes = [node.memoizedProps.children];
      }
      return {
        nodeType: 'host',
        type: node.type,
        props: { ...node.memoizedProps },
        key: ensureKeyOrUndefined(node.key),
        ref: node.ref,
        instance: node.stateNode,
        rendered: renderedNodes,
      };
    }
    case HostText: // 6
      return node.memoizedProps;
    case FragmentType: // 10
    case Mode: // 11
      return childrenToTree(node.child);
    default:
      throw new Error(`Enzyme Internal Error: unknown node with tag ${node.tag}`);
  }
}

function childrenToTree(node) {
  if (!node) {
    return null;
  }
  const children = nodeAndSiblingsArray(node);
  if (children.length === 0) {
    return null;
  }
  if (children.length === 1) {
    return toTree(children[0]);
  }
  return flatten(children.map(toTree));
}

function nodeToHostNode(_node) {
  // NOTE(lmr): node could be a function component
  // which wont have an instance prop, but we can get the
  // host node associated with its return value at that point.
  // Although this breaks down if the return value is an array,
  // as is possible with React 16.
  let node = _node;
  while (node && !Array.isArray(node) && node.instance === null) {
    node = node.rendered;
  }
  // if the SFC returned null effectively, there is no host node.
  if (!node) {
    return null;
  }

  const mapper = (item) => {
    if (item && item.instance) return ReactDOM.findDOMNode(item.instance);
    return null;
  };
  if (Array.isArray(node)) {
    return node.map(mapper);
  }
  if (Array.isArray(node.rendered) && node.nodeType === 'class') {
    return node.rendered.map(mapper);
  }
  return mapper(node);
}

const eventOptions = { animation: true };

function getEmptyStateValue() {
  // this handles a bug in React 16.0 - 16.2
  // see https://github.com/facebook/react/commit/39be83565c65f9c522150e52375167568a2a1459
  // also see https://github.com/facebook/react/pull/11965

  // eslint-disable-next-line react/prefer-stateless-function
  class EmptyState extends React.Component {
    render() {
      return null;
    }
  }
  const testRenderer = new ShallowRenderer();
  testRenderer.render(React.createElement(EmptyState));
  return testRenderer._instance.state;
}

class ReactSixteenOneAdapter extends EnzymeAdapter {
  constructor() {
    super();
    const { lifecycles } = this.options;
    this.options = {
      ...this.options,
      legacyContextMode: 'parent',
      lifecycles: {
        ...lifecycles,
        componentDidUpdate: {
          onSetState: true,
        },
        setState: {
          skipsComponentDidUpdateOnNullish: true,
        },
        getChildContext: {
          calledByRenderer: false,
        },
      },
    };
  }

  createMountRenderer(options) {
    assertDomAvailable('mount');
    const { attachTo, hydrateIn, wrappingComponentProps } = options;
    const domNode = hydrateIn || attachTo || global.document.createElement('div');
    let instance = null;
    const adapter = this;
    return {
      render(el, context, callback) {
        if (instance === null) {
          const { type, props, ref } = el;
          const wrapperProps = {
            Component: type,
            props,
            wrappingComponentProps,
            context,
            ...(ref && { refProp: ref }),
          };
          const ReactWrapperComponent = createMountWrapper(el, { ...options, adapter });
          const wrappedEl = React.createElement(ReactWrapperComponent, wrapperProps);
          instance = hydrateIn
            ? ReactDOM.hydrate(wrappedEl, domNode)
            : ReactDOM.render(wrappedEl, domNode);
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
          toTree(instance._reactInternalFiber),
          options,
        );
      },
      simulateError(nodeHierarchy, rootNode, error) {
        const { instance: catchingInstance } = nodeHierarchy
          .find((x) => x.instance && x.instance.componentDidCatch) || {};

        simulateError(
          error,
          catchingInstance,
          rootNode,
          nodeHierarchy,
          nodeTypeFromType,
          adapter.displayNameOfNode,
        );
      },
      simulateEvent(node, event, mock) {
        const mappedEvent = mapNativeEventNames(event, eventOptions);
        const eventFn = TestUtils.Simulate[mappedEvent];
        if (!eventFn) {
          throw new TypeError(`ReactWrapper::simulate() event '${event}' does not exist`);
        }
        // eslint-disable-next-line react/no-find-dom-node
        eventFn(adapter.nodeToHostNode(node), mock);
      },
      batchedUpdates(fn) {
        return fn();
        // return ReactDOM.unstable_batchedUpdates(fn);
      },
      getWrappingComponentRenderer() {
        return {
          ...this,
          ...getWrappingComponentMountRenderer({
            toTree: (inst) => toTree(inst._reactInternalFiber),
            getMountWrapperInstance: () => instance,
          }),
        };
      },
    };
  }

  createShallowRenderer(/* options */) {
    const adapter = this;
    const renderer = new ShallowRenderer();
    let isDOM = false;
    let cachedNode = null;
    return {
      render(el, unmaskedContext) {
        cachedNode = el;
        /* eslint consistent-return: 0 */
        if (typeof el.type === 'string') {
          isDOM = true;
        } else {
          isDOM = false;
          const { type: Component } = el;

          const isStateful = Component.prototype && (
            Component.prototype.isReactComponent
            || Array.isArray(Component.__reactAutoBindPairs) // fallback for createClass components
          );
          const context = getMaskedContext(Component.contextTypes, unmaskedContext);

          if (!isStateful && typeof Component === 'function') {
            const wrappedEl = Object.assign(
              (...args) => Component(...args), // eslint-disable-line new-cap
              Component,
            );
            return withSetStateAllowed(() => renderer.render({ ...el, type: wrappedEl }, context));
          }
          if (isStateful) {
            // fix react bug; see implementation of `getEmptyStateValue`
            const emptyStateValue = getEmptyStateValue();
            if (emptyStateValue) {
              Object.defineProperty(Component.prototype, 'state', {
                configurable: true,
                enumerable: true,
                get() {
                  return null;
                },
                set(value) {
                  if (value !== emptyStateValue) {
                    Object.defineProperty(this, 'state', {
                      configurable: true,
                      enumerable: true,
                      value,
                      writable: true,
                    });
                  }
                  return true;
                },
              });
            }
          }
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
          nodeType: nodeTypeFromType(cachedNode.type),
          type: cachedNode.type,
          props: cachedNode.props,
          key: ensureKeyOrUndefined(cachedNode.key),
          ref: cachedNode.ref,
          instance: renderer._instance,
          rendered: Array.isArray(output)
            ? flatten(output).map((el) => elementToTree(el))
            : elementToTree(output),
        };
      },
      simulateError(nodeHierarchy, rootNode, error) {
        simulateError(
          error,
          renderer._instance,
          cachedNode,
          nodeHierarchy.concat(cachedNode),
          nodeTypeFromType,
          adapter.displayNameOfNode,
        );
      },
      simulateEvent(node, event, ...args) {
        const handler = node.props[propFromEvent(event, eventOptions)];
        if (handler) {
          withSetStateAllowed(() => {
            // TODO(lmr): create/use synthetic events
            // TODO(lmr): emulate React's event propagation
            // ReactDOM.unstable_batchedUpdates(() => {
            handler(...args);
            // });
          });
        }
      },
      batchedUpdates(fn) {
        return fn();
        // return ReactDOM.unstable_batchedUpdates(fn);
      },
      checkPropTypes(typeSpecs, values, location, hierarchy) {
        return checkPropTypes(
          typeSpecs,
          values,
          location,
          displayNameOfNode(cachedNode),
          () => getComponentStack(hierarchy.concat([cachedNode])),
        );
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

  nodeToHostNode(node, supportsArray = false) {
    const nodes = nodeToHostNode(node);
    if (Array.isArray(nodes) && !supportsArray) {
      return nodes[0];
    }
    return nodes;
  }

  displayNameOfNode(node) {
    if (!node) return null;

    const { type, $$typeof } = node;
    return displayNamesByType[type || $$typeof] || displayNameOfNode(node);
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

module.exports = ReactSixteenOneAdapter;
