/* eslint
  global-require: 0,
  import/no-mutable-exports: 0,
  import/no-unresolved: 0,
  react/no-deprecated: 0,
  react/no-render-return-value: 0,
*/

import objectAssign from 'object.assign';
import { REACT013 } from './version';

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
    // requiring react/lib/ExecutionEnvironment' not working w/ figbuild
    // so removing from static analysis
  return
} else {
  let ReactDOM;

  try {
    // eslint-disable-next-line import/no-extraneous-dependencies
    ReactDOM = require('react-dom');
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(
      'react-dom is an implicit dependency in order to support react@0.13-14. ' +
      'Please add the appropriate version to your devDependencies. ' +
      'See https://github.com/airbnb/enzyme#installation',
    );
    throw e;
  }

  // eslint-disable-next-line import/no-extraneous-dependencies
  renderToStaticMarkup = require('react-dom/server').renderToStaticMarkup;

  findDOMNode = ReactDOM.findDOMNode;
  unmountComponentAtNode = ReactDOM.unmountComponentAtNode;
  batchedUpdates = ReactDOM.unstable_batchedUpdates;
  // We require the testutils, but they don't come with 0.14 out of the box, so we
  // require them here through this node module. The bummer is that we are not able
  // to list this as a dependency in package.json and have 0.13 work properly.
  // As a result, right now this is basically an implicit dependency.
  try {
    // eslint-disable-next-line import/no-extraneous-dependencies
    TestUtils = require('react-addons-test-utils');
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(
      'react-addons-test-utils is an implicit dependency in order to support react@0.13-14. ' +
      'Please add the appropriate version to your devDependencies. ' +
      'See https://github.com/airbnb/enzyme#installation',
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
    let cachedNode;
    return objectAssign(renderer, {
      render(node, context) {
        /* eslint consistent-return: 0 */
        if (typeof node.type === 'string') {
          isDOM = true;
          cachedNode = node;
        } else {
          isDOM = false;
          return originalRender.call(this, node, context);
        }
      },
      getRenderOutput() {
        if (isDOM) {
          return cachedNode;
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

function isDOMComponentElement(inst) {
  return React.isValidElement(inst) && typeof inst.type === 'string';
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
  isDOMComponentElement,
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
