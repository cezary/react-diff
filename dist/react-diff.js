'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _diff = require('diff');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var fnMap = {
  'chars': _diff.diffChars,
  'words': _diff.diffWords,
  'wordsWithSpace': _diff.diffWrodsWithSpace,
  'lines': _diff.diffLines,
  'trimmedLines': _diff.diffTrimmedLines,
  'sentences': _diff.diffSentences,
  'css': _diff.diffCss,
  'json': _diff.diffJson
};

/**
 * Display diff in a stylable form.
 *
 * Default is character diff. Change with props.type. Valid values
 * are 'chars', 'words', 'sentences', 'json'.
 *
 *  - Wrapping div has class 'Difference', override with props.className
 *  - added parts are in <ins>
 *  - removed parts are in <del>
 *  - unchanged parts are in <span>
 */

var ReactDiff = function (_React$Component) {
  _inherits(ReactDiff, _React$Component);

  function ReactDiff() {
    _classCallCheck(this, ReactDiff);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ReactDiff).call(this));

    _this.displayName = 'Diff';

    _this.defaultProps = {
      inputA: '',
      inputB: '',
      type: 'chars',
      options: null,
      className: 'difference'
    };

    _this.propTypes = {
      inputA: _react2.default.PropTypes.oneOfType([_react2.default.PropTypes.string, _react2.default.PropTypes.object]),
      inputB: _react2.default.PropTypes.oneOfType([_react2.default.PropTypes.string, _react2.default.PropTypes.object]),
      type: _react2.default.PropTypes.oneOf(['chars', 'words', 'wordsWithSpace', 'lines', 'trimmedLines', 'sentences', 'css', 'json']),
      options: _react2.default.PropTypes.object
    };
    return _this;
  }

  _createClass(ReactDiff, [{
    key: 'render',
    value: function render() {
      var diff = fnMap[this.props.type](this.props.inputA, this.props.inputB, this.props.options);

      var result = diff.map(function (part, index) {
        if (part.added) {
          return _react2.default.createElement(
            'ins',
            { key: index },
            part.value
          );
        }
        if (part.removed) {
          return _react2.default.createElement(
            'del',
            { key: index },
            part.value
          );
        }
        return _react2.default.createElement(
          'span',
          { key: index },
          part.value
        );
      });

      return _react2.default.createElement(
        'div',
        this.props,
        result
      );
    }
  }]);

  return ReactDiff;
}(_react2.default.Component);

exports.default = ReactDiff;
;

