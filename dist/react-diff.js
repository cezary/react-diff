'use strict';

var React = require('react');
var PropTypes = require('prop-types');
var createReactClass = require('create-react-class');
var jsdiff = require('diff');

var fnMap = {
  'chars': jsdiff.diffChars,
  'words': jsdiff.diffWords,
  'sentences': jsdiff.diffSentences,
  'json': jsdiff.diffJson
};

module.exports = createReactClass({
  displayName: 'Diff',

  getDefaultProps: function getDefaultProps() {
    return {
      inputA: '',
      inputB: '',
      type: 'chars'
    };
  },

  propTypes: {
    inputA: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    inputB: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    type: PropTypes.oneOf(['chars', 'words', 'sentences', 'json'])
  },

  render: function render() {
    var diff = fnMap[this.props.type](this.props.inputA, this.props.inputB);
    var result = diff.map(function (part, index) {
      var spanStyle = {
        backgroundColor: part.added ? 'lightgreen' : part.removed ? 'salmon' : 'lightgrey'
      };
      return React.createElement(
        'span',
        { key: index, style: spanStyle },
        part.value
      );
    });
    return React.createElement(
      'pre',
      { className: 'diff-result' },
      result
    );
  }
});
