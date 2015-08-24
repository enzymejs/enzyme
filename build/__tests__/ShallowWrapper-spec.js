'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _chai = require('chai');

var _ = require('../');

describe('shallow', function () {

  describe('contains', function () {

    it('should allow matches on the root node', function () {
      var a = _react2['default'].createElement('div', { className: 'foo' });
      var b = _react2['default'].createElement('div', { className: 'foo' });
      var c = _react2['default'].createElement('div', { className: 'bar' });
      (0, _chai.expect)((0, _.shallow)(a).contains(b)).to.be['true'];
      (0, _chai.expect)((0, _.shallow)(a).contains(c)).to.be['false'];
    });

    it('should allow matches on a nested node', function () {
      var wrapper = (0, _.shallow)(_react2['default'].createElement(
        'div',
        null,
        _react2['default'].createElement('div', { className: 'foo' })
      ));
      var b = _react2['default'].createElement('div', { className: 'foo' });
      (0, _chai.expect)(wrapper.contains(b)).to.be['true'];
    });

    it('should match composite components', function () {
      var Foo = (function (_React$Component) {
        _inherits(Foo, _React$Component);

        function Foo() {
          _classCallCheck(this, Foo);

          _get(Object.getPrototypeOf(Foo.prototype), 'constructor', this).apply(this, arguments);
        }

        _createClass(Foo, [{
          key: 'render',
          value: function render() {
            return _react2['default'].createElement('div', null);
          }
        }]);

        return Foo;
      })(_react2['default'].Component);

      var wrapper = (0, _.shallow)(_react2['default'].createElement(
        'div',
        null,
        _react2['default'].createElement(Foo, null)
      ));
      var b = _react2['default'].createElement(Foo, null);
      (0, _chai.expect)(wrapper.contains(b)).to.be['true'];
    });
  });

  describe('find', function () {

    it('should find an element based on a class name', function () {
      var wrapper = (0, _.shallow)(_react2['default'].createElement(
        'div',
        null,
        _react2['default'].createElement('input', { className: 'foo' })
      ));
      (0, _chai.expect)(wrapper.find(".foo").type).to.equal("input");
    });

    it('should find an element based on a tag name', function () {
      var wrapper = (0, _.shallow)(_react2['default'].createElement(
        'div',
        null,
        _react2['default'].createElement('input', { className: 'foo' })
      ));
      (0, _chai.expect)(wrapper.find("input")._store.props.className).to.equal("foo");
    });

    it('should find a component based on a constructor', function () {
      var Foo = (function (_React$Component2) {
        _inherits(Foo, _React$Component2);

        function Foo() {
          _classCallCheck(this, Foo);

          _get(Object.getPrototypeOf(Foo.prototype), 'constructor', this).apply(this, arguments);
        }

        _createClass(Foo, [{
          key: 'render',
          value: function render() {
            return _react2['default'].createElement('div', null);
          }
        }]);

        return Foo;
      })(_react2['default'].Component);

      var wrapper = (0, _.shallow)(_react2['default'].createElement(
        'div',
        null,
        _react2['default'].createElement(Foo, { className: 'foo' })
      ));
      (0, _chai.expect)(wrapper.find(Foo).type).to.equal(Foo);
    });
  });

  describe('findAll', function () {

    it('should find elements based on a class name', function () {
      var wrapper = (0, _.shallow)(_react2['default'].createElement(
        'div',
        null,
        _react2['default'].createElement('input', { className: 'foo' }),
        _react2['default'].createElement('button', { className: 'foo' })
      ));
      (0, _chai.expect)(wrapper.findAll(".foo").length).to.equal(2);
    });

    it('should find elements based on a tag name', function () {
      var wrapper = (0, _.shallow)(_react2['default'].createElement(
        'div',
        null,
        _react2['default'].createElement('input', { className: 'foo' }),
        _react2['default'].createElement('input', null),
        _react2['default'].createElement('button', null)
      ));
      (0, _chai.expect)(wrapper.findAll('input').length).to.equal(2);
      (0, _chai.expect)(wrapper.findAll('button').length).to.equal(1);
    });

    it('should find elements based on a constructor', function () {
      var wrapper = (0, _.shallow)(_react2['default'].createElement(
        'div',
        null,
        _react2['default'].createElement('input', { className: 'foo' }),
        _react2['default'].createElement('input', null),
        _react2['default'].createElement('button', null)
      ));
      (0, _chai.expect)(wrapper.findAll('input').length).to.equal(2);
      (0, _chai.expect)(wrapper.findAll('button').length).to.equal(1);
    });
  });

  describe('findWhere', function () {

    it('should return all elements for a truthy test', function () {
      var wrapper = (0, _.shallow)(_react2['default'].createElement(
        'div',
        null,
        _react2['default'].createElement('input', { className: 'foo' }),
        _react2['default'].createElement('input', null)
      ));
      (0, _chai.expect)(wrapper.findWhere(function (x) {
        return true;
      }).length).to.equal(3);
    });

    it('should return no elements for a falsy test', function () {
      var wrapper = (0, _.shallow)(_react2['default'].createElement(
        'div',
        null,
        _react2['default'].createElement('input', { className: 'foo' }),
        _react2['default'].createElement('input', null)
      ));
      (0, _chai.expect)(wrapper.findWhere(function (x) {
        return false;
      }).length).to.equal(0);
    });
  });
});