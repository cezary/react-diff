var React = require('react');
var jsdiff = require('diff');

var fnMap = {
  'char': jsdiff.diffChars,
  'word': jsdiff.diffWords,
  'sentence': jsdiff.diffSentences,
  'json': jsdiff.diffJson
};

module.exports = React.createClass({
  displayName: 'Diff',

  getDefaultProps: function() {
    return {
      inputA: '',
      inputB: '',
      type: 'char'
    };
  },

  propTypes: {
    inputA: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.object
    ]),
    inputB: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.object
    ]),
    type: React.PropTypes.oneOf([
      'char',
      'word',
      'sentence',
      'json'
    ])
  },

  render: function () {
    var diff = fnMap[this.props.type](this.props.inputA, this.props.inputB);
    var result = diff.map(function(part) {
      var spanStyle = {
        backgroundColor: part.added ? 'lightgreen' : part.removed ? 'salmon' : 'lightgrey'
      }
      return <span style={spanStyle}>{part.value}</span>
    });
    return (
      <pre className='diff-result'>
        {result}
      </pre>
    );
  },
});
