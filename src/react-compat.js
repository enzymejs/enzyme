import { REACT013 } from './version';

let TestUtils;
let createShallowRenderer;
let renderToStaticMarkup;
let renderIntoDocument;
let findDOMNode;
if (REACT013) {
  renderToStaticMarkup = require('react').renderToStaticMarkup;
  findDOMNode = require('react').findDOMNode;
  TestUtils = require('react/addons').addons.TestUtils;
  createShallowRenderer = TestUtils.createRenderer;
  renderIntoDocument = TestUtils.renderIntoDocument;
} else {
  renderToStaticMarkup = require('react-dom/server').renderToStaticMarkup;
  findDOMNode = require('react-dom').findDOMNode;
  TestUtils = require('react-addons-test-utils');
  createShallowRenderer = function createRendererCompatible() {
    const renderer = TestUtils.createRenderer();
    let isDOM = false;
    let _node;
    return {
      _instance: renderer._instance,
      render(node) {
        if (typeof node.type === 'string') {
          isDOM = true;
          _node = node;
        } else {
          isDOM = false;
          renderer.render(node);
          this._instance = renderer._instance;
        }
      },
      getRenderOutput() {
        if (isDOM) {
          return _node;
        }
        return renderer.getRenderOutput();
      },
    };
  };
  renderIntoDocument = TestUtils.renderIntoDocument;
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

export default {
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
};
