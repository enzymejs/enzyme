import React from 'react';
import ReactDOM from 'react-dom';
import { fakeDynamicImport } from 'enzyme-adapter-utils';

function getFiber(element) {
  const container = global.document.createElement('div');
  let inst = null;
  class Tester extends React.Component {
    render() {
      inst = this;
      return element;
    }
  }
  ReactDOM.render(React.createElement(Tester), container);
  return inst._reactInternalFiber.child;
}

function getLazyFiber(LazyComponent) {
  const container = global.document.createElement('div');
  let inst = null;
  // eslint-disable-next-line react/prefer-stateless-function
  class Tester extends React.Component {
    render() {
      inst = this;
      return React.createElement(LazyComponent);
    }
  }
  // eslint-disable-next-line react/prefer-stateless-function
  class SuspenseWrapper extends React.Component {
    render() {
      return React.createElement(
        React.Suspense,
        { fallback: false },
        React.createElement(Tester),
      );
    }
  }
  ReactDOM.render(React.createElement(SuspenseWrapper), container);
  return inst._reactInternalFiber.child;
}

export default function detectFiberTags() {
  const supportsMode = typeof React.StrictMode !== 'undefined';
  const supportsContext = typeof React.createContext !== 'undefined';
  const supportsForwardRef = typeof React.forwardRef !== 'undefined';
  const supportsMemo = typeof React.memo !== 'undefined';
  const supportsProfiler = typeof React.unstable_Profiler !== 'undefined' || typeof React.Profiler !== 'undefined';
  const supportsSuspense = typeof React.Suspense !== 'undefined';
  const supportsLazy = typeof React.lazy !== 'undefined';

  function Fn() {
    return null;
  }
  function LazyFn() {
    throw Promise.resolve();
  }
  // eslint-disable-next-line react/prefer-stateless-function
  class Cls extends React.Component {
    render() {
      return null;
    }
  }
  // eslint-disable-next-line react/prefer-stateless-function
  class LazyCls extends React.Component {
    // eslint-disable-next-line react/require-render-return
    render() {
      throw Promise.resolve();
    }
  }
  let Ctx = null;
  let FwdRef = null;
  let LazyComponent = null;
  if (supportsContext) {
    Ctx = React.createContext();
  }
  if (supportsForwardRef) {
    // React will warn if we don't have both arguments.
    // eslint-disable-next-line no-unused-vars
    FwdRef = React.forwardRef((props, ref) => null);
  }
  if (supportsLazy) {
    LazyComponent = React.lazy(() => fakeDynamicImport(() => null));
  }

  return {
    HostRoot: getFiber('test').return.return.tag, // Go two levels above to find the root
    ClassComponent: getFiber(React.createElement(Cls)).tag,
    ClassComponentLazy: supportsSuspense ? getLazyFiber(LazyCls).tag : -1,
    Fragment: getFiber([['nested']]).tag,
    FunctionalComponent: getFiber(React.createElement(Fn)).tag,
    FunctionalComponentLazy: supportsSuspense ? getLazyFiber(LazyFn).tag : -1,
    MemoSFC: supportsMemo
      ? getFiber(React.createElement(React.memo(Fn))).tag
      : -1,
    MemoClass: supportsMemo
      ? getFiber(React.createElement(React.memo(Cls))).tag
      : -1,
    HostPortal: getFiber(ReactDOM.createPortal(null, global.document.createElement('div'))).tag,
    HostComponent: getFiber(React.createElement('span')).tag,
    HostText: getFiber('text').tag,
    Mode: supportsMode
      ? getFiber(React.createElement(React.StrictMode)).tag
      : -1,
    ContextConsumer: supportsContext
      ? getFiber(React.createElement(Ctx.Consumer, null, () => null)).tag
      : -1,
    ContextProvider: supportsContext
      ? getFiber(React.createElement(Ctx.Provider, { value: null }, null)).tag
      : -1,
    ForwardRef: supportsForwardRef
      ? getFiber(React.createElement(FwdRef)).tag
      : -1,
    Profiler: supportsProfiler
      ? getFiber(React.createElement((React.Profiler || React.unstable_Profiler), { id: 'mock', onRender() {} })).tag
      : -1,
    Suspense: supportsSuspense
      ? getFiber(React.createElement(React.Suspense, { fallback: false })).tag
      : -1,
    Lazy: supportsLazy
      ? getLazyFiber(LazyComponent).tag
      : -1,
  };
}
