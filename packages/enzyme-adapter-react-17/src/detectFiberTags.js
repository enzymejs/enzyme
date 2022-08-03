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
  return inst._reactInternals.child;
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
  return inst._reactInternals.child;
}

module.exports = function detectFiberTags() {
  function Fn() {
    return null;
  }
  // eslint-disable-next-line react/prefer-stateless-function
  class Cls extends React.Component {
    render() {
      return null;
    }
  }
  const Ctx = React.createContext();
  // React will warn if we don't have both arguments.
  // eslint-disable-next-line no-unused-vars
  const FwdRef = React.forwardRef((props, ref) => null);
  const LazyComponent = React.lazy(() => fakeDynamicImport(() => null));

  return {
    HostRoot: getFiber('test').return.return.tag, // Go two levels above to find the root
    ClassComponent: getFiber(React.createElement(Cls)).tag,
    Fragment: getFiber([['nested']]).tag,
    FunctionalComponent: getFiber(React.createElement(Fn)).tag,
    MemoSFC: getFiber(React.createElement(React.memo(Fn))).tag,
    MemoClass: getFiber(React.createElement(React.memo(Cls))).tag,
    HostPortal: getFiber(ReactDOM.createPortal(null, global.document.createElement('div'))).tag,
    HostComponent: getFiber(React.createElement('span')).tag,
    HostText: getFiber('text').tag,
    Mode: getFiber(React.createElement(React.StrictMode)).tag,
    ContextConsumer: getFiber(React.createElement(Ctx.Consumer, null, () => null)).tag,
    ContextProvider: getFiber(React.createElement(Ctx.Provider, { value: null }, null)).tag,
    ForwardRef: getFiber(React.createElement(FwdRef)).tag,
    Profiler: getFiber(React.createElement(React.Profiler, { id: 'mock', onRender() {} })).tag,
    Suspense: getFiber(React.createElement(React.Suspense, { fallback: false })).tag,
    Lazy: getLazyFiber(LazyComponent).tag,
    OffscreenComponent: getLazyFiber('div').return.return.tag,
  };
};
