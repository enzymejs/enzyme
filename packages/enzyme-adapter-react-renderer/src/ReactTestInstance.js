// COPIED FROM https://github.com/facebook/react/blob/master/packages/react-test-renderer/src/ReactTestRenderer.js
// Ideally ReactTestInstance would be exported from the react-test-renderer package

import { findCurrentFiberUsingSlowPath } from 'react-reconciler/reflection';
import invariant from 'invariant';

export const IndeterminateComponent = 0; // Before we know whether it is functional or class
export const FunctionalComponent = 1;
export const ClassComponent = 2;
export const HostRoot = 3; // Root of a host tree. Could be nested inside another node.
export const HostPortal = 4; // A subtree. Could be an entry point to a different renderer.
export const HostComponent = 5;
export const HostText = 6;
export const CallComponent = 7;
export const CallHandlerPhase = 8;
export const ReturnComponent = 9;
export const Fragment = 10;
export const Mode = 11;
export const ContextConsumer = 12;
export const ContextProvider = 13;
export const ForwardRef = 14;

const validWrapperTypes = new Set([FunctionalComponent, ClassComponent, HostComponent, ForwardRef]);

function getPublicInstance(inst) {
  switch (inst.tag) {
    case 'INSTANCE': {
      const createNodeMock = inst.rootContainerInstance.createNodeMock;
      return createNodeMock({
        type: inst.type,
        props: inst.props,
      });
    }
    default:
      return inst;
  }
}

const fiberToWrapper = new WeakMap();
function wrapFiber(fiber) {
  let wrapper = fiberToWrapper.get(fiber);
  if (wrapper === undefined && fiber.alternate !== null) {
    wrapper = fiberToWrapper.get(fiber.alternate);
  }
  if (wrapper === undefined) {
    wrapper = new ReactTestInstance(fiber);
    fiberToWrapper.set(fiber, wrapper);
  }
  return wrapper;
}

function expectOne(all, message) {
  if (all.length === 1) {
    return all[0];
  }

  const prefix =
    all.length === 0 ? 'No instances found ' : `Expected 1 but found ${all.length} instances `;

  throw new Error(prefix + message);
}

function findAll(root, predicate, options) {
  const deep = options ? options.deep : true;
  const results = [];

  if (predicate(root)) {
    results.push(root);
    if (!deep) {
      return results;
    }
  }

  root.children.forEach((child) => {
    if (typeof child === 'string') {
      return;
    }
    results.push(...findAll(child, predicate, options));
  });

  return results;
}

function propsMatch(props, filter) {
  for (const key in filter) {
    if (props[key] !== filter[key]) {
      return false;
    }
  }
  return true;
}

class ReactTestInstance {
  _currentFiber() {
    // Throws if this component has been unmounted.
    const fiber = findCurrentFiberUsingSlowPath(this._fiber);
    invariant(
      fiber !== null,
      "Can't read from currently-mounting component. This error is likely " +
        'caused by a bug in React. Please file an issue.',
    );
    return fiber;
  }

  constructor(fiber) {
    invariant(
      validWrapperTypes.has(fiber.tag),
      'Unexpected object passed to ReactTestInstance constructor (tag: %s). ' +
        'This is probably a bug in React.',
      fiber.tag,
    );
    this._fiber = fiber;
  }

  get instance() {
    if (this._fiber.tag === HostComponent) {
      return getPublicInstance(this._fiber.stateNode);
    }
    return this._fiber.stateNode;
  }

  get type() {
    return this._fiber.type;
  }

  get props() {
    return this._currentFiber().memoizedProps;
  }

  get parent() {
    const parent = this._fiber.return;
    return parent === null || parent.tag === HostRoot ? null : wrapFiber(parent);
  }

  get children() {
    const children = [];
    const startingNode = this._currentFiber();
    let node = startingNode;
    if (node.child === null) {
      return children;
    }
    node.child.return = node;
    node = node.child;
    outer: while (true) {
      let descend = false;
      switch (node.tag) {
        case FunctionalComponent:
        case ClassComponent:
        case HostComponent:
        case ForwardRef:
          children.push(wrapFiber(node));
          break;
        case HostText:
          children.push(`${node.memoizedProps}`);
          break;
        case Fragment:
        case ContextProvider:
        case ContextConsumer:
        case Mode:
          descend = true;
          break;
        default:
          invariant(
            false,
            'Unsupported component type %s in test renderer. ' + 'This is probably a bug in React.',
            node.tag,
          );
      }
      if (descend && node.child !== null) {
        node.child.return = node;
        node = node.child;
        continue;
      }
      while (node.sibling === null) {
        if (node.return === startingNode) {
          break outer;
        }
        node = node.return;
      }
      node.sibling.return = node.return;
      node = node.sibling;
    }
    return children;
  }

  // Custom search functions
  find(predicate) {
    return expectOne(
      this.findAll(predicate, { deep: false }),
      `matching custom predicate: ${predicate.toString()}`,
    );
  }

  findByType(type) {
    return expectOne(
      this.findAllByType(type, { deep: false }),
      `with node type: "${type.displayName || type.name}"`,
    );
  }

  findByProps(props) {
    return expectOne(
      this.findAllByProps(props, { deep: false }),
      `with props: ${JSON.stringify(props)}`,
    );
  }

  findAll(predicate, options = null) {
    return findAll(this, predicate, options);
  }

  findAllByType(type, options = null) {
    return findAll(this, node => node.type === type, options);
  }

  findAllByProps(props, options = null) {
    return findAll(this, node => node.props && propsMatch(node.props, props), options);
  }
}

module.exports = ReactTestInstance;
