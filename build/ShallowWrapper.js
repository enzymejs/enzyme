'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _reactAddons = require('react/addons');

var _reactAddons2 = _interopRequireDefault(_reactAddons);

var _Utils = require('./Utils');

var createRenderer = _reactAddons2['default'].addons.TestUtils.createRenderer;

var ShallowWrapper = (function () {
  function ShallowWrapper(node) {
    _classCallCheck(this, ShallowWrapper);

    this.renderer = createRenderer();
    this.node = node;
    this.renderer.render(this.node);
    this.tree = this.renderer.getRenderOutput();
  }

  /**
   *
   * @param {Function} test
   * @returns {Array<HTMLElement|ReactElement>}
   */

  _createClass(ShallowWrapper, [{
    key: 'findWhere',
    value: function findWhere(test) {
      return (0, _Utils.treeFilter)(this.tree, test);
    }

    /**
     *
     * @param {String|Function} selector
     * @returns {Array<HTMLElement|ReactElement>}
     */
  }, {
    key: 'findAll',
    value: function findAll(selector) {
      switch (typeof selector) {
        case "function":
          return this.findWhere(function (node) {
            return node && node.type === selector;
          });
        case "string":
          if (selector[0] === ".") {
            return this.findWhere(function (node) {
              return (0, _Utils.hasClassName)(node, selector.substr(1));
            });
          } else {
            return this.findWhere(function (node) {
              return node && node.type === selector;
            });
          }
        default:
          throw new TypeError("Expecting a string or Component Constructor");
      }
    }

    /**
     *
     * @param {String|Function} selector
     * @returns {HTMLElement|ReactElement}
     */
  }, {
    key: 'find',
    value: function find(selector) {
      return (0, _Utils.single)(this.findAll(selector));
    }

    /**
     *
     * @param {ReactElement} node
     * @returns {Boolean}
     */
  }, {
    key: 'contains',
    value: function contains(node) {
      return this.findWhere(function (other) {
        return (0, _Utils.nodeEqual)(node, other);
      }).length > 0;
    }
  }]);

  return ShallowWrapper;
})();

exports['default'] = ShallowWrapper;
module.exports = exports['default'];