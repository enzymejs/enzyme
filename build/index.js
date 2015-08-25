'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.describeWithDom = describeWithDom;
exports.useSinon = useSinon;
exports.spySetup = spySetup;
exports.spyTearDown = spyTearDown;
exports.spyLifecycle = spyLifecycle;
exports.spyMethods = spyMethods;
exports.spyActions = spyActions;
exports.stubActions = stubActions;
exports.dispatch = dispatch;
exports.mount = mount;
exports.shallow = shallow;
exports.render = render;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _reactAddons = require('react/addons');

var _reactAddons2 = _interopRequireDefault(_reactAddons);

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

var _sinon = require('sinon');

var _sinon2 = _interopRequireDefault(_sinon);

var _ReactWrapper = require('./ReactWrapper');

var _ReactWrapper2 = _interopRequireDefault(_ReactWrapper);

var _ShallowWrapper = require('./ShallowWrapper');

var _ShallowWrapper2 = _interopRequireDefault(_ShallowWrapper);

var _Utils = require('./Utils');

var jsdom;
try {
  require('jsdom'); // could throw
  jsdom = require('mocha-jsdom');
} catch (e) {
  // jsdom is not supported...
}

var _React$addons$TestUtils = _reactAddons2['default'].addons.TestUtils;
var Simulate = _React$addons$TestUtils.Simulate;
var mockComponent = _React$addons$TestUtils.mockComponent;
var isElement = _React$addons$TestUtils.isElement;
var isElementOfType = _React$addons$TestUtils.isElementOfType;
var isDOMComponent = _React$addons$TestUtils.isDOMComponent;
var isCompositeComponent = _React$addons$TestUtils.isCompositeComponent;
var isCompositeComponentWithType = _React$addons$TestUtils.isCompositeComponentWithType;
var isComponentWithType = isCompositeComponentWithType;

exports.isComponentWithType = isComponentWithType;
var sinon = _sinon2['default'].sandbox.create();

exports.sinon = sinon;
var simulate = Simulate;

exports.simulate = simulate;

function describeWithDom(a, b) {
  describe('<< uses jsdom >>', function () {
    if (typeof jsdom === "function") {
      jsdom();
      describe(a, b);
    } else {
      // if jsdom isn't available, skip every test in this describe context
      describe.skip(a, b);
    }
  });
}

function useSinon() {
  beforeEach(spySetup);
  afterEach(spyTearDown);
}

function spySetup() {
  exports.sinon = sinon = _sinon2['default'].sandbox.create();
}

function spyTearDown() {
  sinon.restore();
}

function spyLifecycle(Component) {
  (0, _Utils.onPrototype)(Component, function (proto, name) {
    return sinon.spy(proto, name);
  });
}

function spyMethods(Component) {
  (0, _Utils.onPrototype)(Component, null, function (proto, name) {
    return sinon.spy(proto, name);
  });
}

function spyActions(Actions) {
  // TODO(lmr): implement
  throw new Error("Not Implemented");
}

function stubActions(Actions) {
  // TODO(lmr): implement
  throw new Error("Not Implemented");
}

function dispatch(action, payload) {
  // TODO(lmr): implement
  throw new Error("Not Implemented");
}

/**
 * Mounts and renders a react component into the document and provides a testing wrapper around it.
 *
 * @param node
 * @returns {ReactWrapper}
 */

function mount(node) {
  return new _ReactWrapper2['default'](node);
}

/**
 * Shallow renders a react component and provides a testing wrapper around it.
 *
 * @param node
 * @returns {ShallowWrapper}
 */

function shallow(node) {
  return new _ShallowWrapper2['default'](node);
}

/**
 * Renders a react component into static HTML and provides a cheerio wrapper around it.
 *
 * @param node
 * @returns {*}
 */

function render(node) {
  var html = _reactAddons2['default'].renderToStaticMarkup(node);
  return _cheerio2['default'].load(html);
}