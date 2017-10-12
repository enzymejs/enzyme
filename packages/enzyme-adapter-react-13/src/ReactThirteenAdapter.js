import React from 'react';
// eslint-disable-next-line import/no-unresolved, import/extensions
import ReactAddons from 'react/addons';
// eslint-disable-next-line import/no-unresolved, import/extensions
import ReactContext from 'react/lib/ReactContext';
import values from 'object.values';
import { EnzymeAdapter } from 'enzyme';
import {
  propFromEvent,
  withSetStateAllowed,
  assertDomAvailable,
  createRenderWrapper,
  createMountWrapper,
  propsWithKeysAndRef,
} from 'enzyme-adapter-utils';
import mapNativeEventNames from './ReactThirteenMapNativeEventNames';
import elementToTree from './ReactThirteenElementToTree';


// this fixes some issues in React 0.13 with setState and jsdom...
// see issue: https://github.com/airbnb/enzyme/issues/27
// eslint-disable-next-line import/no-unresolved
require('react/lib/ExecutionEnvironment').canUseDOM = true;

const { TestUtils, batchedUpdates } = ReactAddons.addons;

const getEmptyElementType = (() => {
  let EmptyElementType = null;
  // eslint-disable-next-line react/prefer-stateless-function
  class Foo extends React.Component {
    render() {
      return null;
    }
  }

  return () => {
    if (EmptyElementType === null) {
      const instance = TestUtils.renderIntoDocument(React.createElement(Foo));
      EmptyElementType = instance._reactInternalInstance._renderedComponent._currentElement.type;
    }
    return EmptyElementType;
  };
})();

const createShallowRenderer = function createRendererCompatible() {
  const renderer = TestUtils.createRenderer();
  renderer.render = (originalRender => function contextCompatibleRender(node, context = {}) {
    ReactContext.current = context;
    originalRender.call(this, React.createElement(node.type, node.props), context);
    ReactContext.current = {};
    return renderer.getRenderOutput();
  })(renderer.render);
  return renderer;
};


function instanceToTree(inst) {
  if (typeof inst !== 'object') {
    return inst;
  }
  const el = inst._currentElement;
  if (!el) {
    return null;
  }
  if (typeof el !== 'object') {
    return el;
  }
  if (el.type === getEmptyElementType()) {
    return null;
  }
  if (typeof el.type === 'string') {
    const innerInst = inst._renderedComponent;
    const children = innerInst._renderedChildren || { '.0': el._store.props.children };
    return {
      nodeType: 'host',
      type: el.type,
      props: el._store.props,
      key: el.key || undefined,
      ref: el.ref,
      instance: inst._instance.getDOMNode(),
      rendered: values(children).map(instanceToTree),
    };
  }
  if (inst._renderedComponent) {
    return {
      nodeType: 'class',
      type: el.type,
      props: el._store.props,
      key: el.key || undefined,
      ref: el.ref,
      instance: inst._instance || inst._hostNode || null,
      rendered: instanceToTree(inst._renderedComponent),
    };
  }
  throw new Error('Enzyme Internal Error: unknown instance encountered');
}

class ReactThirteenAdapter extends EnzymeAdapter {
  constructor() {
    super();
    this.options = {
      ...this.options,
      supportPrevContextArgumentOfComponentDidUpdate: true,
    };
  }
  createMountRenderer(options) {
    assertDomAvailable('mount');
    const domNode = options.attachTo || global.document.createElement('div');
    let instance = null;
    return {
      render(el, context, callback) {
        if (instance === null) {
          const ReactWrapperComponent = createMountWrapper(el, options);
          const wrappedEl = React.createElement(ReactWrapperComponent, {
            Component: el.type,
            props: el.props,
            context,
          });
          instance = React.render(wrappedEl, domNode);
          if (typeof callback === 'function') {
            callback();
          }
        } else {
          instance.setChildProps(el.props, context, callback);
        }
      },
      unmount() {
        React.unmountComponentAtNode(domNode);
        instance = null;
      },
      getNode() {
        return instance ? instanceToTree(instance._reactInternalInstance).rendered : null;
      },
      simulateEvent(node, event, mock) {
        const mappedEvent = mapNativeEventNames(event);
        const eventFn = TestUtils.Simulate[mappedEvent];
        if (!eventFn) {
          throw new TypeError(`ReactWrapper::simulate() event '${event}' does not exist`);
        }
        // eslint-disable-next-line react/no-find-dom-node
        eventFn(React.findDOMNode(node.instance), mock);
      },
      batchedUpdates(fn) {
        return batchedUpdates(fn);
      },
    };
  }

  createShallowRenderer(/* options */) {
    const renderer = createShallowRenderer();
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
          // return withSetStateAllowed(() => renderer.render(el, context));
          return renderer.render(el, context);
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
          nodeType: 'class',
          type: cachedNode.type,
          props: cachedNode.props,
          key: cachedNode.key || undefined,
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
            batchedUpdates(() => {
              handler(...args);
            });
          });
        }
      },
      batchedUpdates(fn) {
        return withSetStateAllowed(() => batchedUpdates(fn));
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
          return React.renderToStaticMarkup(React.createElement(ContextWrapper));
        }
        return React.renderToStaticMarkup(el);
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
    return React.findDOMNode(node.instance);
  }

  isValidElement(element) {
    return React.isValidElement(element);
  }

  createElement(...args) {
    return React.createElement(...args);
  }
}

module.exports = ReactThirteenAdapter;
