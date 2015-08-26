'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _reactAddons = require('react/addons');

var _reactAddons2 = _interopRequireDefault(_reactAddons);

var _underscore = require('underscore');

var _Utils = require('./Utils');

var _React$addons$TestUtils = _reactAddons2['default'].addons.TestUtils;
var isDOMComponent = _React$addons$TestUtils.isDOMComponent;
var renderIntoDocument = _React$addons$TestUtils.renderIntoDocument;
var findAllInRenderedTree = _React$addons$TestUtils.findAllInRenderedTree;
var scryRenderedDOMComponentsWithClass = _React$addons$TestUtils.scryRenderedDOMComponentsWithClass;
var findRenderedDOMComponentWithClass = _React$addons$TestUtils.findRenderedDOMComponentWithClass;
var scryRenderedDOMComponentsWithTag = _React$addons$TestUtils.scryRenderedDOMComponentsWithTag;
var findRenderedDOMComponentWithTag = _React$addons$TestUtils.findRenderedDOMComponentWithTag;
var scryRenderedComponentsWithType = _React$addons$TestUtils.scryRenderedComponentsWithType;
var findRenderedComponentWithType = _React$addons$TestUtils.findRenderedComponentWithType;

var ReactWrapperComponent = (function (_React$Component) {
  _inherits(ReactWrapperComponent, _React$Component);

  function ReactWrapperComponent(props) {
    _classCallCheck(this, ReactWrapperComponent);

    _get(Object.getPrototypeOf(ReactWrapperComponent.prototype), 'constructor', this).call(this, props);
    this.state = Object.assign({}, props.props);
  }

  _createClass(ReactWrapperComponent, [{
    key: 'setProps',
    value: function setProps(newProps) {
      var _this = this;

      return new Promise(function (resolve) {
        return _this.setState(newProps, resolve);
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var Component = this.props.Component;

      return _reactAddons2['default'].createElement(Component, _extends({ ref: 'component' }, this.state));
    }
  }]);

  return ReactWrapperComponent;
})(_reactAddons2['default'].Component);

exports.ReactWrapperComponent = ReactWrapperComponent;

var ReactWrapper = (function () {
  function ReactWrapper(node) {
    _classCallCheck(this, ReactWrapper);

    if (!global.window && !global.document) {
      throw new Error('It looks like you called `mount()` without a jsdom document being loaded. ' + 'Make sure to only use `mount()` inside of a `describeWithDom(...)` call. ');
    }
    this.component = renderIntoDocument(_reactAddons2['default'].createElement(ReactWrapperComponent, {
      Component: node.type,
      props: node.props
    }));
  }

  /**
   * Used like `setState(...)` but sets the propsn directly on the component this class wraps
   *
   * @param {Object} newProps
   * @returns {Promise}
   */

  _createClass(ReactWrapper, [{
    key: 'setProps',
    value: function setProps(newProps) {
      return this.component.setProps(newProps);
    }

    /**
     * Force the component to update
     */
  }, {
    key: 'forceUpdate',
    value: function forceUpdate() {
      this.component.forceUpdate();
    }

    /**
     * Get a ref of the component. If the ref is a DOM Node, it returns the DOM Node directly.
     *
     * @param {String} refname
     * @returns {HtmlElement|ReactElement}
     */
  }, {
    key: 'ref',
    value: function ref(refname) {
      var ref = this.component.refs.component.refs[refname];
      if (!ref) return null;
      return (0, _Utils.getNode)(ref);
    }

    /**
     *
     * @returns {ReactElement}
     */
  }, {
    key: 'root',
    value: function root() {
      return this.component.refs.component;
    }

    /**
     * Finds all components in the tree that pass the passed in text
     *
     * @param {Function} test function
     * @returns {Array}
     */
  }, {
    key: 'findWhere',
    value: function findWhere(test) {
      return findAllInRenderedTree(this.component, test);
    }

    /**
     *
     * @param {Function|String} selector
     * @returns {Array<ReactComponent>} results
     */
  }, {
    key: 'findAll',
    value: function findAll(selector) {
      switch (typeof selector) {
        case "function":
          return scryRenderedComponentsWithType(this.component, selector);
        case "string":
          if (selector[0] === ".") {
            return scryRenderedDOMComponentsWithClass(this.component, selector.substr(1)).map(_Utils.getNode);
          } else {
            return scryRenderedDOMComponentsWithTag(this.component, selector).map(_Utils.getNode);
          }
        default:
          throw new TypeError("Expecting a string or Component Constructor");
      }
    }

    /**
     *
     * @param {Function|String} selector
     * @returns {ReactElement} resulting component
     */
  }, {
    key: 'find',
    value: function find(selector) {
      switch (typeof selector) {
        case "function":
          return findRenderedComponentWithType(this.component, selector);
        case "string":
          if (selector[0] === ".") {
            return (0, _Utils.getNode)(findRenderedDOMComponentWithClass(this.component, selector.substr(1)));
          } else {
            return (0, _Utils.getNode)(findRenderedDOMComponentWithTag(this.component, selector));
          }
        default:
          throw new TypeError("Expecting a string or Component Constructor");
      }
    }
  }]);

  return ReactWrapper;
})();

exports['default'] = ReactWrapper;