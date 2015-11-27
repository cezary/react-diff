'use strict';

var React = require('react');
var jsdiff = require('diff');

var fnMap = {
  'chars': jsdiff.diffChars,
  'words': jsdiff.diffWords,
  'sentences': jsdiff.diffSentences,
  'json': jsdiff.diffJson
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
module.exports = React.createClass({
  displayName: 'Diff',

  getDefaultProps: function getDefaultProps() {
    return {
      inputA: '',
      inputB: '',
      type: 'chars',
      className: 'Difference'
    };
  },

  propTypes: {
    inputA: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.object]),
    inputB: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.object]),
    type: React.PropTypes.oneOf(['chars', 'words', 'sentences', 'json']),
    className: React.PropTypes.string
  },

  render: function render() {
    var diff = fnMap[this.props.type](this.props.inputA, this.props.inputB);

    var result = diff.map(function (part, index) {
      if (part.added) {
        return React.createElement(
          'ins',
          { key: index },
          part.value
        );
      }
      if (part.removed) {
        return React.createElement(
          'del',
          { key: index },
          part.value
        );
      }
      return React.createElement(
        'span',
        { key: index },
        part.value
      );
    });

    return React.createElement(
      'div',
      { className: this.props.className },
      result
    );
  }
});

