(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("React"));
	else if(typeof define === 'function' && define.amd)
		define(["React"], factory);
	else if(typeof exports === 'object')
		exports["Diff"] = factory(require("React"));
	else
		root["Diff"] = factory(root["React"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_2__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(2);
	var jsdiff = __webpack_require__(3);
	
	var fnMap = {
	  'chars': jsdiff.diffChars,
	  'words': jsdiff.diffWords,
	  'sentences': jsdiff.diffSentences,
	  'json': jsdiff.diffJson
	};
	
	module.exports = React.createClass({
	  displayName: 'Diff',
	
	  getDefaultProps: function() {
	    return {
	      inputA: '',
	      inputB: '',
	      type: 'chars'
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
	      'chars',
	      'words',
	      'sentences',
	      'json'
	    ])
	  },
	
	  render: function () {
	    var diff = fnMap[this.props.type](this.props.inputA, this.props.inputB);
	    var result = diff.map(function(part) {
	      var spanStyle = {
	        backgroundColor: part.added ? 'lightgreen' : part.removed ? 'salmon' : 'lightgrey'
	      }
	      return React.createElement("span", {style: spanStyle}, part.value)
	    });
	    return (
	      React.createElement("pre", {className: "diff-result"}, 
	        result
	      )
	    );
	  },
	});


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_2__;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	/* See LICENSE file for terms of use */
	
	/*
	 * Text diff implementation.
	 *
	 * This library supports the following APIS:
	 * JsDiff.diffChars: Character by character diff
	 * JsDiff.diffWords: Word (as defined by \b regex) diff which ignores whitespace
	 * JsDiff.diffLines: Line based diff
	 *
	 * JsDiff.diffCss: Diff targeted at CSS content
	 *
	 * These methods are based on the implementation proposed in
	 * "An O(ND) Difference Algorithm and its Variations" (Myers, 1986).
	 * http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.4.6927
	 */
	(function(global, undefined) {
	  var JsDiff = (function() {
	    /*jshint maxparams: 5*/
	    /*istanbul ignore next*/
	    function map(arr, mapper, that) {
	      if (Array.prototype.map) {
	        return Array.prototype.map.call(arr, mapper, that);
	      }
	
	      var other = new Array(arr.length);
	
	      for (var i = 0, n = arr.length; i < n; i++) {
	        other[i] = mapper.call(that, arr[i], i, arr);
	      }
	      return other;
	    }
	    function clonePath(path) {
	      return { newPos: path.newPos, components: path.components.slice(0) };
	    }
	    function removeEmpty(array) {
	      var ret = [];
	      for (var i = 0; i < array.length; i++) {
	        if (array[i]) {
	          ret.push(array[i]);
	        }
	      }
	      return ret;
	    }
	    function escapeHTML(s) {
	      var n = s;
	      n = n.replace(/&/g, '&amp;');
	      n = n.replace(/</g, '&lt;');
	      n = n.replace(/>/g, '&gt;');
	      n = n.replace(/"/g, '&quot;');
	
	      return n;
	    }
	
	    function buildValues(components, newString, oldString, useLongestToken) {
	      var componentPos = 0,
	          componentLen = components.length,
	          newPos = 0,
	          oldPos = 0;
	
	      for (; componentPos < componentLen; componentPos++) {
	        var component = components[componentPos];
	        if (!component.removed) {
	          if (!component.added && useLongestToken) {
	            var value = newString.slice(newPos, newPos + component.count);
	            value = map(value, function(value, i) {
	              var oldValue = oldString[oldPos + i];
	              return oldValue.length > value.length ? oldValue : value;
	            });
	
	            component.value = value.join('');
	          } else {
	            component.value = newString.slice(newPos, newPos + component.count).join('');
	          }
	          newPos += component.count;
	
	          // Common case
	          if (!component.added) {
	            oldPos += component.count;
	          }
	        } else {
	          component.value = oldString.slice(oldPos, oldPos + component.count).join('');
	          oldPos += component.count;
	        }
	      }
	
	      return components;
	    }
	
	    var Diff = function(ignoreWhitespace) {
	      this.ignoreWhitespace = ignoreWhitespace;
	    };
	    Diff.prototype = {
	        diff: function(oldString, newString, callback) {
	          var self = this;
	
	          function done(value) {
	            if (callback) {
	              setTimeout(function() { callback(undefined, value); }, 0);
	              return true;
	            } else {
	              return value;
	            }
	          }
	
	          // Handle the identity case (this is due to unrolling editLength == 0
	          if (newString === oldString) {
	            return done([{ value: newString }]);
	          }
	          if (!newString) {
	            return done([{ value: oldString, removed: true }]);
	          }
	          if (!oldString) {
	            return done([{ value: newString, added: true }]);
	          }
	
	          newString = this.tokenize(newString);
	          oldString = this.tokenize(oldString);
	
	          var newLen = newString.length, oldLen = oldString.length;
	          var maxEditLength = newLen + oldLen;
	          var bestPath = [{ newPos: -1, components: [] }];
	
	          // Seed editLength = 0, i.e. the content starts with the same values
	          var oldPos = this.extractCommon(bestPath[0], newString, oldString, 0);
	          if (bestPath[0].newPos+1 >= newLen && oldPos+1 >= oldLen) {
	            // Identity per the equality and tokenizer
	            return done([{value: newString.join('')}]);
	          }
	
	          // Main worker method. checks all permutations of a given edit length for acceptance.
	          function execEditLength() {
	            for (var diagonalPath = -1*editLength; diagonalPath <= editLength; diagonalPath+=2) {
	              var basePath;
	              var addPath = bestPath[diagonalPath-1],
	                  removePath = bestPath[diagonalPath+1];
	              oldPos = (removePath ? removePath.newPos : 0) - diagonalPath;
	              if (addPath) {
	                // No one else is going to attempt to use this value, clear it
	                bestPath[diagonalPath-1] = undefined;
	              }
	
	              var canAdd = addPath && addPath.newPos+1 < newLen;
	              var canRemove = removePath && 0 <= oldPos && oldPos < oldLen;
	              if (!canAdd && !canRemove) {
	                // If this path is a terminal then prune
	                bestPath[diagonalPath] = undefined;
	                continue;
	              }
	
	              // Select the diagonal that we want to branch from. We select the prior
	              // path whose position in the new string is the farthest from the origin
	              // and does not pass the bounds of the diff graph
	              if (!canAdd || (canRemove && addPath.newPos < removePath.newPos)) {
	                basePath = clonePath(removePath);
	                self.pushComponent(basePath.components, undefined, true);
	              } else {
	                basePath = addPath;   // No need to clone, we've pulled it from the list
	                basePath.newPos++;
	                self.pushComponent(basePath.components, true, undefined);
	              }
	
	              var oldPos = self.extractCommon(basePath, newString, oldString, diagonalPath);
	
	              // If we have hit the end of both strings, then we are done
	              if (basePath.newPos+1 >= newLen && oldPos+1 >= oldLen) {
	                return done(buildValues(basePath.components, newString, oldString, self.useLongestToken));
	              } else {
	                // Otherwise track this path as a potential candidate and continue.
	                bestPath[diagonalPath] = basePath;
	              }
	            }
	
	            editLength++;
	          }
	
	          // Performs the length of edit iteration. Is a bit fugly as this has to support the 
	          // sync and async mode which is never fun. Loops over execEditLength until a value
	          // is produced.
	          var editLength = 1;
	          if (callback) {
	            (function exec() {
	              setTimeout(function() {
	                // This should not happen, but we want to be safe.
	                /*istanbul ignore next */
	                if (editLength > maxEditLength) {
	                  return callback();
	                }
	
	                if (!execEditLength()) {
	                  exec();
	                }
	              }, 0);
	            })();
	          } else {
	            while(editLength <= maxEditLength) {
	              var ret = execEditLength();
	              if (ret) {
	                return ret;
	              }
	            }
	          }
	        },
	
	        pushComponent: function(components, added, removed) {
	          var last = components[components.length-1];
	          if (last && last.added === added && last.removed === removed) {
	            // We need to clone here as the component clone operation is just
	            // as shallow array clone
	            components[components.length-1] = {count: last.count + 1, added: added, removed: removed };
	          } else {
	            components.push({count: 1, added: added, removed: removed });
	          }
	        },
	        extractCommon: function(basePath, newString, oldString, diagonalPath) {
	          var newLen = newString.length,
	              oldLen = oldString.length,
	              newPos = basePath.newPos,
	              oldPos = newPos - diagonalPath,
	
	              commonCount = 0;
	          while (newPos+1 < newLen && oldPos+1 < oldLen && this.equals(newString[newPos+1], oldString[oldPos+1])) {
	            newPos++;
	            oldPos++;
	            commonCount++;
	          }
	
	          if (commonCount) {
	            basePath.components.push({count: commonCount});
	          }
	
	          basePath.newPos = newPos;
	          return oldPos;
	        },
	
	        equals: function(left, right) {
	          var reWhitespace = /\S/;
	          return left === right || (this.ignoreWhitespace && !reWhitespace.test(left) && !reWhitespace.test(right));
	        },
	        tokenize: function(value) {
	          return value.split('');
	        }
	    };
	
	    var CharDiff = new Diff();
	
	    var WordDiff = new Diff(true);
	    var WordWithSpaceDiff = new Diff();
	    WordDiff.tokenize = WordWithSpaceDiff.tokenize = function(value) {
	      return removeEmpty(value.split(/(\s+|\b)/));
	    };
	
	    var CssDiff = new Diff(true);
	    CssDiff.tokenize = function(value) {
	      return removeEmpty(value.split(/([{}:;,]|\s+)/));
	    };
	
	    var LineDiff = new Diff();
	    LineDiff.tokenize = function(value) {
	      var retLines = [],
	          lines = value.split(/^/m);
	
	      for(var i = 0; i < lines.length; i++) {
	        var line = lines[i],
	            lastLine = lines[i - 1];
	
	        // Merge lines that may contain windows new lines
	        if (line === '\n' && lastLine && lastLine[lastLine.length - 1] === '\r') {
	          retLines[retLines.length - 1] += '\n';
	        } else if (line) {
	          retLines.push(line);
	        }
	      }
	
	      return retLines;
	    };
	
	    var SentenceDiff = new Diff();
	    SentenceDiff.tokenize = function (value) {
	      return removeEmpty(value.split(/(\S.+?[.!?])(?=\s+|$)/));
	    };
	
	    var JsonDiff = new Diff();
	    // Discriminate between two lines of pretty-printed, serialized JSON where one of them has a
	    // dangling comma and the other doesn't. Turns out including the dangling comma yields the nicest output:
	    JsonDiff.useLongestToken = true;
	    JsonDiff.tokenize = LineDiff.tokenize;
	    JsonDiff.equals = function(left, right) {
	      return LineDiff.equals(left.replace(/,([\r\n])/g, '$1'), right.replace(/,([\r\n])/g, '$1'));
	    };
	
	    var objectPrototypeToString = Object.prototype.toString;
	
	    // This function handles the presence of circular references by bailing out when encountering an
	    // object that is already on the "stack" of items being processed.
	    function canonicalize(obj, stack, replacementStack) {
	      stack = stack || [];
	      replacementStack = replacementStack || [];
	
	      var i;
	
	      for (var i = 0 ; i < stack.length ; i += 1) {
	        if (stack[i] === obj) {
	          return replacementStack[i];
	        }
	      }
	
	      var canonicalizedObj;
	
	      if ('[object Array]' === objectPrototypeToString.call(obj)) {
	        stack.push(obj);
	        canonicalizedObj = new Array(obj.length);
	        replacementStack.push(canonicalizedObj);
	        for (i = 0 ; i < obj.length ; i += 1) {
	          canonicalizedObj[i] = canonicalize(obj[i], stack, replacementStack);
	        }
	        stack.pop();
	        replacementStack.pop();
	      } else if (typeof obj === 'object' && obj !== null) {
	        stack.push(obj);
	        canonicalizedObj = {};
	        replacementStack.push(canonicalizedObj);
	        var sortedKeys = [];
	        for (var key in obj) {
	          sortedKeys.push(key);
	        }
	        sortedKeys.sort();
	        for (i = 0 ; i < sortedKeys.length ; i += 1) {
	          var key = sortedKeys[i];
	          canonicalizedObj[key] = canonicalize(obj[key], stack, replacementStack);
	        }
	        stack.pop();
	        replacementStack.pop();
	      } else {
	        canonicalizedObj = obj;
	      }
	      return canonicalizedObj;
	    }
	
	    return {
	      Diff: Diff,
	
	      diffChars: function(oldStr, newStr, callback) { return CharDiff.diff(oldStr, newStr, callback); },
	      diffWords: function(oldStr, newStr, callback) { return WordDiff.diff(oldStr, newStr, callback); },
	      diffWordsWithSpace: function(oldStr, newStr, callback) { return WordWithSpaceDiff.diff(oldStr, newStr, callback); },
	      diffLines: function(oldStr, newStr, callback) { return LineDiff.diff(oldStr, newStr, callback); },
	      diffSentences: function(oldStr, newStr, callback) { return SentenceDiff.diff(oldStr, newStr, callback); },
	
	      diffCss: function(oldStr, newStr, callback) { return CssDiff.diff(oldStr, newStr, callback); },
	      diffJson: function(oldObj, newObj, callback) {
	        return JsonDiff.diff(
	          typeof oldObj === 'string' ? oldObj : JSON.stringify(canonicalize(oldObj), undefined, '  '),
	          typeof newObj === 'string' ? newObj : JSON.stringify(canonicalize(newObj), undefined, '  '),
	          callback
	        );
	      },
	
	      createPatch: function(fileName, oldStr, newStr, oldHeader, newHeader) {
	        var ret = [];
	
	        ret.push('Index: ' + fileName);
	        ret.push('===================================================================');
	        ret.push('--- ' + fileName + (typeof oldHeader === 'undefined' ? '' : '\t' + oldHeader));
	        ret.push('+++ ' + fileName + (typeof newHeader === 'undefined' ? '' : '\t' + newHeader));
	
	        var diff = LineDiff.diff(oldStr, newStr);
	        if (!diff[diff.length-1].value) {
	          diff.pop();   // Remove trailing newline add
	        }
	        diff.push({value: '', lines: []});   // Append an empty value to make cleanup easier
	
	        function contextLines(lines) {
	          return map(lines, function(entry) { return ' ' + entry; });
	        }
	        function eofNL(curRange, i, current) {
	          var last = diff[diff.length-2],
	              isLast = i === diff.length-2,
	              isLastOfType = i === diff.length-3 && (current.added !== last.added || current.removed !== last.removed);
	
	          // Figure out if this is the last line for the given file and missing NL
	          if (!/\n$/.test(current.value) && (isLast || isLastOfType)) {
	            curRange.push('\\ No newline at end of file');
	          }
	        }
	
	        var oldRangeStart = 0, newRangeStart = 0, curRange = [],
	            oldLine = 1, newLine = 1;
	        for (var i = 0; i < diff.length; i++) {
	          var current = diff[i],
	              lines = current.lines || current.value.replace(/\n$/, '').split('\n');
	          current.lines = lines;
	
	          if (current.added || current.removed) {
	            if (!oldRangeStart) {
	              var prev = diff[i-1];
	              oldRangeStart = oldLine;
	              newRangeStart = newLine;
	
	              if (prev) {
	                curRange = contextLines(prev.lines.slice(-4));
	                oldRangeStart -= curRange.length;
	                newRangeStart -= curRange.length;
	              }
	            }
	            curRange.push.apply(curRange, map(lines, function(entry) { return (current.added?'+':'-') + entry; }));
	            eofNL(curRange, i, current);
	
	            if (current.added) {
	              newLine += lines.length;
	            } else {
	              oldLine += lines.length;
	            }
	          } else {
	            if (oldRangeStart) {
	              // Close out any changes that have been output (or join overlapping)
	              if (lines.length <= 8 && i < diff.length-2) {
	                // Overlapping
	                curRange.push.apply(curRange, contextLines(lines));
	              } else {
	                // end the range and output
	                var contextSize = Math.min(lines.length, 4);
	                ret.push(
	                    '@@ -' + oldRangeStart + ',' + (oldLine-oldRangeStart+contextSize)
	                    + ' +' + newRangeStart + ',' + (newLine-newRangeStart+contextSize)
	                    + ' @@');
	                ret.push.apply(ret, curRange);
	                ret.push.apply(ret, contextLines(lines.slice(0, contextSize)));
	                if (lines.length <= 4) {
	                  eofNL(ret, i, current);
	                }
	
	                oldRangeStart = 0;  newRangeStart = 0; curRange = [];
	              }
	            }
	            oldLine += lines.length;
	            newLine += lines.length;
	          }
	        }
	
	        return ret.join('\n') + '\n';
	      },
	
	      applyPatch: function(oldStr, uniDiff) {
	        var diffstr = uniDiff.split('\n');
	        var diff = [];
	        var remEOFNL = false,
	            addEOFNL = false;
	
	        for (var i = (diffstr[0][0]==='I'?4:0); i < diffstr.length; i++) {
	          if(diffstr[i][0] === '@') {
	            var meh = diffstr[i].split(/@@ -(\d+),(\d+) \+(\d+),(\d+) @@/);
	            diff.unshift({
	              start:meh[3],
	              oldlength:meh[2],
	              oldlines:[],
	              newlength:meh[4],
	              newlines:[]
	            });
	          } else if(diffstr[i][0] === '+') {
	            diff[0].newlines.push(diffstr[i].substr(1));
	          } else if(diffstr[i][0] === '-') {
	            diff[0].oldlines.push(diffstr[i].substr(1));
	          } else if(diffstr[i][0] === ' ') {
	            diff[0].newlines.push(diffstr[i].substr(1));
	            diff[0].oldlines.push(diffstr[i].substr(1));
	          } else if(diffstr[i][0] === '\\') {
	            if (diffstr[i-1][0] === '+') {
	              remEOFNL = true;
	            } else if(diffstr[i-1][0] === '-') {
	              addEOFNL = true;
	            }
	          }
	        }
	
	        var str = oldStr.split('\n');
	        for (var i = diff.length - 1; i >= 0; i--) {
	          var d = diff[i];
	          for (var j = 0; j < d.oldlength; j++) {
	            if(str[d.start-1+j] !== d.oldlines[j]) {
	              return false;
	            }
	          }
	          Array.prototype.splice.apply(str,[d.start-1,+d.oldlength].concat(d.newlines));
	        }
	
	        if (remEOFNL) {
	          while (!str[str.length-1]) {
	            str.pop();
	          }
	        } else if (addEOFNL) {
	          str.push('');
	        }
	        return str.join('\n');
	      },
	
	      convertChangesToXML: function(changes){
	        var ret = [];
	        for ( var i = 0; i < changes.length; i++) {
	          var change = changes[i];
	          if (change.added) {
	            ret.push('<ins>');
	          } else if (change.removed) {
	            ret.push('<del>');
	          }
	
	          ret.push(escapeHTML(change.value));
	
	          if (change.added) {
	            ret.push('</ins>');
	          } else if (change.removed) {
	            ret.push('</del>');
	          }
	        }
	        return ret.join('');
	      },
	
	      // See: http://code.google.com/p/google-diff-match-patch/wiki/API
	      convertChangesToDMP: function(changes){
	        var ret = [], change;
	        for ( var i = 0; i < changes.length; i++) {
	          change = changes[i];
	          ret.push([(change.added ? 1 : change.removed ? -1 : 0), change.value]);
	        }
	        return ret;
	      },
	
	      canonicalize: canonicalize
	    };
	  })();
	
	  /*istanbul ignore next */
	  if (true) {
	      module.exports = JsDiff;
	  }
	  else if (typeof define === 'function') {
	    /*global define */
	    define([], function() { return JsDiff; });
	  }
	  else if (typeof global.JsDiff === 'undefined') {
	    global.JsDiff = JsDiff;
	  }
	})(this);


/***/ }
/******/ ])
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCA3M2U5OGNhNWFhM2UzMjU4MmU0ZiIsIndlYnBhY2s6Ly8vLi9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9saWIvcmVhY3QtZGlmZi5qcyIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJSZWFjdFwiIiwid2VicGFjazovLy8uL34vZGlmZi9kaWZmLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRCxPO0FDVkE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsdUJBQWU7QUFDZjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQSx3Qzs7Ozs7OztBQ3RDQSxPQUFNLENBQUMsT0FBTyxHQUFHLG1CQUFPLENBQUMsQ0FBa0IsQ0FBQyxDQUFDOzs7Ozs7O0FDQTdDLEtBQUksS0FBSyxHQUFHLG1CQUFPLENBQUMsQ0FBTyxDQUFDLENBQUM7QUFDN0IsS0FBSSxNQUFNLEdBQUcsbUJBQU8sQ0FBQyxDQUFNLENBQUMsQ0FBQzs7QUFFN0IsS0FBSSxLQUFLLEdBQUc7R0FDVixPQUFPLEVBQUUsTUFBTSxDQUFDLFNBQVM7R0FDekIsT0FBTyxFQUFFLE1BQU0sQ0FBQyxTQUFTO0dBQ3pCLFdBQVcsRUFBRSxNQUFNLENBQUMsYUFBYTtHQUNqQyxNQUFNLEVBQUUsTUFBTSxDQUFDLFFBQVE7QUFDekIsRUFBQyxDQUFDOztBQUVGLE9BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQztBQUNuQyxHQUFFLFdBQVcsRUFBRSxNQUFNOztHQUVuQixlQUFlLEVBQUUsV0FB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RyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1dBQ3hDLE1BQU0sR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7V0FDcEIsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sQ0FBQyxLQUFLLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1VBQ3hFO1NBQ0QsT0FBTyxHQUFHLENBQUM7QUFDbkIsUUFBTzs7T0FFRCxZQUFZLEVBQUUsWUFBWTtNQUMzQixDQUFDO0FBQ04sSUFBRyxHQUFHLENBQUM7QUFDUDs7R0FFRSxJQUFJLElBQTZCLEVBQUU7T0FDL0IsTUFBTSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7SUFDM0I7QUFDSCxRQUFPLElBQUksT0FBTyxNQUFNLEtBQUssVUFBVSxFQUFFOztLQUVyQyxNQUFNLENBQUMsRUFBRSxFQUFFLFdBQVcsRUFBRSxPQUFPLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUMzQztRQUNJLElBQUksT0FBTyxNQUFNLENBQUMsTUFBTSxLQUFLLFdBQVcsRUFBRTtLQUM3QyxNQUFNLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztJQUN4QjtFQUNGLEVBQUUsSUFBSSxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gd2VicGFja1VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24ocm9vdCwgZmFjdG9yeSkge1xuXHRpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcpXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJlcXVpcmUoXCJSZWFjdFwiKSk7XG5cdGVsc2UgaWYodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKVxuXHRcdGRlZmluZShbXCJSZWFjdFwiXSwgZmFjdG9yeSk7XG5cdGVsc2UgaWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKVxuXHRcdGV4cG9ydHNbXCJEaWZmXCJdID0gZmFjdG9yeShyZXF1aXJlKFwiUmVhY3RcIikpO1xuXHRlbHNlXG5cdFx0cm9vdFtcIkRpZmZcIl0gPSBmYWN0b3J5KHJvb3RbXCJSZWFjdFwiXSk7XG59KSh0aGlzLCBmdW5jdGlvbihfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFXzJfXykge1xucmV0dXJuIFxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIHdlYnBhY2svdW5pdmVyc2FsTW9kdWxlRGVmaW5pdGlvblxuICoqLyIsIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKVxuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuXG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRleHBvcnRzOiB7fSxcbiBcdFx0XHRpZDogbW9kdWxlSWQsXG4gXHRcdFx0bG9hZGVkOiBmYWxzZVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sb2FkZWQgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKDApO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIHdlYnBhY2svYm9vdHN0cmFwIDczZTk4Y2E1YWEzZTMyNTgyZTRmXG4gKiovIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2xpYi9yZWFjdC1kaWZmJyk7XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL2luZGV4LmpzXG4gKiovIiwidmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBqc2RpZmYgPSByZXF1aXJlKCdkaWZmJyk7XG5cbnZhciBmbk1hcCA9IHtcbiAgJ2NoYXJzJzoganNkaWZmLmRpZmZDaGFycyxcbiAgJ3dvcmRzJzoganNkaWZmLmRpZmZXb3JkcyxcbiAgJ3NlbnRlbmNlcyc6IGpzZGlmZi5kaWZmU2VudGVuY2VzLFxuICAnanNvbic6IGpzZGlmZi5kaWZmSnNvblxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gIGRpc3BsYXlOYW1lOiAnRGlmZicsXG5cbiAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgaW5wdXRBOiAnJyxcbiAgICAgIGlucHV0QjogJycsXG4gICAgICB0eXBlOiAnY2hhcnMnXG4gICAgfTtcbiAgfSxcblxuICBwcm9wVHlwZXM6IHtcbiAgICBpbnB1dEE6IFJlYWN0LlByb3BUeXBlcy5vbmVPZlR5cGUoW1xuICAgICAgUmVhY3QuUHJvcFR5cGVzLnN0cmluZyxcbiAgICAgIFJlYWN0LlByb3BUeXBlcy5vYmplY3RcbiAgICBdKSxcbiAgICBpbnB1dEI6IFJlYWN0LlByb3BUeXBlcy5vbmVPZlR5cGUoW1xuICAgICAgUmVhY3QuUHJvcFR5cGVzLnN0cmluZyxcbiAgICAgIFJlYWN0LlByb3BUeXBlcy5vYmplY3RcbiAgICBdKSxcbiAgICB0eXBlOiBSZWFjdC5Qcm9wVHlwZXMub25lT2YoW1xuICAgICAgJ2NoYXJzJyxcbiAgICAgICd3b3JkcycsXG4gICAgICAnc2VudGVuY2VzJyxcbiAgICAgICdqc29uJ1xuICAgIF0pXG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGRpZmYgPSBmbk1hcFt0aGlzLnByb3BzLnR5cGVdKHRoaXMucHJvcHMuaW5wdXRBLCB0aGlzLnByb3BzLmlucHV0Qik7XG4gICAgdmFyIHJlc3VsdCA9IGRpZmYubWFwKGZ1bmN0aW9uKHBhcnQpIHtcbiAgICAgIHZhciBzcGFuU3R5bGUgPSB7XG4gICAgICAgIGJhY2tncm91bmRDb2xvcjogcGFydC5hZGRlZCA/ICdsaWdodGdyZWVuJyA6IHBhcnQucmVtb3ZlZCA/ICdzYWxtb24nIDogJ2xpZ2h0Z3JleSdcbiAgICAgIH1cbiAgICAgIHJldHVybiA8c3BhbiBzdHlsZT17c3BhblN0eWxlfT57cGFydC52YWx1ZX08L3NwYW4+XG4gICAgfSk7XG4gICAgcmV0dXJuIChcbiAgICAgIDxwcmUgY2xhc3NOYW1lPSdkaWZmLXJlc3VsdCc+XG4gICAgICAgIHtyZXN1bHR9XG4gICAgICA8L3ByZT5cbiAgICApO1xuICB9LFxufSk7XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL2xpYi9yZWFjdC1kaWZmLmpzXG4gKiovIiwibW9kdWxlLmV4cG9ydHMgPSBfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFXzJfXztcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIGV4dGVybmFsIFwiUmVhY3RcIlxuICoqIG1vZHVsZSBpZCA9IDJcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8qIFNlZSBMSUNFTlNFIGZpbGUgZm9yIHRlcm1zIG9mIHVzZSAqL1xuXG4vKlxuICogVGV4dCBkaWZmIGltcGxlbWVudGF0aW9uLlxuICpcbiAqIFRoaXMgbGlicmFyeSBzdXBwb3J0cyB0aGUgZm9sbG93aW5nIEFQSVM6XG4gKiBKc0RpZmYuZGlmZkNoYXJzOiBDaGFyYWN0ZXIgYnkgY2hhcmFjdGVyIGRpZmZcbiAqIEpzRGlmZi5kaWZmV29yZHM6IFdvcmQgKGFzIGRlZmluZWQgYnkgXFxiIHJlZ2V4KSBkaWZmIHdoaWNoIGlnbm9yZXMgd2hpdGVzcGFjZVxuICogSnNEaWZmLmRpZmZMaW5lczogTGluZSBiYXNlZCBkaWZmXG4gKlxuICogSnNEaWZmLmRpZmZDc3M6IERpZmYgdGFyZ2V0ZWQgYXQgQ1NTIGNvbnRlbnRcbiAqXG4gKiBUaGVzZSBtZXRob2RzIGFyZSBiYXNlZCBvbiB0aGUgaW1wbGVtZW50YXRpb24gcHJvcG9zZWQgaW5cbiAqIFwiQW4gTyhORCkgRGlmZmVyZW5jZSBBbGdvcml0aG0gYW5kIGl0cyBWYXJpYXRpb25zXCIgKE15ZXJzLCAxOTg2KS5cbiAqIGh0dHA6Ly9jaXRlc2VlcnguaXN0LnBzdS5lZHUvdmlld2RvYy9zdW1tYXJ5P2RvaT0xMC4xLjEuNC42OTI3XG4gKi9cbihmdW5jdGlvbihnbG9iYWwsIHVuZGVmaW5lZCkge1xuICB2YXIgSnNEaWZmID0gKGZ1bmN0aW9uKCkge1xuICAgIC8qanNoaW50IG1heHBhcmFtczogNSovXG4gICAgLyppc3RhbmJ1bCBpZ25vcmUgbmV4dCovXG4gICAgZnVuY3Rpb24gbWFwKGFyciwgbWFwcGVyLCB0aGF0KSB7XG4gICAgICBpZiAoQXJyYXkucHJvdG90eXBlLm1hcCkge1xuICAgICAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLm1hcC5jYWxsKGFyciwgbWFwcGVyLCB0aGF0KTtcbiAgICAgIH1cblxuICAgICAgdmFyIG90aGVyID0gbmV3IEFycmF5KGFyci5sZW5ndGgpO1xuXG4gICAgICBmb3IgKHZhciBpID0gMCwgbiA9IGFyci5sZW5ndGg7IGkgPCBuOyBpKyspIHtcbiAgICAgICAgb3RoZXJbaV0gPSBtYXBwZXIuY2FsbCh0aGF0LCBhcnJbaV0sIGksIGFycik7XG4gICAgICB9XG4gICAgICByZXR1cm4gb3RoZXI7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGNsb25lUGF0aChwYXRoKSB7XG4gICAgICByZXR1cm4geyBuZXdQb3M6IHBhdGgubmV3UG9zLCBjb21wb25lbnRzOiBwYXRoLmNvbXBvbmVudHMuc2xpY2UoMCkgfTtcbiAgICB9XG4gICAgZnVuY3Rpb24gcmVtb3ZlRW1wdHkoYXJyYXkpIHtcbiAgICAgIHZhciByZXQgPSBbXTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGFycmF5W2ldKSB7XG4gICAgICAgICAgcmV0LnB1c2goYXJyYXlbaV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH1cbiAgICBmdW5jdGlvbiBlc2NhcGVIVE1MKHMpIHtcbiAgICAgIHZhciBuID0gcztcbiAgICAgIG4gPSBuLnJlcGxhY2UoLyYvZywgJyZhbXA7Jyk7XG4gICAgICBuID0gbi5yZXBsYWNlKC88L2csICcmbHQ7Jyk7XG4gICAgICBuID0gbi5yZXBsYWNlKC8+L2csICcmZ3Q7Jyk7XG4gICAgICBuID0gbi5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7Jyk7XG5cbiAgICAgIHJldHVybiBuO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGJ1aWxkVmFsdWVzKGNvbXBvbmVudHMsIG5ld1N0cmluZywgb2xkU3RyaW5nLCB1c2VMb25nZXN0VG9rZW4pIHtcbiAgICAgIHZhciBjb21wb25lbnRQb3MgPSAwLFxuICAgICAgICAgIGNvbXBvbmVudExlbiA9IGNvbXBvbmVudHMubGVuZ3RoLFxuICAgICAgICAgIG5ld1BvcyA9IDAsXG4gICAgICAgICAgb2xkUG9zID0gMDtcblxuICAgICAgZm9yICg7IGNvbXBvbmVudFBvcyA8IGNvbXBvbmVudExlbjsgY29tcG9uZW50UG9zKyspIHtcbiAgICAgICAgdmFyIGNvbXBvbmVudCA9IGNvbXBvbmVudHNbY29tcG9uZW50UG9zXTtcbiAgICAgICAgaWYgKCFjb21wb25lbnQucmVtb3ZlZCkge1xuICAgICAgICAgIGlmICghY29tcG9uZW50LmFkZGVkICYmIHVzZUxvbmdlc3RUb2tlbikge1xuICAgICAgICAgICAgdmFyIHZhbHVlID0gbmV3U3RyaW5nLnNsaWNlKG5ld1BvcywgbmV3UG9zICsgY29tcG9uZW50LmNvdW50KTtcbiAgICAgICAgICAgIHZhbHVlID0gbWFwKHZhbHVlLCBmdW5jdGlvbih2YWx1ZSwgaSkge1xuICAgICAgICAgICAgICB2YXIgb2xkVmFsdWUgPSBvbGRTdHJpbmdbb2xkUG9zICsgaV07XG4gICAgICAgICAgICAgIHJldHVybiBvbGRWYWx1ZS5sZW5ndGggPiB2YWx1ZS5sZW5ndGggPyBvbGRWYWx1ZSA6IHZhbHVlO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGNvbXBvbmVudC52YWx1ZSA9IHZhbHVlLmpvaW4oJycpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb21wb25lbnQudmFsdWUgPSBuZXdTdHJpbmcuc2xpY2UobmV3UG9zLCBuZXdQb3MgKyBjb21wb25lbnQuY291bnQpLmpvaW4oJycpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBuZXdQb3MgKz0gY29tcG9uZW50LmNvdW50O1xuXG4gICAgICAgICAgLy8gQ29tbW9uIGNhc2VcbiAgICAgICAgICBpZiAoIWNvbXBvbmVudC5hZGRlZCkge1xuICAgICAgICAgICAgb2xkUG9zICs9IGNvbXBvbmVudC5jb3VudDtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29tcG9uZW50LnZhbHVlID0gb2xkU3RyaW5nLnNsaWNlKG9sZFBvcywgb2xkUG9zICsgY29tcG9uZW50LmNvdW50KS5qb2luKCcnKTtcbiAgICAgICAgICBvbGRQb3MgKz0gY29tcG9uZW50LmNvdW50O1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBjb21wb25lbnRzO1xuICAgIH1cblxuICAgIHZhciBEaWZmID0gZnVuY3Rpb24oaWdub3JlV2hpdGVzcGFjZSkge1xuICAgICAgdGhpcy5pZ25vcmVXaGl0ZXNwYWNlID0gaWdub3JlV2hpdGVzcGFjZTtcbiAgICB9O1xuICAgIERpZmYucHJvdG90eXBlID0ge1xuICAgICAgICBkaWZmOiBmdW5jdGlvbihvbGRTdHJpbmcsIG5ld1N0cmluZywgY2FsbGJhY2spIHtcbiAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgICBmdW5jdGlvbiBkb25lKHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHsgY2FsbGJhY2sodW5kZWZpbmVkLCB2YWx1ZSk7IH0sIDApO1xuICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBIYW5kbGUgdGhlIGlkZW50aXR5IGNhc2UgKHRoaXMgaXMgZHVlIHRvIHVucm9sbGluZyBlZGl0TGVuZ3RoID09IDBcbiAgICAgICAgICBpZiAobmV3U3RyaW5nID09PSBvbGRTdHJpbmcpIHtcbiAgICAgICAgICAgIHJldHVybiBkb25lKFt7IHZhbHVlOiBuZXdTdHJpbmcgfV0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoIW5ld1N0cmluZykge1xuICAgICAgICAgICAgcmV0dXJuIGRvbmUoW3sgdmFsdWU6IG9sZFN0cmluZywgcmVtb3ZlZDogdHJ1ZSB9XSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICghb2xkU3RyaW5nKSB7XG4gICAgICAgICAgICByZXR1cm4gZG9uZShbeyB2YWx1ZTogbmV3U3RyaW5nLCBhZGRlZDogdHJ1ZSB9XSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbmV3U3RyaW5nID0gdGhpcy50b2tlbml6ZShuZXdTdHJpbmcpO1xuICAgICAgICAgIG9sZFN0cmluZyA9IHRoaXMudG9rZW5pemUob2xkU3RyaW5nKTtcblxuICAgICAgICAgIHZhciBuZXdMZW4gPSBuZXdTdHJpbmcubGVuZ3RoLCBvbGRMZW4gPSBvbGRTdHJpbmcubGVuZ3RoO1xuICAgICAgICAgIHZhciBtYXhFZGl0TGVuZ3RoID0gbmV3TGVuICsgb2xkTGVuO1xuICAgICAgICAgIHZhciBiZXN0UGF0aCA9IFt7IG5ld1BvczogLTEsIGNvbXBvbmVudHM6IFtdIH1dO1xuXG4gICAgICAgICAgLy8gU2VlZCBlZGl0TGVuZ3RoID0gMCwgaS5lLiB0aGUgY29udGVudCBzdGFydHMgd2l0aCB0aGUgc2FtZSB2YWx1ZXNcbiAgICAgICAgICB2YXIgb2xkUG9zID0gdGhpcy5leHRyYWN0Q29tbW9uKGJlc3RQYXRoWzBdLCBuZXdTdHJpbmcsIG9sZFN0cmluZywgMCk7XG4gICAgICAgICAgaWYgKGJlc3RQYXRoWzBdLm5ld1BvcysxID49IG5ld0xlbiAmJiBvbGRQb3MrMSA+PSBvbGRMZW4pIHtcbiAgICAgICAgICAgIC8vIElkZW50aXR5IHBlciB0aGUgZXF1YWxpdHkgYW5kIHRva2VuaXplclxuICAgICAgICAgICAgcmV0dXJuIGRvbmUoW3t2YWx1ZTogbmV3U3RyaW5nLmpvaW4oJycpfV0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIE1haW4gd29ya2VyIG1ldGhvZC4gY2hlY2tzIGFsbCBwZXJtdXRhdGlvbnMgb2YgYSBnaXZlbiBlZGl0IGxlbmd0aCBmb3IgYWNjZXB0YW5jZS5cbiAgICAgICAgICBmdW5jdGlvbiBleGVjRWRpdExlbmd0aCgpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGRpYWdvbmFsUGF0aCA9IC0xKmVkaXRMZW5ndGg7IGRpYWdvbmFsUGF0aCA8PSBlZGl0TGVuZ3RoOyBkaWFnb25hbFBhdGgrPTIpIHtcbiAgICAgICAgICAgICAgdmFyIGJhc2VQYXRoO1xuICAgICAgICAgICAgICB2YXIgYWRkUGF0aCA9IGJlc3RQYXRoW2RpYWdvbmFsUGF0aC0xXSxcbiAgICAgICAgICAgICAgICAgIHJlbW92ZVBhdGggPSBiZXN0UGF0aFtkaWFnb25hbFBhdGgrMV07XG4gICAgICAgICAgICAgIG9sZFBvcyA9IChyZW1vdmVQYXRoID8gcmVtb3ZlUGF0aC5uZXdQb3MgOiAwKSAtIGRpYWdvbmFsUGF0aDtcbiAgICAgICAgICAgICAgaWYgKGFkZFBhdGgpIHtcbiAgICAgICAgICAgICAgICAvLyBObyBvbmUgZWxzZSBpcyBnb2luZyB0byBhdHRlbXB0IHRvIHVzZSB0aGlzIHZhbHVlLCBjbGVhciBpdFxuICAgICAgICAgICAgICAgIGJlc3RQYXRoW2RpYWdvbmFsUGF0aC0xXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIHZhciBjYW5BZGQgPSBhZGRQYXRoICYmIGFkZFBhdGgubmV3UG9zKzEgPCBuZXdMZW47XG4gICAgICAgICAgICAgIHZhciBjYW5SZW1vdmUgPSByZW1vdmVQYXRoICYmIDAgPD0gb2xkUG9zICYmIG9sZFBvcyA8IG9sZExlbjtcbiAgICAgICAgICAgICAgaWYgKCFjYW5BZGQgJiYgIWNhblJlbW92ZSkge1xuICAgICAgICAgICAgICAgIC8vIElmIHRoaXMgcGF0aCBpcyBhIHRlcm1pbmFsIHRoZW4gcHJ1bmVcbiAgICAgICAgICAgICAgICBiZXN0UGF0aFtkaWFnb25hbFBhdGhdID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgLy8gU2VsZWN0IHRoZSBkaWFnb25hbCB0aGF0IHdlIHdhbnQgdG8gYnJhbmNoIGZyb20uIFdlIHNlbGVjdCB0aGUgcHJpb3JcbiAgICAgICAgICAgICAgLy8gcGF0aCB3aG9zZSBwb3NpdGlvbiBpbiB0aGUgbmV3IHN0cmluZyBpcyB0aGUgZmFydGhlc3QgZnJvbSB0aGUgb3JpZ2luXG4gICAgICAgICAgICAgIC8vIGFuZCBkb2VzIG5vdCBwYXNzIHRoZSBib3VuZHMgb2YgdGhlIGRpZmYgZ3JhcGhcbiAgICAgICAgICAgICAgaWYgKCFjYW5BZGQgfHwgKGNhblJlbW92ZSAmJiBhZGRQYXRoLm5ld1BvcyA8IHJlbW92ZVBhdGgubmV3UG9zKSkge1xuICAgICAgICAgICAgICAgIGJhc2VQYXRoID0gY2xvbmVQYXRoKHJlbW92ZVBhdGgpO1xuICAgICAgICAgICAgICAgIHNlbGYucHVzaENvbXBvbmVudChiYXNlUGF0aC5jb21wb25lbnRzLCB1bmRlZmluZWQsIHRydWUpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGJhc2VQYXRoID0gYWRkUGF0aDsgICAvLyBObyBuZWVkIHRvIGNsb25lLCB3ZSd2ZSBwdWxsZWQgaXQgZnJvbSB0aGUgbGlzdFxuICAgICAgICAgICAgICAgIGJhc2VQYXRoLm5ld1BvcysrO1xuICAgICAgICAgICAgICAgIHNlbGYucHVzaENvbXBvbmVudChiYXNlUGF0aC5jb21wb25lbnRzLCB0cnVlLCB1bmRlZmluZWQpO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgdmFyIG9sZFBvcyA9IHNlbGYuZXh0cmFjdENvbW1vbihiYXNlUGF0aCwgbmV3U3RyaW5nLCBvbGRTdHJpbmcsIGRpYWdvbmFsUGF0aCk7XG5cbiAgICAgICAgICAgICAgLy8gSWYgd2UgaGF2ZSBoaXQgdGhlIGVuZCBvZiBib3RoIHN0cmluZ3MsIHRoZW4gd2UgYXJlIGRvbmVcbiAgICAgICAgICAgICAgaWYgKGJhc2VQYXRoLm5ld1BvcysxID49IG5ld0xlbiAmJiBvbGRQb3MrMSA+PSBvbGRMZW4pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZG9uZShidWlsZFZhbHVlcyhiYXNlUGF0aC5jb21wb25lbnRzLCBuZXdTdHJpbmcsIG9sZFN0cmluZywgc2VsZi51c2VMb25nZXN0VG9rZW4pKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBPdGhlcndpc2UgdHJhY2sgdGhpcyBwYXRoIGFzIGEgcG90ZW50aWFsIGNhbmRpZGF0ZSBhbmQgY29udGludWUuXG4gICAgICAgICAgICAgICAgYmVzdFBhdGhbZGlhZ29uYWxQYXRoXSA9IGJhc2VQYXRoO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGVkaXRMZW5ndGgrKztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBQZXJmb3JtcyB0aGUgbGVuZ3RoIG9mIGVkaXQgaXRlcmF0aW9uLiBJcyBhIGJpdCBmdWdseSBhcyB0aGlzIGhhcyB0byBzdXBwb3J0IHRoZSBcbiAgICAgICAgICAvLyBzeW5jIGFuZCBhc3luYyBtb2RlIHdoaWNoIGlzIG5ldmVyIGZ1bi4gTG9vcHMgb3ZlciBleGVjRWRpdExlbmd0aCB1bnRpbCBhIHZhbHVlXG4gICAgICAgICAgLy8gaXMgcHJvZHVjZWQuXG4gICAgICAgICAgdmFyIGVkaXRMZW5ndGggPSAxO1xuICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgKGZ1bmN0aW9uIGV4ZWMoKSB7XG4gICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgLy8gVGhpcyBzaG91bGQgbm90IGhhcHBlbiwgYnV0IHdlIHdhbnQgdG8gYmUgc2FmZS5cbiAgICAgICAgICAgICAgICAvKmlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgICAgICAgICAgaWYgKGVkaXRMZW5ndGggPiBtYXhFZGl0TGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoIWV4ZWNFZGl0TGVuZ3RoKCkpIHtcbiAgICAgICAgICAgICAgICAgIGV4ZWMoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0sIDApO1xuICAgICAgICAgICAgfSkoKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgd2hpbGUoZWRpdExlbmd0aCA8PSBtYXhFZGl0TGVuZ3RoKSB7XG4gICAgICAgICAgICAgIHZhciByZXQgPSBleGVjRWRpdExlbmd0aCgpO1xuICAgICAgICAgICAgICBpZiAocmV0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJldDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBwdXNoQ29tcG9uZW50OiBmdW5jdGlvbihjb21wb25lbnRzLCBhZGRlZCwgcmVtb3ZlZCkge1xuICAgICAgICAgIHZhciBsYXN0ID0gY29tcG9uZW50c1tjb21wb25lbnRzLmxlbmd0aC0xXTtcbiAgICAgICAgICBpZiAobGFzdCAmJiBsYXN0LmFkZGVkID09PSBhZGRlZCAmJiBsYXN0LnJlbW92ZWQgPT09IHJlbW92ZWQpIHtcbiAgICAgICAgICAgIC8vIFdlIG5lZWQgdG8gY2xvbmUgaGVyZSBhcyB0aGUgY29tcG9uZW50IGNsb25lIG9wZXJhdGlvbiBpcyBqdXN0XG4gICAgICAgICAgICAvLyBhcyBzaGFsbG93IGFycmF5IGNsb25lXG4gICAgICAgICAgICBjb21wb25lbnRzW2NvbXBvbmVudHMubGVuZ3RoLTFdID0ge2NvdW50OiBsYXN0LmNvdW50ICsgMSwgYWRkZWQ6IGFkZGVkLCByZW1vdmVkOiByZW1vdmVkIH07XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbXBvbmVudHMucHVzaCh7Y291bnQ6IDEsIGFkZGVkOiBhZGRlZCwgcmVtb3ZlZDogcmVtb3ZlZCB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGV4dHJhY3RDb21tb246IGZ1bmN0aW9uKGJhc2VQYXRoLCBuZXdTdHJpbmcsIG9sZFN0cmluZywgZGlhZ29uYWxQYXRoKSB7XG4gICAgICAgICAgdmFyIG5ld0xlbiA9IG5ld1N0cmluZy5sZW5ndGgsXG4gICAgICAgICAgICAgIG9sZExlbiA9IG9sZFN0cmluZy5sZW5ndGgsXG4gICAgICAgICAgICAgIG5ld1BvcyA9IGJhc2VQYXRoLm5ld1BvcyxcbiAgICAgICAgICAgICAgb2xkUG9zID0gbmV3UG9zIC0gZGlhZ29uYWxQYXRoLFxuXG4gICAgICAgICAgICAgIGNvbW1vbkNvdW50ID0gMDtcbiAgICAgICAgICB3aGlsZSAobmV3UG9zKzEgPCBuZXdMZW4gJiYgb2xkUG9zKzEgPCBvbGRMZW4gJiYgdGhpcy5lcXVhbHMobmV3U3RyaW5nW25ld1BvcysxXSwgb2xkU3RyaW5nW29sZFBvcysxXSkpIHtcbiAgICAgICAgICAgIG5ld1BvcysrO1xuICAgICAgICAgICAgb2xkUG9zKys7XG4gICAgICAgICAgICBjb21tb25Db3VudCsrO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChjb21tb25Db3VudCkge1xuICAgICAgICAgICAgYmFzZVBhdGguY29tcG9uZW50cy5wdXNoKHtjb3VudDogY29tbW9uQ291bnR9KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBiYXNlUGF0aC5uZXdQb3MgPSBuZXdQb3M7XG4gICAgICAgICAgcmV0dXJuIG9sZFBvcztcbiAgICAgICAgfSxcblxuICAgICAgICBlcXVhbHM6IGZ1bmN0aW9uKGxlZnQsIHJpZ2h0KSB7XG4gICAgICAgICAgdmFyIHJlV2hpdGVzcGFjZSA9IC9cXFMvO1xuICAgICAgICAgIHJldHVybiBsZWZ0ID09PSByaWdodCB8fCAodGhpcy5pZ25vcmVXaGl0ZXNwYWNlICYmICFyZVdoaXRlc3BhY2UudGVzdChsZWZ0KSAmJiAhcmVXaGl0ZXNwYWNlLnRlc3QocmlnaHQpKTtcbiAgICAgICAgfSxcbiAgICAgICAgdG9rZW5pemU6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgcmV0dXJuIHZhbHVlLnNwbGl0KCcnKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgQ2hhckRpZmYgPSBuZXcgRGlmZigpO1xuXG4gICAgdmFyIFdvcmREaWZmID0gbmV3IERpZmYodHJ1ZSk7XG4gICAgdmFyIFdvcmRXaXRoU3BhY2VEaWZmID0gbmV3IERpZmYoKTtcbiAgICBXb3JkRGlmZi50b2tlbml6ZSA9IFdvcmRXaXRoU3BhY2VEaWZmLnRva2VuaXplID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHJldHVybiByZW1vdmVFbXB0eSh2YWx1ZS5zcGxpdCgvKFxccyt8XFxiKS8pKTtcbiAgICB9O1xuXG4gICAgdmFyIENzc0RpZmYgPSBuZXcgRGlmZih0cnVlKTtcbiAgICBDc3NEaWZmLnRva2VuaXplID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHJldHVybiByZW1vdmVFbXB0eSh2YWx1ZS5zcGxpdCgvKFt7fTo7LF18XFxzKykvKSk7XG4gICAgfTtcblxuICAgIHZhciBMaW5lRGlmZiA9IG5ldyBEaWZmKCk7XG4gICAgTGluZURpZmYudG9rZW5pemUgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgdmFyIHJldExpbmVzID0gW10sXG4gICAgICAgICAgbGluZXMgPSB2YWx1ZS5zcGxpdCgvXi9tKTtcblxuICAgICAgZm9yKHZhciBpID0gMDsgaSA8IGxpbmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBsaW5lID0gbGluZXNbaV0sXG4gICAgICAgICAgICBsYXN0TGluZSA9IGxpbmVzW2kgLSAxXTtcblxuICAgICAgICAvLyBNZXJnZSBsaW5lcyB0aGF0IG1heSBjb250YWluIHdpbmRvd3MgbmV3IGxpbmVzXG4gICAgICAgIGlmIChsaW5lID09PSAnXFxuJyAmJiBsYXN0TGluZSAmJiBsYXN0TGluZVtsYXN0TGluZS5sZW5ndGggLSAxXSA9PT0gJ1xccicpIHtcbiAgICAgICAgICByZXRMaW5lc1tyZXRMaW5lcy5sZW5ndGggLSAxXSArPSAnXFxuJztcbiAgICAgICAgfSBlbHNlIGlmIChsaW5lKSB7XG4gICAgICAgICAgcmV0TGluZXMucHVzaChsaW5lKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmV0TGluZXM7XG4gICAgfTtcblxuICAgIHZhciBTZW50ZW5jZURpZmYgPSBuZXcgRGlmZigpO1xuICAgIFNlbnRlbmNlRGlmZi50b2tlbml6ZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgcmV0dXJuIHJlbW92ZUVtcHR5KHZhbHVlLnNwbGl0KC8oXFxTLis/Wy4hP10pKD89XFxzK3wkKS8pKTtcbiAgICB9O1xuXG4gICAgdmFyIEpzb25EaWZmID0gbmV3IERpZmYoKTtcbiAgICAvLyBEaXNjcmltaW5hdGUgYmV0d2VlbiB0d28gbGluZXMgb2YgcHJldHR5LXByaW50ZWQsIHNlcmlhbGl6ZWQgSlNPTiB3aGVyZSBvbmUgb2YgdGhlbSBoYXMgYVxuICAgIC8vIGRhbmdsaW5nIGNvbW1hIGFuZCB0aGUgb3RoZXIgZG9lc24ndC4gVHVybnMgb3V0IGluY2x1ZGluZyB0aGUgZGFuZ2xpbmcgY29tbWEgeWllbGRzIHRoZSBuaWNlc3Qgb3V0cHV0OlxuICAgIEpzb25EaWZmLnVzZUxvbmdlc3RUb2tlbiA9IHRydWU7XG4gICAgSnNvbkRpZmYudG9rZW5pemUgPSBMaW5lRGlmZi50b2tlbml6ZTtcbiAgICBKc29uRGlmZi5lcXVhbHMgPSBmdW5jdGlvbihsZWZ0LCByaWdodCkge1xuICAgICAgcmV0dXJuIExpbmVEaWZmLmVxdWFscyhsZWZ0LnJlcGxhY2UoLywoW1xcclxcbl0pL2csICckMScpLCByaWdodC5yZXBsYWNlKC8sKFtcXHJcXG5dKS9nLCAnJDEnKSk7XG4gICAgfTtcblxuICAgIHZhciBvYmplY3RQcm90b3R5cGVUb1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbiAgICAvLyBUaGlzIGZ1bmN0aW9uIGhhbmRsZXMgdGhlIHByZXNlbmNlIG9mIGNpcmN1bGFyIHJlZmVyZW5jZXMgYnkgYmFpbGluZyBvdXQgd2hlbiBlbmNvdW50ZXJpbmcgYW5cbiAgICAvLyBvYmplY3QgdGhhdCBpcyBhbHJlYWR5IG9uIHRoZSBcInN0YWNrXCIgb2YgaXRlbXMgYmVpbmcgcHJvY2Vzc2VkLlxuICAgIGZ1bmN0aW9uIGNhbm9uaWNhbGl6ZShvYmosIHN0YWNrLCByZXBsYWNlbWVudFN0YWNrKSB7XG4gICAgICBzdGFjayA9IHN0YWNrIHx8IFtdO1xuICAgICAgcmVwbGFjZW1lbnRTdGFjayA9IHJlcGxhY2VtZW50U3RhY2sgfHwgW107XG5cbiAgICAgIHZhciBpO1xuXG4gICAgICBmb3IgKHZhciBpID0gMCA7IGkgPCBzdGFjay5sZW5ndGggOyBpICs9IDEpIHtcbiAgICAgICAgaWYgKHN0YWNrW2ldID09PSBvYmopIHtcbiAgICAgICAgICByZXR1cm4gcmVwbGFjZW1lbnRTdGFja1tpXTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB2YXIgY2Fub25pY2FsaXplZE9iajtcblxuICAgICAgaWYgKCdbb2JqZWN0IEFycmF5XScgPT09IG9iamVjdFByb3RvdHlwZVRvU3RyaW5nLmNhbGwob2JqKSkge1xuICAgICAgICBzdGFjay5wdXNoKG9iaik7XG4gICAgICAgIGNhbm9uaWNhbGl6ZWRPYmogPSBuZXcgQXJyYXkob2JqLmxlbmd0aCk7XG4gICAgICAgIHJlcGxhY2VtZW50U3RhY2sucHVzaChjYW5vbmljYWxpemVkT2JqKTtcbiAgICAgICAgZm9yIChpID0gMCA7IGkgPCBvYmoubGVuZ3RoIDsgaSArPSAxKSB7XG4gICAgICAgICAgY2Fub25pY2FsaXplZE9ialtpXSA9IGNhbm9uaWNhbGl6ZShvYmpbaV0sIHN0YWNrLCByZXBsYWNlbWVudFN0YWNrKTtcbiAgICAgICAgfVxuICAgICAgICBzdGFjay5wb3AoKTtcbiAgICAgICAgcmVwbGFjZW1lbnRTdGFjay5wb3AoKTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIG9iaiA9PT0gJ29iamVjdCcgJiYgb2JqICE9PSBudWxsKSB7XG4gICAgICAgIHN0YWNrLnB1c2gob2JqKTtcbiAgICAgICAgY2Fub25pY2FsaXplZE9iaiA9IHt9O1xuICAgICAgICByZXBsYWNlbWVudFN0YWNrLnB1c2goY2Fub25pY2FsaXplZE9iaik7XG4gICAgICAgIHZhciBzb3J0ZWRLZXlzID0gW107XG4gICAgICAgIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICAgICAgICBzb3J0ZWRLZXlzLnB1c2goa2V5KTtcbiAgICAgICAgfVxuICAgICAgICBzb3J0ZWRLZXlzLnNvcnQoKTtcbiAgICAgICAgZm9yIChpID0gMCA7IGkgPCBzb3J0ZWRLZXlzLmxlbmd0aCA7IGkgKz0gMSkge1xuICAgICAgICAgIHZhciBrZXkgPSBzb3J0ZWRLZXlzW2ldO1xuICAgICAgICAgIGNhbm9uaWNhbGl6ZWRPYmpba2V5XSA9IGNhbm9uaWNhbGl6ZShvYmpba2V5XSwgc3RhY2ssIHJlcGxhY2VtZW50U3RhY2spO1xuICAgICAgICB9XG4gICAgICAgIHN0YWNrLnBvcCgpO1xuICAgICAgICByZXBsYWNlbWVudFN0YWNrLnBvcCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY2Fub25pY2FsaXplZE9iaiA9IG9iajtcbiAgICAgIH1cbiAgICAgIHJldHVybiBjYW5vbmljYWxpemVkT2JqO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBEaWZmOiBEaWZmLFxuXG4gICAgICBkaWZmQ2hhcnM6IGZ1bmN0aW9uKG9sZFN0ciwgbmV3U3RyLCBjYWxsYmFjaykgeyByZXR1cm4gQ2hhckRpZmYuZGlmZihvbGRTdHIsIG5ld1N0ciwgY2FsbGJhY2spOyB9LFxuICAgICAgZGlmZldvcmRzOiBmdW5jdGlvbihvbGRTdHIsIG5ld1N0ciwgY2FsbGJhY2spIHsgcmV0dXJuIFdvcmREaWZmLmRpZmYob2xkU3RyLCBuZXdTdHIsIGNhbGxiYWNrKTsgfSxcbiAgICAgIGRpZmZXb3Jkc1dpdGhTcGFjZTogZnVuY3Rpb24ob2xkU3RyLCBuZXdTdHIsIGNhbGxiYWNrKSB7IHJldHVybiBXb3JkV2l0aFNwYWNlRGlmZi5kaWZmKG9sZFN0ciwgbmV3U3RyLCBjYWxsYmFjayk7IH0sXG4gICAgICBkaWZmTGluZXM6IGZ1bmN0aW9uKG9sZFN0ciwgbmV3U3RyLCBjYWxsYmFjaykgeyByZXR1cm4gTGluZURpZmYuZGlmZihvbGRTdHIsIG5ld1N0ciwgY2FsbGJhY2spOyB9LFxuICAgICAgZGlmZlNlbnRlbmNlczogZnVuY3Rpb24ob2xkU3RyLCBuZXdTdHIsIGNhbGxiYWNrKSB7IHJldHVybiBTZW50ZW5jZURpZmYuZGlmZihvbGRTdHIsIG5ld1N0ciwgY2FsbGJhY2spOyB9LFxuXG4gICAgICBkaWZmQ3NzOiBmdW5jdGlvbihvbGRTdHIsIG5ld1N0ciwgY2FsbGJhY2spIHsgcmV0dXJuIENzc0RpZmYuZGlmZihvbGRTdHIsIG5ld1N0ciwgY2FsbGJhY2spOyB9LFxuICAgICAgZGlmZkpzb246IGZ1bmN0aW9uKG9sZE9iaiwgbmV3T2JqLCBjYWxsYmFjaykge1xuICAgICAgICByZXR1cm4gSnNvbkRpZmYuZGlmZihcbiAgICAgICAgICB0eXBlb2Ygb2xkT2JqID09PSAnc3RyaW5nJyA/IG9sZE9iaiA6IEpTT04uc3RyaW5naWZ5KGNhbm9uaWNhbGl6ZShvbGRPYmopLCB1bmRlZmluZWQsICcgICcpLFxuICAgICAgICAgIHR5cGVvZiBuZXdPYmogPT09ICdzdHJpbmcnID8gbmV3T2JqIDogSlNPTi5zdHJpbmdpZnkoY2Fub25pY2FsaXplKG5ld09iaiksIHVuZGVmaW5lZCwgJyAgJyksXG4gICAgICAgICAgY2FsbGJhY2tcbiAgICAgICAgKTtcbiAgICAgIH0sXG5cbiAgICAgIGNyZWF0ZVBhdGNoOiBmdW5jdGlvbihmaWxlTmFtZSwgb2xkU3RyLCBuZXdTdHIsIG9sZEhlYWRlciwgbmV3SGVhZGVyKSB7XG4gICAgICAgIHZhciByZXQgPSBbXTtcblxuICAgICAgICByZXQucHVzaCgnSW5kZXg6ICcgKyBmaWxlTmFtZSk7XG4gICAgICAgIHJldC5wdXNoKCc9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Jyk7XG4gICAgICAgIHJldC5wdXNoKCctLS0gJyArIGZpbGVOYW1lICsgKHR5cGVvZiBvbGRIZWFkZXIgPT09ICd1bmRlZmluZWQnID8gJycgOiAnXFx0JyArIG9sZEhlYWRlcikpO1xuICAgICAgICByZXQucHVzaCgnKysrICcgKyBmaWxlTmFtZSArICh0eXBlb2YgbmV3SGVhZGVyID09PSAndW5kZWZpbmVkJyA/ICcnIDogJ1xcdCcgKyBuZXdIZWFkZXIpKTtcblxuICAgICAgICB2YXIgZGlmZiA9IExpbmVEaWZmLmRpZmYob2xkU3RyLCBuZXdTdHIpO1xuICAgICAgICBpZiAoIWRpZmZbZGlmZi5sZW5ndGgtMV0udmFsdWUpIHtcbiAgICAgICAgICBkaWZmLnBvcCgpOyAgIC8vIFJlbW92ZSB0cmFpbGluZyBuZXdsaW5lIGFkZFxuICAgICAgICB9XG4gICAgICAgIGRpZmYucHVzaCh7dmFsdWU6ICcnLCBsaW5lczogW119KTsgICAvLyBBcHBlbmQgYW4gZW1wdHkgdmFsdWUgdG8gbWFrZSBjbGVhbnVwIGVhc2llclxuXG4gICAgICAgIGZ1bmN0aW9uIGNvbnRleHRMaW5lcyhsaW5lcykge1xuICAgICAgICAgIHJldHVybiBtYXAobGluZXMsIGZ1bmN0aW9uKGVudHJ5KSB7IHJldHVybiAnICcgKyBlbnRyeTsgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gZW9mTkwoY3VyUmFuZ2UsIGksIGN1cnJlbnQpIHtcbiAgICAgICAgICB2YXIgbGFzdCA9IGRpZmZbZGlmZi5sZW5ndGgtMl0sXG4gICAgICAgICAgICAgIGlzTGFzdCA9IGkgPT09IGRpZmYubGVuZ3RoLTIsXG4gICAgICAgICAgICAgIGlzTGFzdE9mVHlwZSA9IGkgPT09IGRpZmYubGVuZ3RoLTMgJiYgKGN1cnJlbnQuYWRkZWQgIT09IGxhc3QuYWRkZWQgfHwgY3VycmVudC5yZW1vdmVkICE9PSBsYXN0LnJlbW92ZWQpO1xuXG4gICAgICAgICAgLy8gRmlndXJlIG91dCBpZiB0aGlzIGlzIHRoZSBsYXN0IGxpbmUgZm9yIHRoZSBnaXZlbiBmaWxlIGFuZCBtaXNzaW5nIE5MXG4gICAgICAgICAgaWYgKCEvXFxuJC8udGVzdChjdXJyZW50LnZhbHVlKSAmJiAoaXNMYXN0IHx8IGlzTGFzdE9mVHlwZSkpIHtcbiAgICAgICAgICAgIGN1clJhbmdlLnB1c2goJ1xcXFwgTm8gbmV3bGluZSBhdCBlbmQgb2YgZmlsZScpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBvbGRSYW5nZVN0YXJ0ID0gMCwgbmV3UmFuZ2VTdGFydCA9IDAsIGN1clJhbmdlID0gW10sXG4gICAgICAgICAgICBvbGRMaW5lID0gMSwgbmV3TGluZSA9IDE7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGlmZi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHZhciBjdXJyZW50ID0gZGlmZltpXSxcbiAgICAgICAgICAgICAgbGluZXMgPSBjdXJyZW50LmxpbmVzIHx8IGN1cnJlbnQudmFsdWUucmVwbGFjZSgvXFxuJC8sICcnKS5zcGxpdCgnXFxuJyk7XG4gICAgICAgICAgY3VycmVudC5saW5lcyA9IGxpbmVzO1xuXG4gICAgICAgICAgaWYgKGN1cnJlbnQuYWRkZWQgfHwgY3VycmVudC5yZW1vdmVkKSB7XG4gICAgICAgICAgICBpZiAoIW9sZFJhbmdlU3RhcnQpIHtcbiAgICAgICAgICAgICAgdmFyIHByZXYgPSBkaWZmW2ktMV07XG4gICAgICAgICAgICAgIG9sZFJhbmdlU3RhcnQgPSBvbGRMaW5lO1xuICAgICAgICAgICAgICBuZXdSYW5nZVN0YXJ0ID0gbmV3TGluZTtcblxuICAgICAgICAgICAgICBpZiAocHJldikge1xuICAgICAgICAgICAgICAgIGN1clJhbmdlID0gY29udGV4dExpbmVzKHByZXYubGluZXMuc2xpY2UoLTQpKTtcbiAgICAgICAgICAgICAgICBvbGRSYW5nZVN0YXJ0IC09IGN1clJhbmdlLmxlbmd0aDtcbiAgICAgICAgICAgICAgICBuZXdSYW5nZVN0YXJ0IC09IGN1clJhbmdlLmxlbmd0aDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY3VyUmFuZ2UucHVzaC5hcHBseShjdXJSYW5nZSwgbWFwKGxpbmVzLCBmdW5jdGlvbihlbnRyeSkgeyByZXR1cm4gKGN1cnJlbnQuYWRkZWQ/JysnOictJykgKyBlbnRyeTsgfSkpO1xuICAgICAgICAgICAgZW9mTkwoY3VyUmFuZ2UsIGksIGN1cnJlbnQpO1xuXG4gICAgICAgICAgICBpZiAoY3VycmVudC5hZGRlZCkge1xuICAgICAgICAgICAgICBuZXdMaW5lICs9IGxpbmVzLmxlbmd0aDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIG9sZExpbmUgKz0gbGluZXMubGVuZ3RoO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAob2xkUmFuZ2VTdGFydCkge1xuICAgICAgICAgICAgICAvLyBDbG9zZSBvdXQgYW55IGNoYW5nZXMgdGhhdCBoYXZlIGJlZW4gb3V0cHV0IChvciBqb2luIG92ZXJsYXBwaW5nKVxuICAgICAgICAgICAgICBpZiAobGluZXMubGVuZ3RoIDw9IDggJiYgaSA8IGRpZmYubGVuZ3RoLTIpIHtcbiAgICAgICAgICAgICAgICAvLyBPdmVybGFwcGluZ1xuICAgICAgICAgICAgICAgIGN1clJhbmdlLnB1c2guYXBwbHkoY3VyUmFuZ2UsIGNvbnRleHRMaW5lcyhsaW5lcykpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIGVuZCB0aGUgcmFuZ2UgYW5kIG91dHB1dFxuICAgICAgICAgICAgICAgIHZhciBjb250ZXh0U2l6ZSA9IE1hdGgubWluKGxpbmVzLmxlbmd0aCwgNCk7XG4gICAgICAgICAgICAgICAgcmV0LnB1c2goXG4gICAgICAgICAgICAgICAgICAgICdAQCAtJyArIG9sZFJhbmdlU3RhcnQgKyAnLCcgKyAob2xkTGluZS1vbGRSYW5nZVN0YXJ0K2NvbnRleHRTaXplKVxuICAgICAgICAgICAgICAgICAgICArICcgKycgKyBuZXdSYW5nZVN0YXJ0ICsgJywnICsgKG5ld0xpbmUtbmV3UmFuZ2VTdGFydCtjb250ZXh0U2l6ZSlcbiAgICAgICAgICAgICAgICAgICAgKyAnIEBAJyk7XG4gICAgICAgICAgICAgICAgcmV0LnB1c2guYXBwbHkocmV0LCBjdXJSYW5nZSk7XG4gICAgICAgICAgICAgICAgcmV0LnB1c2guYXBwbHkocmV0LCBjb250ZXh0TGluZXMobGluZXMuc2xpY2UoMCwgY29udGV4dFNpemUpKSk7XG4gICAgICAgICAgICAgICAgaWYgKGxpbmVzLmxlbmd0aCA8PSA0KSB7XG4gICAgICAgICAgICAgICAgICBlb2ZOTChyZXQsIGksIGN1cnJlbnQpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIG9sZFJhbmdlU3RhcnQgPSAwOyAgbmV3UmFuZ2VTdGFydCA9IDA7IGN1clJhbmdlID0gW107XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG9sZExpbmUgKz0gbGluZXMubGVuZ3RoO1xuICAgICAgICAgICAgbmV3TGluZSArPSBsaW5lcy5sZW5ndGg7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJldC5qb2luKCdcXG4nKSArICdcXG4nO1xuICAgICAgfSxcblxuICAgICAgYXBwbHlQYXRjaDogZnVuY3Rpb24ob2xkU3RyLCB1bmlEaWZmKSB7XG4gICAgICAgIHZhciBkaWZmc3RyID0gdW5pRGlmZi5zcGxpdCgnXFxuJyk7XG4gICAgICAgIHZhciBkaWZmID0gW107XG4gICAgICAgIHZhciByZW1FT0ZOTCA9IGZhbHNlLFxuICAgICAgICAgICAgYWRkRU9GTkwgPSBmYWxzZTtcblxuICAgICAgICBmb3IgKHZhciBpID0gKGRpZmZzdHJbMF1bMF09PT0nSSc/NDowKTsgaSA8IGRpZmZzdHIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBpZihkaWZmc3RyW2ldWzBdID09PSAnQCcpIHtcbiAgICAgICAgICAgIHZhciBtZWggPSBkaWZmc3RyW2ldLnNwbGl0KC9AQCAtKFxcZCspLChcXGQrKSBcXCsoXFxkKyksKFxcZCspIEBALyk7XG4gICAgICAgICAgICBkaWZmLnVuc2hpZnQoe1xuICAgICAgICAgICAgICBzdGFydDptZWhbM10sXG4gICAgICAgICAgICAgIG9sZGxlbmd0aDptZWhbMl0sXG4gICAgICAgICAgICAgIG9sZGxpbmVzOltdLFxuICAgICAgICAgICAgICBuZXdsZW5ndGg6bWVoWzRdLFxuICAgICAgICAgICAgICBuZXdsaW5lczpbXVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSBlbHNlIGlmKGRpZmZzdHJbaV1bMF0gPT09ICcrJykge1xuICAgICAgICAgICAgZGlmZlswXS5uZXdsaW5lcy5wdXNoKGRpZmZzdHJbaV0uc3Vic3RyKDEpKTtcbiAgICAgICAgICB9IGVsc2UgaWYoZGlmZnN0cltpXVswXSA9PT0gJy0nKSB7XG4gICAgICAgICAgICBkaWZmWzBdLm9sZGxpbmVzLnB1c2goZGlmZnN0cltpXS5zdWJzdHIoMSkpO1xuICAgICAgICAgIH0gZWxzZSBpZihkaWZmc3RyW2ldWzBdID09PSAnICcpIHtcbiAgICAgICAgICAgIGRpZmZbMF0ubmV3bGluZXMucHVzaChkaWZmc3RyW2ldLnN1YnN0cigxKSk7XG4gICAgICAgICAgICBkaWZmWzBdLm9sZGxpbmVzLnB1c2goZGlmZnN0cltpXS5zdWJzdHIoMSkpO1xuICAgICAgICAgIH0gZWxzZSBpZihkaWZmc3RyW2ldWzBdID09PSAnXFxcXCcpIHtcbiAgICAgICAgICAgIGlmIChkaWZmc3RyW2ktMV1bMF0gPT09ICcrJykge1xuICAgICAgICAgICAgICByZW1FT0ZOTCA9IHRydWU7XG4gICAgICAgICAgICB9IGVsc2UgaWYoZGlmZnN0cltpLTFdWzBdID09PSAnLScpIHtcbiAgICAgICAgICAgICAgYWRkRU9GTkwgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBzdHIgPSBvbGRTdHIuc3BsaXQoJ1xcbicpO1xuICAgICAgICBmb3IgKHZhciBpID0gZGlmZi5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgIHZhciBkID0gZGlmZltpXTtcbiAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGQub2xkbGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIGlmKHN0cltkLnN0YXJ0LTEral0gIT09IGQub2xkbGluZXNbal0pIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBBcnJheS5wcm90b3R5cGUuc3BsaWNlLmFwcGx5KHN0cixbZC5zdGFydC0xLCtkLm9sZGxlbmd0aF0uY29uY2F0KGQubmV3bGluZXMpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChyZW1FT0ZOTCkge1xuICAgICAgICAgIHdoaWxlICghc3RyW3N0ci5sZW5ndGgtMV0pIHtcbiAgICAgICAgICAgIHN0ci5wb3AoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoYWRkRU9GTkwpIHtcbiAgICAgICAgICBzdHIucHVzaCgnJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN0ci5qb2luKCdcXG4nKTtcbiAgICAgIH0sXG5cbiAgICAgIGNvbnZlcnRDaGFuZ2VzVG9YTUw6IGZ1bmN0aW9uKGNoYW5nZXMpe1xuICAgICAgICB2YXIgcmV0ID0gW107XG4gICAgICAgIGZvciAoIHZhciBpID0gMDsgaSA8IGNoYW5nZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICB2YXIgY2hhbmdlID0gY2hhbmdlc1tpXTtcbiAgICAgICAgICBpZiAoY2hhbmdlLmFkZGVkKSB7XG4gICAgICAgICAgICByZXQucHVzaCgnPGlucz4nKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGNoYW5nZS5yZW1vdmVkKSB7XG4gICAgICAgICAgICByZXQucHVzaCgnPGRlbD4nKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXQucHVzaChlc2NhcGVIVE1MKGNoYW5nZS52YWx1ZSkpO1xuXG4gICAgICAgICAgaWYgKGNoYW5nZS5hZGRlZCkge1xuICAgICAgICAgICAgcmV0LnB1c2goJzwvaW5zPicpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoY2hhbmdlLnJlbW92ZWQpIHtcbiAgICAgICAgICAgIHJldC5wdXNoKCc8L2RlbD4nKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJldC5qb2luKCcnKTtcbiAgICAgIH0sXG5cbiAgICAgIC8vIFNlZTogaHR0cDovL2NvZGUuZ29vZ2xlLmNvbS9wL2dvb2dsZS1kaWZmLW1hdGNoLXBhdGNoL3dpa2kvQVBJXG4gICAgICBjb252ZXJ0Q2hhbmdlc1RvRE1QOiBmdW5jdGlvbihjaGFuZ2VzKXtcbiAgICAgICAgdmFyIHJldCA9IFtdLCBjaGFuZ2U7XG4gICAgICAgIGZvciAoIHZhciBpID0gMDsgaSA8IGNoYW5nZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBjaGFuZ2UgPSBjaGFuZ2VzW2ldO1xuICAgICAgICAgIHJldC5wdXNoKFsoY2hhbmdlLmFkZGVkID8gMSA6IGNoYW5nZS5yZW1vdmVkID8gLTEgOiAwKSwgY2hhbmdlLnZhbHVlXSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICAgIH0sXG5cbiAgICAgIGNhbm9uaWNhbGl6ZTogY2Fub25pY2FsaXplXG4gICAgfTtcbiAgfSkoKTtcblxuICAvKmlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgbW9kdWxlLmV4cG9ydHMgPSBKc0RpZmY7XG4gIH1cbiAgZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIC8qZ2xvYmFsIGRlZmluZSAqL1xuICAgIGRlZmluZShbXSwgZnVuY3Rpb24oKSB7IHJldHVybiBKc0RpZmY7IH0pO1xuICB9XG4gIGVsc2UgaWYgKHR5cGVvZiBnbG9iYWwuSnNEaWZmID09PSAndW5kZWZpbmVkJykge1xuICAgIGdsb2JhbC5Kc0RpZmYgPSBKc0RpZmY7XG4gIH1cbn0pKHRoaXMpO1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9+L2RpZmYvZGlmZi5qc1xuICoqLyJdLCJzb3VyY2VSb290IjoiIiwiZmlsZSI6Ii4vZGlzdC9yZWFjdC1kaWZmLmpzIn0=