import React from 'react';
import {diffChars, diffWords, diffWrodsWithSpace, diffLines, diffTrimmedLines, diffSentences, diffCss, diffJson} from 'diff';

var fnMap = {
  'chars': diffChars,
  'words': diffWords,
  'wordsWithSpace': diffWrodsWithSpace,
  'lines': diffLines,
  'trimmedLines': diffTrimmedLines,
  'sentences': diffSentences,
  'css': diffCss,
  'json': diffJson
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
export default class ReactDiff extends React.Component {
  constructor() {
    super();
    this.displayName = 'Diff';

    this.defaultProps = {
      inputA: '',
      inputB: '',
      type: 'chars',
      options: null,
      className: 'difference'
    };

    this.propTypes = {
      inputA: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.object
      ]),
      inputB: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.object
      ]),
      type: React.PropTypes.oneOf([
        'chars',
        'words',
        'wordsWithSpace',
        'lines',
        'trimmedLines',
        'sentences',
        'css',
        'json'
      ]),
      options: React.PropTypes.object
    }
  }

  render() {
    var diff = fnMap[this.props.type](this.props.inputA, this.props.inputB, this.props.options);

    var result = diff.map(function(part, index) {
      if (part.added) {
        return <ins key={index}>{part.value}</ins>;
      }
      if (part.removed) {
        return <del key={index}>{part.value}</del>;
      }
      return <span key={index}>{part.value}</span>;
    });

    return (
      <div {...this.props}>
        {result}
      </div>
    );
  }
};
