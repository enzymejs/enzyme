/* eslint react/no-deprecated: 0 */
import { REACT013 } from './version';
import objectAssign from 'object.assign';

let TestUtils;
let createShallowRenderer;
let renderToStaticMarkup;
let renderIntoDocument;
let findDOMNode;
let childrenToArray;
let renderWithOptions;
let unmountComponentAtNode;
let batchedUpdates;

const React = require('react');

if (REACT013) {
  renderToStaticMarkup = React.renderToStaticMarkup;
  /* eslint-disable react/no-deprecated */
  findDOMNode = React.findDOMNode;
  unmountComponentAtNode = React.unmountComponentAtNode;
  /* eslint-enable react/no-deprecated */
  TestUtils = require('react/addons').addons.TestUtils;
  batchedUpdates = require('react/addons').addons.batchedUpdates;
  const ReactContext = require('react/lib/ReactContext');

  // Shallow rendering in 0.13 did not properly support context. This function provides a shim
  // around `TestUtils.createRenderer` that instead returns a ShallowRenderer that actually
  // works with context. See https://github.com/facebook/react/issues/3721 for more details.
  createShallowRenderer = function createRendererCompatible() {
    const renderer = TestUtils.createRenderer();
    renderer.render = (originalRender => function contextCompatibleRender(node, context = {}) {
      ReactContext.current = context;
      originalRender.call(this, React.createElement(node.type, node.props), context);
      ReactContext.current = {};
      return renderer.getRenderOutput();
    })(renderer.render);
    return renderer;
  };
  renderIntoDocument = TestUtils.renderIntoDocument;
  // this fixes some issues in React 0.13 with setState and jsdom...
  // see issue: https://github.com/airbnb/enzyme/issues/27
  require('react/lib/ExecutionEnvironment').canUseDOM = true;

  // in 0.13, a Children.toArray function was not exported. Make our own instead.
  childrenToArray = (children) => {
    const results = [];
    if (children !== undefined && children !== null && children !== false) {
      React.Children.forEach(children, (el) => {
        if (el !== undefined && el !== null && el !== false) {
          results.push(el);
        }
      });
    }
    return results;
  };

  renderWithOptions = (node, options) => {
    if (options.attachTo) {
      return React.render(node, options.attachTo);
    }
    return TestUtils.renderIntoDocument(node);
  };
} else {
  let ReactDOM;

  try {
    ReactDOM = require('react-dom');
  } catch (e) {
    console.error(
      'react-dom is an implicit dependency in order to support react@0.13-14. ' +
      'Please add the appropriate version to your devDependencies. ' +
      'See https://github.com/airbnb/enzyme#installation'
    );
    throw e;
  }

  renderToStaticMarkup = require('react-dom/server').renderToStaticMarkup;
  findDOMNode = ReactDOM.findDOMNode;
  unmountComponentAtNode = ReactDOM.unmountComponentAtNode;
  batchedUpdates = ReactDOM.unstable_batchedUpdates;
  // We require the testutils, but they don't come with 0.14 out of the box, so we
  // require them here through this node module. The bummer is that we are not able
  // to list this as a dependency in package.json and have 0.13 work properly.
  // As a result, right now this is basically an implicit dependency.
  try {
    TestUtils = require('react-addons-test-utils');
  } catch (e) {
    console.error(
      'react-addons-test-utils is an implicit dependency in order to support react@0.13-14. ' +
      'Please add the appropriate version to your devDependencies. ' +
      'See https://github.com/airbnb/enzyme#installation'
    );
    throw e;
  }

  // Shallow rendering changed from 0.13 => 0.14 in such a way that
  // 0.14 now does not allow shallow rendering of native DOM elements.
  // This is mainly because the result of such a call should not realistically
  // be any different than the JSX you passed in (result of `React.createElement`.
  // In order to maintain the same behavior across versions, this function
  // is essentially a replacement for `TestUtils.createRenderer` that doesn't use
  // shallow rendering when it's just a DOM element.
  createShallowRenderer = function createRendererCompatible() {
    const renderer = TestUtils.createRenderer();
    const originalRender = renderer.render;
    const originalRenderOutput = renderer.getRenderOutput;
    let isDOM = false;
    let _node;
    return objectAssign(renderer, {
      render(node, context) {
        /* eslint consistent-return: 0 */
        if (typeof node.type === 'string') {
          isDOM = true;
          _node = node;
        } else {
          isDOM = false;
          return originalRender.call(this, node, context);
        }
      },
      getRenderOutput() {
        if (isDOM) {
          return _node;
        }
        return originalRenderOutput.call(this);
      },
    });
  };
  renderIntoDocument = TestUtils.renderIntoDocument;
  childrenToArray = React.Children.toArray;

  renderWithOptions = (node, options) => {
    if (options.attachTo) {
      return ReactDOM.render(node, options.attachTo);
    }
    return TestUtils.renderIntoDocument(node);
  };
}

const {
  mockComponent,
  isElement,
  isElementOfType,
  isDOMComponent,
  isCompositeComponent,
  isCompositeComponentWithType,
  isCompositeComponentElement,
  Simulate,
  findAllInRenderedTree,
} = TestUtils;

export {
  createShallowRenderer,
  renderToStaticMarkup,
  renderIntoDocument,
  mockComponent,
  isElement,
  isElementOfType,
  isDOMComponent,
  isCompositeComponent,
  isCompositeComponentWithType,
  isCompositeComponentElement,
  Simulate,
  findDOMNode,
  findAllInRenderedTree,
  childrenToArray,
  renderWithOptions,
  unmountComponentAtNode,
  batchedUpdates,
};
