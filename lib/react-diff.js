var React = require('react');
var jsdiff = require('diff');

module.exports = React.createClass({
  displayName: 'Diff',

  render: function () {
    var diff = jsdiff.diffChars(this.props.stringA, this.props.stringB);
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
