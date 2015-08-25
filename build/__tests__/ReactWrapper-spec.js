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

(0, _.describeWithDom)('mount', function () {

  beforeEach(_.spySetup);
  afterEach(_.spyTearDown);

  it('should mount a JSX Tree with a normal dom element', function () {
    var wrapper = (0, _.mount)(_react2['default'].createElement('div', null));
  });

  it('should mount a JSX Tree with a composite element', function () {
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

    var wrapper = (0, _.mount)(_react2['default'].createElement(Foo, null));
  });

  it('should call componentDidMount', function () {
    var Foo = (function (_React$Component2) {
      _inherits(Foo, _React$Component2);

      function Foo() {
        _classCallCheck(this, Foo);

        _get(Object.getPrototypeOf(Foo.prototype), 'constructor', this).apply(this, arguments);
      }

      _createClass(Foo, [{
        key: 'componentDidMount',
        value: function componentDidMount() {}
      }, {
        key: 'render',
        value: function render() {
          return _react2['default'].createElement('div', null);
        }
      }]);

      return Foo;
    })(_react2['default'].Component);

    (0, _.spyLifecycle)(Foo);
    var wrapper = (0, _.mount)(_react2['default'].createElement(Foo, null));
    (0, _chai.expect)(Foo.prototype.componentDidMount.calledOnce).to.be['true'];
  });

  describe('setProps', function () {
    var Foo = (function (_React$Component3) {
      _inherits(Foo, _React$Component3);

      function Foo() {
        _classCallCheck(this, Foo);

        _get(Object.getPrototypeOf(Foo.prototype), 'constructor', this).apply(this, arguments);
      }

      _createClass(Foo, [{
        key: 'render',
        value: function render() {
          return _react2['default'].createElement('input', { value: this.props.value, onChange: this.props.onChange });
        }
      }]);

      return Foo;
    })(_react2['default'].Component);

    it('should be able to set props', function () {
      var spy = _.sinon.spy();
      var wrapper = (0, _.mount)(_react2['default'].createElement(Foo, { value: "foo", onChange: spy }));
      (0, _chai.expect)(wrapper.find('input').value).to.equal("foo");
      wrapper.setProps({
        value: "bar"
      });
      (0, _chai.expect)(wrapper.find('input').value).to.equal("bar");
    });
  });

  describe('ref', function () {
    var Foo = (function (_React$Component4) {
      _inherits(Foo, _React$Component4);

      function Foo() {
        _classCallCheck(this, Foo);

        _get(Object.getPrototypeOf(Foo.prototype), 'constructor', this).apply(this, arguments);
      }

      _createClass(Foo, [{
        key: 'render',
        value: function render() {
          return _react2['default'].createElement('div', { ref: 'ref' });
        }
      }]);

      return Foo;
    })(_react2['default'].Component);

    it('should find the ref by name', function () {
      var wrapper = (0, _.mount)(_react2['default'].createElement(Foo, null));
      var ref = wrapper.ref('ref');
      (0, _chai.expect)(ref).to.be.defined;
    });
  });

  describe('findWhere', function () {
    it('should find a single element', function () {
      var wrapper = (0, _.mount)(_react2['default'].createElement(
        'div',
        null,
        _react2['default'].createElement('input', null)
      ));
      (0, _chai.expect)(wrapper.find('input'));
    });
  });

  describe('find', function () {
    it('should return a single element', function () {
      var wrapper = (0, _.mount)(_react2['default'].createElement(
        'div',
        null,
        _react2['default'].createElement('input', null)
      ));
      (0, _chai.expect)(wrapper.find('input')).to.be.instanceOf(HTMLInputElement);
    });

    it('should accept a tag name as a selector', function () {
      var wrapper = (0, _.mount)(_react2['default'].createElement(
        'div',
        null,
        _react2['default'].createElement('input', null)
      ));
      (0, _chai.expect)(wrapper.find('input')).to.be.instanceOf(HTMLInputElement);
    });

    it('should accept a class name as a selector', function () {
      var wrapper = (0, _.mount)(_react2['default'].createElement(
        'div',
        null,
        _react2['default'].createElement('button', { className: 'foo' })
      ));
      (0, _chai.expect)(wrapper.find('.foo')).to.be.instanceOf(HTMLButtonElement);
    });

    it('should accept a component constructor as a selector', function () {
      var Foo = (function (_React$Component5) {
        _inherits(Foo, _React$Component5);

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

      var wrapper = (0, _.mount)(_react2['default'].createElement(
        'div',
        null,
        _react2['default'].createElement(Foo, null)
      ));
      (0, _chai.expect)((0, _.isComponentWithType)(wrapper.find(Foo), Foo)).to.be['true'];
    });
  });

  describe('findAll', function () {
    it('should return an array of elements', function () {
      var wrapper = (0, _.mount)(_react2['default'].createElement(
        'div',
        null,
        _react2['default'].createElement('input', null),
        _react2['default'].createElement('button', null),
        _react2['default'].createElement('button', null)
      ));
      var inputs = wrapper.findAll('input');
      var buttons = wrapper.findAll('button');
      (0, _chai.expect)(inputs).to.be.instanceOf(Array);
      (0, _chai.expect)(inputs.length).to.equal(1);
      (0, _chai.expect)(buttons).to.be.instanceOf(Array);
      (0, _chai.expect)(buttons.length).to.equal(2);
    });

    it('should accept a tag name as a selector', function () {
      var wrapper = (0, _.mount)(_react2['default'].createElement(
        'div',
        null,
        _react2['default'].createElement('input', null),
        _react2['default'].createElement('button', null),
        _react2['default'].createElement('button', null)
      ));
      var buttons = wrapper.findAll('button');
      (0, _chai.expect)(buttons).to.be.instanceOf(Array);
      (0, _chai.expect)(buttons.length).to.equal(2);
    });

    it('should accept a class name as a selector', function () {
      var wrapper = (0, _.mount)(_react2['default'].createElement(
        'div',
        null,
        _react2['default'].createElement('button', { className: 'foo' }),
        _react2['default'].createElement('button', { className: 'foo' })
      ));
      (0, _chai.expect)(wrapper.findAll('.foo').length).to.equal(2);
    });

    it('should accept a component constructor as a selector', function () {
      var Foo = (function (_React$Component6) {
        _inherits(Foo, _React$Component6);

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

      var wrapper = (0, _.mount)(_react2['default'].createElement(
        'div',
        null,
        _react2['default'].createElement(Foo, null),
        _react2['default'].createElement(Foo, null)
      ));
      (0, _chai.expect)(wrapper.findAll(Foo).length).to.equal(2);
    });
  });
});