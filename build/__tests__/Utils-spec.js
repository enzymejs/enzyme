'use strict';

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _reactAddons = require('react/addons');

var _reactAddons2 = _interopRequireDefault(_reactAddons);

var _chai = require('chai');

var _sinon = require('sinon');

var _sinon2 = _interopRequireDefault(_sinon);

var _Utils = require('../Utils');

var _ = require('../');

describe('Utils', function () {

  describe('onPrototype', function () {
    var Foo = (function () {
      function Foo() {
        _classCallCheck(this, Foo);
      }

      _createClass(Foo, [{
        key: 'a',
        value: function a() {}
      }, {
        key: 'b',
        value: function b() {}
      }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate() {}
      }]);

      return Foo;
    })();

    var lifecycleSpy = _sinon2['default'].spy();
    var methodSpy = _sinon2['default'].spy();

    (0, _Utils.onPrototype)(Foo, lifecycleSpy, methodSpy);

    (0, _chai.expect)(lifecycleSpy.callCount).to.equal(1);
    (0, _chai.expect)(lifecycleSpy.args[0][0]).to.equal(Foo.prototype);
    (0, _chai.expect)(lifecycleSpy.args[0][1]).to.equal("componentDidUpdate");

    (0, _chai.expect)(methodSpy.callCount).to.equal(2);
    (0, _chai.expect)(methodSpy.args[0][0]).to.equal(Foo.prototype);
    (0, _chai.expect)(methodSpy.args[0][1]).to.equal("a");
    (0, _chai.expect)(methodSpy.args[1][1]).to.equal("b");
  });

  (0, _.describeWithDom)('getNode', function () {

    it('should return a DOMNode when a DOMComponent is given', function () {
      var div = (0, _.mount)(_reactAddons2['default'].createElement('div', null)).root();
      (0, _chai.expect)((0, _Utils.getNode)(div)).to.be.instanceOf(window.HTMLElement);
    });

    it('should return the component when a component is given', function () {
      var Foo = (function (_React$Component) {
        _inherits(Foo, _React$Component);

        function Foo() {
          _classCallCheck(this, Foo);

          _get(Object.getPrototypeOf(Foo.prototype), 'constructor', this).apply(this, arguments);
        }

        _createClass(Foo, [{
          key: 'render',
          value: function render() {
            return _reactAddons2['default'].createElement('div', null);
          }
        }]);

        return Foo;
      })(_reactAddons2['default'].Component);

      var foo = (0, _.mount)(_reactAddons2['default'].createElement(Foo, null)).root();
      (0, _chai.expect)((0, _Utils.getNode)(foo)).to.equal(foo);
    });
  });

  describe('hasClassName', function () {

    it('should work for standalone classNames', function () {
      var node = (0, _.shallow)(_reactAddons2['default'].createElement('div', { className: 'foo' })).tree;
      (0, _chai.expect)((0, _Utils.hasClassName)(node, "foo")).to.be['true'];
      (0, _chai.expect)((0, _Utils.hasClassName)(node, "bar")).to.be['false'];
    });

    it('should work for multiple classNames', function () {
      var node = (0, _.shallow)(_reactAddons2['default'].createElement('div', { className: 'foo bar baz' })).tree;
      (0, _chai.expect)((0, _Utils.hasClassName)(node, "foo")).to.be['true'];
      (0, _chai.expect)((0, _Utils.hasClassName)(node, "bar")).to.be['true'];
      (0, _chai.expect)((0, _Utils.hasClassName)(node, "baz")).to.be['true'];
      (0, _chai.expect)((0, _Utils.hasClassName)(node, "bax")).to.be['false'];
    });

    it('should also allow hyphens', function () {
      var node = (0, _.shallow)(_reactAddons2['default'].createElement('div', { className: 'foo-bar' })).tree;
      (0, _chai.expect)((0, _Utils.hasClassName)(node, "foo-bar")).to.be['true'];
    });
  });

  describe('treeForEach', function () {

    it('should be called once for a leaf node', function () {
      var spy = _sinon2['default'].spy();
      var wrapper = (0, _.shallow)(_reactAddons2['default'].createElement('div', null));
      (0, _Utils.treeForEach)(wrapper.tree, spy);
      (0, _chai.expect)(spy.calledOnce).to.be['true'];
    });

    it('should handle a single child', function () {
      var spy = _sinon2['default'].spy();
      var wrapper = (0, _.shallow)(_reactAddons2['default'].createElement(
        'div',
        null,
        _reactAddons2['default'].createElement('div', null)
      ));
      (0, _Utils.treeForEach)(wrapper.tree, spy);
      (0, _chai.expect)(spy.callCount).to.equal(2);
    });

    it('should handle several children', function () {
      var spy = _sinon2['default'].spy();
      var wrapper = (0, _.shallow)(_reactAddons2['default'].createElement(
        'div',
        null,
        _reactAddons2['default'].createElement('div', null),
        _reactAddons2['default'].createElement('div', null)
      ));
      (0, _Utils.treeForEach)(wrapper.tree, spy);
      (0, _chai.expect)(spy.callCount).to.equal(3);
    });

    it('should handle multiple hierarchies', function () {
      var spy = _sinon2['default'].spy();
      var wrapper = (0, _.shallow)(_reactAddons2['default'].createElement(
        'div',
        null,
        _reactAddons2['default'].createElement(
          'div',
          null,
          _reactAddons2['default'].createElement('div', null),
          _reactAddons2['default'].createElement('div', null)
        )
      ));
      (0, _Utils.treeForEach)(wrapper.tree, spy);
      (0, _chai.expect)(spy.callCount).to.equal(4);
    });

    it('should pass in the node', function () {
      var spy = _sinon2['default'].spy();
      var wrapper = (0, _.shallow)(_reactAddons2['default'].createElement(
        'div',
        null,
        _reactAddons2['default'].createElement('button', null),
        _reactAddons2['default'].createElement(
          'nav',
          null,
          _reactAddons2['default'].createElement('input', null)
        )
      ));
      (0, _Utils.treeForEach)(wrapper.tree, spy);
      (0, _chai.expect)(spy.callCount).to.equal(4);
      (0, _chai.expect)(spy.args[0][0].type).to.equal("div");
      (0, _chai.expect)(spy.args[1][0].type).to.equal("button");
      (0, _chai.expect)(spy.args[2][0].type).to.equal("nav");
      (0, _chai.expect)(spy.args[3][0].type).to.equal("input");
    });
  });

  describe('treeFilter', function () {
    var tree = (0, _.shallow)(_reactAddons2['default'].createElement(
      'div',
      null,
      _reactAddons2['default'].createElement('button', null),
      _reactAddons2['default'].createElement('button', null),
      _reactAddons2['default'].createElement(
        'nav',
        null,
        _reactAddons2['default'].createElement('input', null)
      )
    )).tree;

    it('should return an empty array for falsey test', function () {
      (0, _chai.expect)((0, _Utils.treeFilter)(tree, function () {
        return false;
      }).length).to.equal(0);
    });

    it('should return the full array for truthy test', function () {
      (0, _chai.expect)((0, _Utils.treeFilter)(tree, function () {
        return true;
      }).length).to.equal(5);
    });

    it('should filter for truthiness', function () {
      (0, _chai.expect)((0, _Utils.treeFilter)(tree, function (node) {
        return node.type === "nav";
      }).length).to.equal(1);
      (0, _chai.expect)((0, _Utils.treeFilter)(tree, function (node) {
        return node.type === "button";
      }).length).to.equal(2);
    });
  });

  describe('nodeEqual', function () {

    function isMatch(a, b) {
      return (0, _Utils.nodeEqual)((0, _.shallow)(a).tree, (0, _.shallow)(b).tree);
    }

    it('should match empty elements of same tag', function () {

      (0, _chai.expect)(isMatch(_reactAddons2['default'].createElement('div', null), _reactAddons2['default'].createElement('div', null))).to.be['true'];
    });

    it('should not match empty elements of different type', function () {

      (0, _chai.expect)(isMatch(_reactAddons2['default'].createElement('div', null), _reactAddons2['default'].createElement('nav', null))).to.be['false'];
    });

    it('should match basic prop types', function () {

      (0, _chai.expect)(isMatch(_reactAddons2['default'].createElement('div', { className: 'foo' }), _reactAddons2['default'].createElement('div', { className: 'foo' }))).to.be['true'];

      (0, _chai.expect)(isMatch(_reactAddons2['default'].createElement('div', { id: 'foo', className: 'bar' }), _reactAddons2['default'].createElement('div', { id: 'foo', className: 'bar' }))).to.be['true'];

      (0, _chai.expect)(isMatch(_reactAddons2['default'].createElement('div', { id: 'foo', className: 'baz' }), _reactAddons2['default'].createElement('div', { id: 'foo', className: 'bar' }))).to.be['false'];
    });

    it('should check children as well', function () {

      (0, _chai.expect)(isMatch(_reactAddons2['default'].createElement(
        'div',
        null,
        _reactAddons2['default'].createElement('div', null)
      ), _reactAddons2['default'].createElement('div', null))).to.be['false'];

      (0, _chai.expect)(isMatch(_reactAddons2['default'].createElement(
        'div',
        null,
        _reactAddons2['default'].createElement('div', null)
      ), _reactAddons2['default'].createElement(
        'div',
        null,
        _reactAddons2['default'].createElement('div', null)
      ))).to.be['true'];

      (0, _chai.expect)(isMatch(_reactAddons2['default'].createElement(
        'div',
        null,
        _reactAddons2['default'].createElement('div', { className: 'foo' })
      ), _reactAddons2['default'].createElement(
        'div',
        null,
        _reactAddons2['default'].createElement('div', { className: 'foo' })
      ))).to.be['true'];

      (0, _chai.expect)(isMatch(_reactAddons2['default'].createElement(
        'div',
        null,
        _reactAddons2['default'].createElement('div', { className: 'foo' })
      ), _reactAddons2['default'].createElement(
        'div',
        null,
        _reactAddons2['default'].createElement('div', null)
      ))).to.be['false'];
    });

    it('should test deepEquality with object props', function () {

      (0, _chai.expect)(isMatch(_reactAddons2['default'].createElement('div', { foo: { a: 1, b: 2 } }), _reactAddons2['default'].createElement('div', { foo: { a: 1, b: 2 } }))).to.be['true'];

      (0, _chai.expect)(isMatch(_reactAddons2['default'].createElement('div', { foo: { a: 2, b: 2 } }), _reactAddons2['default'].createElement('div', { foo: { a: 1, b: 2 } }))).to.be['false'];
    });
  });

  describe('single', function () {

    it('should throw for multi-item arrays', function () {
      (0, _chai.expect)(function () {
        return (0, _Utils.single)([1, 2]);
      }).to['throw'];
      (0, _chai.expect)(function () {
        return (0, _Utils.single)([1]);
      }).to.not['throw'];
    });

    it('should throw for empty arrays', function () {
      (0, _chai.expect)(function () {
        return (0, _Utils.single)([]);
      }).to['throw'];
    });

    it('should return the one item', function () {
      (0, _chai.expect)((0, _Utils.single)([1])).to.equal(1);
    });
  });

  describe('isComplexSelector', function () {

    describe('complex selectors', function () {
      var isComplex = function isComplex(selector) {
        it(selector, function () {
          (0, _chai.expect)((0, _Utils.isSimpleSelector)(selector)).to.be['false'];
        });
      };

      isComplex('.foo .bar');
      isComplex('.foo.bar');
      isComplex('input.foo');
      isComplex('input[name="foo"]');
      isComplex(':visible');
      isComplex('.foo>.bar');
      isComplex('.foo > .bar');
      isComplex('.foo~.bar');
    });

    describe('complex selectors', function () {
      var isSimple = function isSimple(selector) {
        it(selector, function () {
          (0, _chai.expect)((0, _Utils.isSimpleSelector)(selector)).to.be['true'];
        });
      };

      isSimple('.foo');
      isSimple('.foo-and-foo');
      isSimple('.FoOaNdFoO');
      isSimple('tag');
    });
  });
});