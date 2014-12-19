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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCAwZDI5ZTQ1NzFmZDZlNmUyNzEwNyIsIndlYnBhY2s6Ly8vLi9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9saWIvcmVhY3QtZGlmZi5qcyIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJSZWFjdFwiIiwid2VicGFjazovLy8uL34vZGlmZi9kaWZmLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRCxPO0FDVkE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsdUJBQWU7QUFDZjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQSx3Qzs7Ozs7OztBQ3RDQSxPQUFNLENBQUMsT0FBTyxHQUFHLG1CQUFPLENBQUMsQ0FBa0IsQ0FBQyxDQUFDOzs7Ozs7O0FDQTdDLEtBQUksS0FBSyxHQUFHLG1CQUFPLENBQUMsQ0FBTyxDQUFDLENBQUM7QUFDN0IsS0FBSSxNQUFNLEdBQUcsbUJBQU8sQ0FBQyxDQUFNLENBQUMsQ0FBQzs7QUFFN0IsS0FBSSxLQUFLLEdBQUc7R0FDVixNQUFNLEVBQUUsTUFBTSxDQUFDLFNBQVM7R0FDeEIsTUFBTSxFQUFFLE1BQU0sQ0FBQyxTQUFTO0dBQ3hCLFVBQVUsRUFBRSxNQUFNLENBQUMsYUFBYTtHQUNoQyxNQUFNLEVBQUUsTUFBTSxDQUFDLFFBQVE7QUFDekIsRUFBQyxDQUFDOztBQUVGLE9BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQztBQUNuQyxHQUFFLFdBQVcsRUFBRSxNQUFNOztHQUVuQixlQUFlLEVBQUUsV0FB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RyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1dBQ3hDLE1BQU0sR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7V0FDcEIsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sQ0FBQyxLQUFLLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1VBQ3hFO1NBQ0QsT0FBTyxHQUFHLENBQUM7QUFDbkIsUUFBTzs7T0FFRCxZQUFZLEVBQUUsWUFBWTtNQUMzQixDQUFDO0FBQ04sSUFBRyxHQUFHLENBQUM7QUFDUDs7R0FFRSxJQUFJLElBQTZCLEVBQUU7T0FDL0IsTUFBTSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7SUFDM0I7QUFDSCxRQUFPLElBQUksT0FBTyxNQUFNLEtBQUssVUFBVSxFQUFFOztLQUVyQyxNQUFNLENBQUMsRUFBRSxFQUFFLFdBQVcsRUFBRSxPQUFPLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUMzQztRQUNJLElBQUksT0FBTyxNQUFNLENBQUMsTUFBTSxLQUFLLFdBQVcsRUFBRTtLQUM3QyxNQUFNLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztJQUN4QjtFQUNGLEVBQUUsSUFBSSxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gd2VicGFja1VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24ocm9vdCwgZmFjdG9yeSkge1xuXHRpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcpXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJlcXVpcmUoXCJSZWFjdFwiKSk7XG5cdGVsc2UgaWYodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKVxuXHRcdGRlZmluZShbXCJSZWFjdFwiXSwgZmFjdG9yeSk7XG5cdGVsc2UgaWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKVxuXHRcdGV4cG9ydHNbXCJEaWZmXCJdID0gZmFjdG9yeShyZXF1aXJlKFwiUmVhY3RcIikpO1xuXHRlbHNlXG5cdFx0cm9vdFtcIkRpZmZcIl0gPSBmYWN0b3J5KHJvb3RbXCJSZWFjdFwiXSk7XG59KSh0aGlzLCBmdW5jdGlvbihfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFXzJfXykge1xucmV0dXJuIFxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIHdlYnBhY2svdW5pdmVyc2FsTW9kdWxlRGVmaW5pdGlvblxuICoqLyIsIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKVxuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuXG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRleHBvcnRzOiB7fSxcbiBcdFx0XHRpZDogbW9kdWxlSWQsXG4gXHRcdFx0bG9hZGVkOiBmYWxzZVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sb2FkZWQgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKDApO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIHdlYnBhY2svYm9vdHN0cmFwIDBkMjllNDU3MWZkNmU2ZTI3MTA3XG4gKiovIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2xpYi9yZWFjdC1kaWZmJyk7XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL2luZGV4LmpzXG4gKiovIiwidmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBqc2RpZmYgPSByZXF1aXJlKCdkaWZmJyk7XG5cbnZhciBmbk1hcCA9IHtcbiAgJ2NoYXInOiBqc2RpZmYuZGlmZkNoYXJzLFxuICAnd29yZCc6IGpzZGlmZi5kaWZmV29yZHMsXG4gICdzZW50ZW5jZSc6IGpzZGlmZi5kaWZmU2VudGVuY2VzLFxuICAnanNvbic6IGpzZGlmZi5kaWZmSnNvblxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gIGRpc3BsYXlOYW1lOiAnRGlmZicsXG5cbiAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgaW5wdXRBOiAnJyxcbiAgICAgIGlucHV0QjogJycsXG4gICAgICB0eXBlOiAnY2hhcidcbiAgICB9O1xuICB9LFxuXG4gIHByb3BUeXBlczoge1xuICAgIGlucHV0QTogUmVhY3QuUHJvcFR5cGVzLm9uZU9mVHlwZShbXG4gICAgICBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLFxuICAgICAgUmVhY3QuUHJvcFR5cGVzLm9iamVjdFxuICAgIF0pLFxuICAgIGlucHV0QjogUmVhY3QuUHJvcFR5cGVzLm9uZU9mVHlwZShbXG4gICAgICBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLFxuICAgICAgUmVhY3QuUHJvcFR5cGVzLm9iamVjdFxuICAgIF0pLFxuICAgIHR5cGU6IFJlYWN0LlByb3BUeXBlcy5vbmVPZihbXG4gICAgICAnY2hhcicsXG4gICAgICAnd29yZCcsXG4gICAgICAnc2VudGVuY2UnLFxuICAgICAgJ2pzb24nXG4gICAgXSlcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZGlmZiA9IGZuTWFwW3RoaXMucHJvcHMudHlwZV0odGhpcy5wcm9wcy5pbnB1dEEsIHRoaXMucHJvcHMuaW5wdXRCKTtcbiAgICB2YXIgcmVzdWx0ID0gZGlmZi5tYXAoZnVuY3Rpb24ocGFydCkge1xuICAgICAgdmFyIHNwYW5TdHlsZSA9IHtcbiAgICAgICAgYmFja2dyb3VuZENvbG9yOiBwYXJ0LmFkZGVkID8gJ2xpZ2h0Z3JlZW4nIDogcGFydC5yZW1vdmVkID8gJ3NhbG1vbicgOiAnbGlnaHRncmV5J1xuICAgICAgfVxuICAgICAgcmV0dXJuIDxzcGFuIHN0eWxlPXtzcGFuU3R5bGV9PntwYXJ0LnZhbHVlfTwvc3Bhbj5cbiAgICB9KTtcbiAgICByZXR1cm4gKFxuICAgICAgPHByZSBjbGFzc05hbWU9J2RpZmYtcmVzdWx0Jz5cbiAgICAgICAge3Jlc3VsdH1cbiAgICAgIDwvcHJlPlxuICAgICk7XG4gIH0sXG59KTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vbGliL3JlYWN0LWRpZmYuanNcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfMl9fO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogZXh0ZXJuYWwgXCJSZWFjdFwiXG4gKiogbW9kdWxlIGlkID0gMlxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLyogU2VlIExJQ0VOU0UgZmlsZSBmb3IgdGVybXMgb2YgdXNlICovXG5cbi8qXG4gKiBUZXh0IGRpZmYgaW1wbGVtZW50YXRpb24uXG4gKlxuICogVGhpcyBsaWJyYXJ5IHN1cHBvcnRzIHRoZSBmb2xsb3dpbmcgQVBJUzpcbiAqIEpzRGlmZi5kaWZmQ2hhcnM6IENoYXJhY3RlciBieSBjaGFyYWN0ZXIgZGlmZlxuICogSnNEaWZmLmRpZmZXb3JkczogV29yZCAoYXMgZGVmaW5lZCBieSBcXGIgcmVnZXgpIGRpZmYgd2hpY2ggaWdub3JlcyB3aGl0ZXNwYWNlXG4gKiBKc0RpZmYuZGlmZkxpbmVzOiBMaW5lIGJhc2VkIGRpZmZcbiAqXG4gKiBKc0RpZmYuZGlmZkNzczogRGlmZiB0YXJnZXRlZCBhdCBDU1MgY29udGVudFxuICpcbiAqIFRoZXNlIG1ldGhvZHMgYXJlIGJhc2VkIG9uIHRoZSBpbXBsZW1lbnRhdGlvbiBwcm9wb3NlZCBpblxuICogXCJBbiBPKE5EKSBEaWZmZXJlbmNlIEFsZ29yaXRobSBhbmQgaXRzIFZhcmlhdGlvbnNcIiAoTXllcnMsIDE5ODYpLlxuICogaHR0cDovL2NpdGVzZWVyeC5pc3QucHN1LmVkdS92aWV3ZG9jL3N1bW1hcnk/ZG9pPTEwLjEuMS40LjY5MjdcbiAqL1xuKGZ1bmN0aW9uKGdsb2JhbCwgdW5kZWZpbmVkKSB7XG4gIHZhciBKc0RpZmYgPSAoZnVuY3Rpb24oKSB7XG4gICAgLypqc2hpbnQgbWF4cGFyYW1zOiA1Ki9cbiAgICAvKmlzdGFuYnVsIGlnbm9yZSBuZXh0Ki9cbiAgICBmdW5jdGlvbiBtYXAoYXJyLCBtYXBwZXIsIHRoYXQpIHtcbiAgICAgIGlmIChBcnJheS5wcm90b3R5cGUubWFwKSB7XG4gICAgICAgIHJldHVybiBBcnJheS5wcm90b3R5cGUubWFwLmNhbGwoYXJyLCBtYXBwZXIsIHRoYXQpO1xuICAgICAgfVxuXG4gICAgICB2YXIgb3RoZXIgPSBuZXcgQXJyYXkoYXJyLmxlbmd0aCk7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwLCBuID0gYXJyLmxlbmd0aDsgaSA8IG47IGkrKykge1xuICAgICAgICBvdGhlcltpXSA9IG1hcHBlci5jYWxsKHRoYXQsIGFycltpXSwgaSwgYXJyKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBvdGhlcjtcbiAgICB9XG4gICAgZnVuY3Rpb24gY2xvbmVQYXRoKHBhdGgpIHtcbiAgICAgIHJldHVybiB7IG5ld1BvczogcGF0aC5uZXdQb3MsIGNvbXBvbmVudHM6IHBhdGguY29tcG9uZW50cy5zbGljZSgwKSB9O1xuICAgIH1cbiAgICBmdW5jdGlvbiByZW1vdmVFbXB0eShhcnJheSkge1xuICAgICAgdmFyIHJldCA9IFtdO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoYXJyYXlbaV0pIHtcbiAgICAgICAgICByZXQucHVzaChhcnJheVtpXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGVzY2FwZUhUTUwocykge1xuICAgICAgdmFyIG4gPSBzO1xuICAgICAgbiA9IG4ucmVwbGFjZSgvJi9nLCAnJmFtcDsnKTtcbiAgICAgIG4gPSBuLnJlcGxhY2UoLzwvZywgJyZsdDsnKTtcbiAgICAgIG4gPSBuLnJlcGxhY2UoLz4vZywgJyZndDsnKTtcbiAgICAgIG4gPSBuLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKTtcblxuICAgICAgcmV0dXJuIG47XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYnVpbGRWYWx1ZXMoY29tcG9uZW50cywgbmV3U3RyaW5nLCBvbGRTdHJpbmcsIHVzZUxvbmdlc3RUb2tlbikge1xuICAgICAgdmFyIGNvbXBvbmVudFBvcyA9IDAsXG4gICAgICAgICAgY29tcG9uZW50TGVuID0gY29tcG9uZW50cy5sZW5ndGgsXG4gICAgICAgICAgbmV3UG9zID0gMCxcbiAgICAgICAgICBvbGRQb3MgPSAwO1xuXG4gICAgICBmb3IgKDsgY29tcG9uZW50UG9zIDwgY29tcG9uZW50TGVuOyBjb21wb25lbnRQb3MrKykge1xuICAgICAgICB2YXIgY29tcG9uZW50ID0gY29tcG9uZW50c1tjb21wb25lbnRQb3NdO1xuICAgICAgICBpZiAoIWNvbXBvbmVudC5yZW1vdmVkKSB7XG4gICAgICAgICAgaWYgKCFjb21wb25lbnQuYWRkZWQgJiYgdXNlTG9uZ2VzdFRva2VuKSB7XG4gICAgICAgICAgICB2YXIgdmFsdWUgPSBuZXdTdHJpbmcuc2xpY2UobmV3UG9zLCBuZXdQb3MgKyBjb21wb25lbnQuY291bnQpO1xuICAgICAgICAgICAgdmFsdWUgPSBtYXAodmFsdWUsIGZ1bmN0aW9uKHZhbHVlLCBpKSB7XG4gICAgICAgICAgICAgIHZhciBvbGRWYWx1ZSA9IG9sZFN0cmluZ1tvbGRQb3MgKyBpXTtcbiAgICAgICAgICAgICAgcmV0dXJuIG9sZFZhbHVlLmxlbmd0aCA+IHZhbHVlLmxlbmd0aCA/IG9sZFZhbHVlIDogdmFsdWU7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgY29tcG9uZW50LnZhbHVlID0gdmFsdWUuam9pbignJyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbXBvbmVudC52YWx1ZSA9IG5ld1N0cmluZy5zbGljZShuZXdQb3MsIG5ld1BvcyArIGNvbXBvbmVudC5jb3VudCkuam9pbignJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIG5ld1BvcyArPSBjb21wb25lbnQuY291bnQ7XG5cbiAgICAgICAgICAvLyBDb21tb24gY2FzZVxuICAgICAgICAgIGlmICghY29tcG9uZW50LmFkZGVkKSB7XG4gICAgICAgICAgICBvbGRQb3MgKz0gY29tcG9uZW50LmNvdW50O1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb21wb25lbnQudmFsdWUgPSBvbGRTdHJpbmcuc2xpY2Uob2xkUG9zLCBvbGRQb3MgKyBjb21wb25lbnQuY291bnQpLmpvaW4oJycpO1xuICAgICAgICAgIG9sZFBvcyArPSBjb21wb25lbnQuY291bnQ7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGNvbXBvbmVudHM7XG4gICAgfVxuXG4gICAgdmFyIERpZmYgPSBmdW5jdGlvbihpZ25vcmVXaGl0ZXNwYWNlKSB7XG4gICAgICB0aGlzLmlnbm9yZVdoaXRlc3BhY2UgPSBpZ25vcmVXaGl0ZXNwYWNlO1xuICAgIH07XG4gICAgRGlmZi5wcm90b3R5cGUgPSB7XG4gICAgICAgIGRpZmY6IGZ1bmN0aW9uKG9sZFN0cmluZywgbmV3U3RyaW5nLCBjYWxsYmFjaykge1xuICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICAgIGZ1bmN0aW9uIGRvbmUodmFsdWUpIHtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyBjYWxsYmFjayh1bmRlZmluZWQsIHZhbHVlKTsgfSwgMCk7XG4gICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIEhhbmRsZSB0aGUgaWRlbnRpdHkgY2FzZSAodGhpcyBpcyBkdWUgdG8gdW5yb2xsaW5nIGVkaXRMZW5ndGggPT0gMFxuICAgICAgICAgIGlmIChuZXdTdHJpbmcgPT09IG9sZFN0cmluZykge1xuICAgICAgICAgICAgcmV0dXJuIGRvbmUoW3sgdmFsdWU6IG5ld1N0cmluZyB9XSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICghbmV3U3RyaW5nKSB7XG4gICAgICAgICAgICByZXR1cm4gZG9uZShbeyB2YWx1ZTogb2xkU3RyaW5nLCByZW1vdmVkOiB0cnVlIH1dKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCFvbGRTdHJpbmcpIHtcbiAgICAgICAgICAgIHJldHVybiBkb25lKFt7IHZhbHVlOiBuZXdTdHJpbmcsIGFkZGVkOiB0cnVlIH1dKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBuZXdTdHJpbmcgPSB0aGlzLnRva2VuaXplKG5ld1N0cmluZyk7XG4gICAgICAgICAgb2xkU3RyaW5nID0gdGhpcy50b2tlbml6ZShvbGRTdHJpbmcpO1xuXG4gICAgICAgICAgdmFyIG5ld0xlbiA9IG5ld1N0cmluZy5sZW5ndGgsIG9sZExlbiA9IG9sZFN0cmluZy5sZW5ndGg7XG4gICAgICAgICAgdmFyIG1heEVkaXRMZW5ndGggPSBuZXdMZW4gKyBvbGRMZW47XG4gICAgICAgICAgdmFyIGJlc3RQYXRoID0gW3sgbmV3UG9zOiAtMSwgY29tcG9uZW50czogW10gfV07XG5cbiAgICAgICAgICAvLyBTZWVkIGVkaXRMZW5ndGggPSAwLCBpLmUuIHRoZSBjb250ZW50IHN0YXJ0cyB3aXRoIHRoZSBzYW1lIHZhbHVlc1xuICAgICAgICAgIHZhciBvbGRQb3MgPSB0aGlzLmV4dHJhY3RDb21tb24oYmVzdFBhdGhbMF0sIG5ld1N0cmluZywgb2xkU3RyaW5nLCAwKTtcbiAgICAgICAgICBpZiAoYmVzdFBhdGhbMF0ubmV3UG9zKzEgPj0gbmV3TGVuICYmIG9sZFBvcysxID49IG9sZExlbikge1xuICAgICAgICAgICAgLy8gSWRlbnRpdHkgcGVyIHRoZSBlcXVhbGl0eSBhbmQgdG9rZW5pemVyXG4gICAgICAgICAgICByZXR1cm4gZG9uZShbe3ZhbHVlOiBuZXdTdHJpbmcuam9pbignJyl9XSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gTWFpbiB3b3JrZXIgbWV0aG9kLiBjaGVja3MgYWxsIHBlcm11dGF0aW9ucyBvZiBhIGdpdmVuIGVkaXQgbGVuZ3RoIGZvciBhY2NlcHRhbmNlLlxuICAgICAgICAgIGZ1bmN0aW9uIGV4ZWNFZGl0TGVuZ3RoKCkge1xuICAgICAgICAgICAgZm9yICh2YXIgZGlhZ29uYWxQYXRoID0gLTEqZWRpdExlbmd0aDsgZGlhZ29uYWxQYXRoIDw9IGVkaXRMZW5ndGg7IGRpYWdvbmFsUGF0aCs9Mikge1xuICAgICAgICAgICAgICB2YXIgYmFzZVBhdGg7XG4gICAgICAgICAgICAgIHZhciBhZGRQYXRoID0gYmVzdFBhdGhbZGlhZ29uYWxQYXRoLTFdLFxuICAgICAgICAgICAgICAgICAgcmVtb3ZlUGF0aCA9IGJlc3RQYXRoW2RpYWdvbmFsUGF0aCsxXTtcbiAgICAgICAgICAgICAgb2xkUG9zID0gKHJlbW92ZVBhdGggPyByZW1vdmVQYXRoLm5ld1BvcyA6IDApIC0gZGlhZ29uYWxQYXRoO1xuICAgICAgICAgICAgICBpZiAoYWRkUGF0aCkge1xuICAgICAgICAgICAgICAgIC8vIE5vIG9uZSBlbHNlIGlzIGdvaW5nIHRvIGF0dGVtcHQgdG8gdXNlIHRoaXMgdmFsdWUsIGNsZWFyIGl0XG4gICAgICAgICAgICAgICAgYmVzdFBhdGhbZGlhZ29uYWxQYXRoLTFdID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgdmFyIGNhbkFkZCA9IGFkZFBhdGggJiYgYWRkUGF0aC5uZXdQb3MrMSA8IG5ld0xlbjtcbiAgICAgICAgICAgICAgdmFyIGNhblJlbW92ZSA9IHJlbW92ZVBhdGggJiYgMCA8PSBvbGRQb3MgJiYgb2xkUG9zIDwgb2xkTGVuO1xuICAgICAgICAgICAgICBpZiAoIWNhbkFkZCAmJiAhY2FuUmVtb3ZlKSB7XG4gICAgICAgICAgICAgICAgLy8gSWYgdGhpcyBwYXRoIGlzIGEgdGVybWluYWwgdGhlbiBwcnVuZVxuICAgICAgICAgICAgICAgIGJlc3RQYXRoW2RpYWdvbmFsUGF0aF0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAvLyBTZWxlY3QgdGhlIGRpYWdvbmFsIHRoYXQgd2Ugd2FudCB0byBicmFuY2ggZnJvbS4gV2Ugc2VsZWN0IHRoZSBwcmlvclxuICAgICAgICAgICAgICAvLyBwYXRoIHdob3NlIHBvc2l0aW9uIGluIHRoZSBuZXcgc3RyaW5nIGlzIHRoZSBmYXJ0aGVzdCBmcm9tIHRoZSBvcmlnaW5cbiAgICAgICAgICAgICAgLy8gYW5kIGRvZXMgbm90IHBhc3MgdGhlIGJvdW5kcyBvZiB0aGUgZGlmZiBncmFwaFxuICAgICAgICAgICAgICBpZiAoIWNhbkFkZCB8fCAoY2FuUmVtb3ZlICYmIGFkZFBhdGgubmV3UG9zIDwgcmVtb3ZlUGF0aC5uZXdQb3MpKSB7XG4gICAgICAgICAgICAgICAgYmFzZVBhdGggPSBjbG9uZVBhdGgocmVtb3ZlUGF0aCk7XG4gICAgICAgICAgICAgICAgc2VsZi5wdXNoQ29tcG9uZW50KGJhc2VQYXRoLmNvbXBvbmVudHMsIHVuZGVmaW5lZCwgdHJ1ZSk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYmFzZVBhdGggPSBhZGRQYXRoOyAgIC8vIE5vIG5lZWQgdG8gY2xvbmUsIHdlJ3ZlIHB1bGxlZCBpdCBmcm9tIHRoZSBsaXN0XG4gICAgICAgICAgICAgICAgYmFzZVBhdGgubmV3UG9zKys7XG4gICAgICAgICAgICAgICAgc2VsZi5wdXNoQ29tcG9uZW50KGJhc2VQYXRoLmNvbXBvbmVudHMsIHRydWUsIHVuZGVmaW5lZCk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICB2YXIgb2xkUG9zID0gc2VsZi5leHRyYWN0Q29tbW9uKGJhc2VQYXRoLCBuZXdTdHJpbmcsIG9sZFN0cmluZywgZGlhZ29uYWxQYXRoKTtcblxuICAgICAgICAgICAgICAvLyBJZiB3ZSBoYXZlIGhpdCB0aGUgZW5kIG9mIGJvdGggc3RyaW5ncywgdGhlbiB3ZSBhcmUgZG9uZVxuICAgICAgICAgICAgICBpZiAoYmFzZVBhdGgubmV3UG9zKzEgPj0gbmV3TGVuICYmIG9sZFBvcysxID49IG9sZExlbikge1xuICAgICAgICAgICAgICAgIHJldHVybiBkb25lKGJ1aWxkVmFsdWVzKGJhc2VQYXRoLmNvbXBvbmVudHMsIG5ld1N0cmluZywgb2xkU3RyaW5nLCBzZWxmLnVzZUxvbmdlc3RUb2tlbikpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIE90aGVyd2lzZSB0cmFjayB0aGlzIHBhdGggYXMgYSBwb3RlbnRpYWwgY2FuZGlkYXRlIGFuZCBjb250aW51ZS5cbiAgICAgICAgICAgICAgICBiZXN0UGF0aFtkaWFnb25hbFBhdGhdID0gYmFzZVBhdGg7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZWRpdExlbmd0aCsrO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFBlcmZvcm1zIHRoZSBsZW5ndGggb2YgZWRpdCBpdGVyYXRpb24uIElzIGEgYml0IGZ1Z2x5IGFzIHRoaXMgaGFzIHRvIHN1cHBvcnQgdGhlIFxuICAgICAgICAgIC8vIHN5bmMgYW5kIGFzeW5jIG1vZGUgd2hpY2ggaXMgbmV2ZXIgZnVuLiBMb29wcyBvdmVyIGV4ZWNFZGl0TGVuZ3RoIHVudGlsIGEgdmFsdWVcbiAgICAgICAgICAvLyBpcyBwcm9kdWNlZC5cbiAgICAgICAgICB2YXIgZWRpdExlbmd0aCA9IDE7XG4gICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAoZnVuY3Rpb24gZXhlYygpIHtcbiAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAvLyBUaGlzIHNob3VsZCBub3QgaGFwcGVuLCBidXQgd2Ugd2FudCB0byBiZSBzYWZlLlxuICAgICAgICAgICAgICAgIC8qaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgICAgICAgICBpZiAoZWRpdExlbmd0aCA+IG1heEVkaXRMZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjaygpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICghZXhlY0VkaXRMZW5ndGgoKSkge1xuICAgICAgICAgICAgICAgICAgZXhlYygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSwgMCk7XG4gICAgICAgICAgICB9KSgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB3aGlsZShlZGl0TGVuZ3RoIDw9IG1heEVkaXRMZW5ndGgpIHtcbiAgICAgICAgICAgICAgdmFyIHJldCA9IGV4ZWNFZGl0TGVuZ3RoKCk7XG4gICAgICAgICAgICAgIGlmIChyZXQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmV0O1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHB1c2hDb21wb25lbnQ6IGZ1bmN0aW9uKGNvbXBvbmVudHMsIGFkZGVkLCByZW1vdmVkKSB7XG4gICAgICAgICAgdmFyIGxhc3QgPSBjb21wb25lbnRzW2NvbXBvbmVudHMubGVuZ3RoLTFdO1xuICAgICAgICAgIGlmIChsYXN0ICYmIGxhc3QuYWRkZWQgPT09IGFkZGVkICYmIGxhc3QucmVtb3ZlZCA9PT0gcmVtb3ZlZCkge1xuICAgICAgICAgICAgLy8gV2UgbmVlZCB0byBjbG9uZSBoZXJlIGFzIHRoZSBjb21wb25lbnQgY2xvbmUgb3BlcmF0aW9uIGlzIGp1c3RcbiAgICAgICAgICAgIC8vIGFzIHNoYWxsb3cgYXJyYXkgY2xvbmVcbiAgICAgICAgICAgIGNvbXBvbmVudHNbY29tcG9uZW50cy5sZW5ndGgtMV0gPSB7Y291bnQ6IGxhc3QuY291bnQgKyAxLCBhZGRlZDogYWRkZWQsIHJlbW92ZWQ6IHJlbW92ZWQgfTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29tcG9uZW50cy5wdXNoKHtjb3VudDogMSwgYWRkZWQ6IGFkZGVkLCByZW1vdmVkOiByZW1vdmVkIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZXh0cmFjdENvbW1vbjogZnVuY3Rpb24oYmFzZVBhdGgsIG5ld1N0cmluZywgb2xkU3RyaW5nLCBkaWFnb25hbFBhdGgpIHtcbiAgICAgICAgICB2YXIgbmV3TGVuID0gbmV3U3RyaW5nLmxlbmd0aCxcbiAgICAgICAgICAgICAgb2xkTGVuID0gb2xkU3RyaW5nLmxlbmd0aCxcbiAgICAgICAgICAgICAgbmV3UG9zID0gYmFzZVBhdGgubmV3UG9zLFxuICAgICAgICAgICAgICBvbGRQb3MgPSBuZXdQb3MgLSBkaWFnb25hbFBhdGgsXG5cbiAgICAgICAgICAgICAgY29tbW9uQ291bnQgPSAwO1xuICAgICAgICAgIHdoaWxlIChuZXdQb3MrMSA8IG5ld0xlbiAmJiBvbGRQb3MrMSA8IG9sZExlbiAmJiB0aGlzLmVxdWFscyhuZXdTdHJpbmdbbmV3UG9zKzFdLCBvbGRTdHJpbmdbb2xkUG9zKzFdKSkge1xuICAgICAgICAgICAgbmV3UG9zKys7XG4gICAgICAgICAgICBvbGRQb3MrKztcbiAgICAgICAgICAgIGNvbW1vbkNvdW50Kys7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGNvbW1vbkNvdW50KSB7XG4gICAgICAgICAgICBiYXNlUGF0aC5jb21wb25lbnRzLnB1c2goe2NvdW50OiBjb21tb25Db3VudH0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGJhc2VQYXRoLm5ld1BvcyA9IG5ld1BvcztcbiAgICAgICAgICByZXR1cm4gb2xkUG9zO1xuICAgICAgICB9LFxuXG4gICAgICAgIGVxdWFsczogZnVuY3Rpb24obGVmdCwgcmlnaHQpIHtcbiAgICAgICAgICB2YXIgcmVXaGl0ZXNwYWNlID0gL1xcUy87XG4gICAgICAgICAgcmV0dXJuIGxlZnQgPT09IHJpZ2h0IHx8ICh0aGlzLmlnbm9yZVdoaXRlc3BhY2UgJiYgIXJlV2hpdGVzcGFjZS50ZXN0KGxlZnQpICYmICFyZVdoaXRlc3BhY2UudGVzdChyaWdodCkpO1xuICAgICAgICB9LFxuICAgICAgICB0b2tlbml6ZTogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICByZXR1cm4gdmFsdWUuc3BsaXQoJycpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHZhciBDaGFyRGlmZiA9IG5ldyBEaWZmKCk7XG5cbiAgICB2YXIgV29yZERpZmYgPSBuZXcgRGlmZih0cnVlKTtcbiAgICB2YXIgV29yZFdpdGhTcGFjZURpZmYgPSBuZXcgRGlmZigpO1xuICAgIFdvcmREaWZmLnRva2VuaXplID0gV29yZFdpdGhTcGFjZURpZmYudG9rZW5pemUgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgcmV0dXJuIHJlbW92ZUVtcHR5KHZhbHVlLnNwbGl0KC8oXFxzK3xcXGIpLykpO1xuICAgIH07XG5cbiAgICB2YXIgQ3NzRGlmZiA9IG5ldyBEaWZmKHRydWUpO1xuICAgIENzc0RpZmYudG9rZW5pemUgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgcmV0dXJuIHJlbW92ZUVtcHR5KHZhbHVlLnNwbGl0KC8oW3t9OjssXXxcXHMrKS8pKTtcbiAgICB9O1xuXG4gICAgdmFyIExpbmVEaWZmID0gbmV3IERpZmYoKTtcbiAgICBMaW5lRGlmZi50b2tlbml6ZSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICB2YXIgcmV0TGluZXMgPSBbXSxcbiAgICAgICAgICBsaW5lcyA9IHZhbHVlLnNwbGl0KC9eL20pO1xuXG4gICAgICBmb3IodmFyIGkgPSAwOyBpIDwgbGluZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGxpbmUgPSBsaW5lc1tpXSxcbiAgICAgICAgICAgIGxhc3RMaW5lID0gbGluZXNbaSAtIDFdO1xuXG4gICAgICAgIC8vIE1lcmdlIGxpbmVzIHRoYXQgbWF5IGNvbnRhaW4gd2luZG93cyBuZXcgbGluZXNcbiAgICAgICAgaWYgKGxpbmUgPT09ICdcXG4nICYmIGxhc3RMaW5lICYmIGxhc3RMaW5lW2xhc3RMaW5lLmxlbmd0aCAtIDFdID09PSAnXFxyJykge1xuICAgICAgICAgIHJldExpbmVzW3JldExpbmVzLmxlbmd0aCAtIDFdICs9ICdcXG4nO1xuICAgICAgICB9IGVsc2UgaWYgKGxpbmUpIHtcbiAgICAgICAgICByZXRMaW5lcy5wdXNoKGxpbmUpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXRMaW5lcztcbiAgICB9O1xuXG4gICAgdmFyIFNlbnRlbmNlRGlmZiA9IG5ldyBEaWZmKCk7XG4gICAgU2VudGVuY2VEaWZmLnRva2VuaXplID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICByZXR1cm4gcmVtb3ZlRW1wdHkodmFsdWUuc3BsaXQoLyhcXFMuKz9bLiE/XSkoPz1cXHMrfCQpLykpO1xuICAgIH07XG5cbiAgICB2YXIgSnNvbkRpZmYgPSBuZXcgRGlmZigpO1xuICAgIC8vIERpc2NyaW1pbmF0ZSBiZXR3ZWVuIHR3byBsaW5lcyBvZiBwcmV0dHktcHJpbnRlZCwgc2VyaWFsaXplZCBKU09OIHdoZXJlIG9uZSBvZiB0aGVtIGhhcyBhXG4gICAgLy8gZGFuZ2xpbmcgY29tbWEgYW5kIHRoZSBvdGhlciBkb2Vzbid0LiBUdXJucyBvdXQgaW5jbHVkaW5nIHRoZSBkYW5nbGluZyBjb21tYSB5aWVsZHMgdGhlIG5pY2VzdCBvdXRwdXQ6XG4gICAgSnNvbkRpZmYudXNlTG9uZ2VzdFRva2VuID0gdHJ1ZTtcbiAgICBKc29uRGlmZi50b2tlbml6ZSA9IExpbmVEaWZmLnRva2VuaXplO1xuICAgIEpzb25EaWZmLmVxdWFscyA9IGZ1bmN0aW9uKGxlZnQsIHJpZ2h0KSB7XG4gICAgICByZXR1cm4gTGluZURpZmYuZXF1YWxzKGxlZnQucmVwbGFjZSgvLChbXFxyXFxuXSkvZywgJyQxJyksIHJpZ2h0LnJlcGxhY2UoLywoW1xcclxcbl0pL2csICckMScpKTtcbiAgICB9O1xuXG4gICAgdmFyIG9iamVjdFByb3RvdHlwZVRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuICAgIC8vIFRoaXMgZnVuY3Rpb24gaGFuZGxlcyB0aGUgcHJlc2VuY2Ugb2YgY2lyY3VsYXIgcmVmZXJlbmNlcyBieSBiYWlsaW5nIG91dCB3aGVuIGVuY291bnRlcmluZyBhblxuICAgIC8vIG9iamVjdCB0aGF0IGlzIGFscmVhZHkgb24gdGhlIFwic3RhY2tcIiBvZiBpdGVtcyBiZWluZyBwcm9jZXNzZWQuXG4gICAgZnVuY3Rpb24gY2Fub25pY2FsaXplKG9iaiwgc3RhY2ssIHJlcGxhY2VtZW50U3RhY2spIHtcbiAgICAgIHN0YWNrID0gc3RhY2sgfHwgW107XG4gICAgICByZXBsYWNlbWVudFN0YWNrID0gcmVwbGFjZW1lbnRTdGFjayB8fCBbXTtcblxuICAgICAgdmFyIGk7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwIDsgaSA8IHN0YWNrLmxlbmd0aCA7IGkgKz0gMSkge1xuICAgICAgICBpZiAoc3RhY2tbaV0gPT09IG9iaikge1xuICAgICAgICAgIHJldHVybiByZXBsYWNlbWVudFN0YWNrW2ldO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHZhciBjYW5vbmljYWxpemVkT2JqO1xuXG4gICAgICBpZiAoJ1tvYmplY3QgQXJyYXldJyA9PT0gb2JqZWN0UHJvdG90eXBlVG9TdHJpbmcuY2FsbChvYmopKSB7XG4gICAgICAgIHN0YWNrLnB1c2gob2JqKTtcbiAgICAgICAgY2Fub25pY2FsaXplZE9iaiA9IG5ldyBBcnJheShvYmoubGVuZ3RoKTtcbiAgICAgICAgcmVwbGFjZW1lbnRTdGFjay5wdXNoKGNhbm9uaWNhbGl6ZWRPYmopO1xuICAgICAgICBmb3IgKGkgPSAwIDsgaSA8IG9iai5sZW5ndGggOyBpICs9IDEpIHtcbiAgICAgICAgICBjYW5vbmljYWxpemVkT2JqW2ldID0gY2Fub25pY2FsaXplKG9ialtpXSwgc3RhY2ssIHJlcGxhY2VtZW50U3RhY2spO1xuICAgICAgICB9XG4gICAgICAgIHN0YWNrLnBvcCgpO1xuICAgICAgICByZXBsYWNlbWVudFN0YWNrLnBvcCgpO1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2Ygb2JqID09PSAnb2JqZWN0JyAmJiBvYmogIT09IG51bGwpIHtcbiAgICAgICAgc3RhY2sucHVzaChvYmopO1xuICAgICAgICBjYW5vbmljYWxpemVkT2JqID0ge307XG4gICAgICAgIHJlcGxhY2VtZW50U3RhY2sucHVzaChjYW5vbmljYWxpemVkT2JqKTtcbiAgICAgICAgdmFyIHNvcnRlZEtleXMgPSBbXTtcbiAgICAgICAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgICAgICAgIHNvcnRlZEtleXMucHVzaChrZXkpO1xuICAgICAgICB9XG4gICAgICAgIHNvcnRlZEtleXMuc29ydCgpO1xuICAgICAgICBmb3IgKGkgPSAwIDsgaSA8IHNvcnRlZEtleXMubGVuZ3RoIDsgaSArPSAxKSB7XG4gICAgICAgICAgdmFyIGtleSA9IHNvcnRlZEtleXNbaV07XG4gICAgICAgICAgY2Fub25pY2FsaXplZE9ialtrZXldID0gY2Fub25pY2FsaXplKG9ialtrZXldLCBzdGFjaywgcmVwbGFjZW1lbnRTdGFjayk7XG4gICAgICAgIH1cbiAgICAgICAgc3RhY2sucG9wKCk7XG4gICAgICAgIHJlcGxhY2VtZW50U3RhY2sucG9wKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjYW5vbmljYWxpemVkT2JqID0gb2JqO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNhbm9uaWNhbGl6ZWRPYmo7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIERpZmY6IERpZmYsXG5cbiAgICAgIGRpZmZDaGFyczogZnVuY3Rpb24ob2xkU3RyLCBuZXdTdHIsIGNhbGxiYWNrKSB7IHJldHVybiBDaGFyRGlmZi5kaWZmKG9sZFN0ciwgbmV3U3RyLCBjYWxsYmFjayk7IH0sXG4gICAgICBkaWZmV29yZHM6IGZ1bmN0aW9uKG9sZFN0ciwgbmV3U3RyLCBjYWxsYmFjaykgeyByZXR1cm4gV29yZERpZmYuZGlmZihvbGRTdHIsIG5ld1N0ciwgY2FsbGJhY2spOyB9LFxuICAgICAgZGlmZldvcmRzV2l0aFNwYWNlOiBmdW5jdGlvbihvbGRTdHIsIG5ld1N0ciwgY2FsbGJhY2spIHsgcmV0dXJuIFdvcmRXaXRoU3BhY2VEaWZmLmRpZmYob2xkU3RyLCBuZXdTdHIsIGNhbGxiYWNrKTsgfSxcbiAgICAgIGRpZmZMaW5lczogZnVuY3Rpb24ob2xkU3RyLCBuZXdTdHIsIGNhbGxiYWNrKSB7IHJldHVybiBMaW5lRGlmZi5kaWZmKG9sZFN0ciwgbmV3U3RyLCBjYWxsYmFjayk7IH0sXG4gICAgICBkaWZmU2VudGVuY2VzOiBmdW5jdGlvbihvbGRTdHIsIG5ld1N0ciwgY2FsbGJhY2spIHsgcmV0dXJuIFNlbnRlbmNlRGlmZi5kaWZmKG9sZFN0ciwgbmV3U3RyLCBjYWxsYmFjayk7IH0sXG5cbiAgICAgIGRpZmZDc3M6IGZ1bmN0aW9uKG9sZFN0ciwgbmV3U3RyLCBjYWxsYmFjaykgeyByZXR1cm4gQ3NzRGlmZi5kaWZmKG9sZFN0ciwgbmV3U3RyLCBjYWxsYmFjayk7IH0sXG4gICAgICBkaWZmSnNvbjogZnVuY3Rpb24ob2xkT2JqLCBuZXdPYmosIGNhbGxiYWNrKSB7XG4gICAgICAgIHJldHVybiBKc29uRGlmZi5kaWZmKFxuICAgICAgICAgIHR5cGVvZiBvbGRPYmogPT09ICdzdHJpbmcnID8gb2xkT2JqIDogSlNPTi5zdHJpbmdpZnkoY2Fub25pY2FsaXplKG9sZE9iaiksIHVuZGVmaW5lZCwgJyAgJyksXG4gICAgICAgICAgdHlwZW9mIG5ld09iaiA9PT0gJ3N0cmluZycgPyBuZXdPYmogOiBKU09OLnN0cmluZ2lmeShjYW5vbmljYWxpemUobmV3T2JqKSwgdW5kZWZpbmVkLCAnICAnKSxcbiAgICAgICAgICBjYWxsYmFja1xuICAgICAgICApO1xuICAgICAgfSxcblxuICAgICAgY3JlYXRlUGF0Y2g6IGZ1bmN0aW9uKGZpbGVOYW1lLCBvbGRTdHIsIG5ld1N0ciwgb2xkSGVhZGVyLCBuZXdIZWFkZXIpIHtcbiAgICAgICAgdmFyIHJldCA9IFtdO1xuXG4gICAgICAgIHJldC5wdXNoKCdJbmRleDogJyArIGZpbGVOYW1lKTtcbiAgICAgICAgcmV0LnB1c2goJz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0nKTtcbiAgICAgICAgcmV0LnB1c2goJy0tLSAnICsgZmlsZU5hbWUgKyAodHlwZW9mIG9sZEhlYWRlciA9PT0gJ3VuZGVmaW5lZCcgPyAnJyA6ICdcXHQnICsgb2xkSGVhZGVyKSk7XG4gICAgICAgIHJldC5wdXNoKCcrKysgJyArIGZpbGVOYW1lICsgKHR5cGVvZiBuZXdIZWFkZXIgPT09ICd1bmRlZmluZWQnID8gJycgOiAnXFx0JyArIG5ld0hlYWRlcikpO1xuXG4gICAgICAgIHZhciBkaWZmID0gTGluZURpZmYuZGlmZihvbGRTdHIsIG5ld1N0cik7XG4gICAgICAgIGlmICghZGlmZltkaWZmLmxlbmd0aC0xXS52YWx1ZSkge1xuICAgICAgICAgIGRpZmYucG9wKCk7ICAgLy8gUmVtb3ZlIHRyYWlsaW5nIG5ld2xpbmUgYWRkXG4gICAgICAgIH1cbiAgICAgICAgZGlmZi5wdXNoKHt2YWx1ZTogJycsIGxpbmVzOiBbXX0pOyAgIC8vIEFwcGVuZCBhbiBlbXB0eSB2YWx1ZSB0byBtYWtlIGNsZWFudXAgZWFzaWVyXG5cbiAgICAgICAgZnVuY3Rpb24gY29udGV4dExpbmVzKGxpbmVzKSB7XG4gICAgICAgICAgcmV0dXJuIG1hcChsaW5lcywgZnVuY3Rpb24oZW50cnkpIHsgcmV0dXJuICcgJyArIGVudHJ5OyB9KTtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiBlb2ZOTChjdXJSYW5nZSwgaSwgY3VycmVudCkge1xuICAgICAgICAgIHZhciBsYXN0ID0gZGlmZltkaWZmLmxlbmd0aC0yXSxcbiAgICAgICAgICAgICAgaXNMYXN0ID0gaSA9PT0gZGlmZi5sZW5ndGgtMixcbiAgICAgICAgICAgICAgaXNMYXN0T2ZUeXBlID0gaSA9PT0gZGlmZi5sZW5ndGgtMyAmJiAoY3VycmVudC5hZGRlZCAhPT0gbGFzdC5hZGRlZCB8fCBjdXJyZW50LnJlbW92ZWQgIT09IGxhc3QucmVtb3ZlZCk7XG5cbiAgICAgICAgICAvLyBGaWd1cmUgb3V0IGlmIHRoaXMgaXMgdGhlIGxhc3QgbGluZSBmb3IgdGhlIGdpdmVuIGZpbGUgYW5kIG1pc3NpbmcgTkxcbiAgICAgICAgICBpZiAoIS9cXG4kLy50ZXN0KGN1cnJlbnQudmFsdWUpICYmIChpc0xhc3QgfHwgaXNMYXN0T2ZUeXBlKSkge1xuICAgICAgICAgICAgY3VyUmFuZ2UucHVzaCgnXFxcXCBObyBuZXdsaW5lIGF0IGVuZCBvZiBmaWxlJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIG9sZFJhbmdlU3RhcnQgPSAwLCBuZXdSYW5nZVN0YXJ0ID0gMCwgY3VyUmFuZ2UgPSBbXSxcbiAgICAgICAgICAgIG9sZExpbmUgPSAxLCBuZXdMaW5lID0gMTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkaWZmLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgdmFyIGN1cnJlbnQgPSBkaWZmW2ldLFxuICAgICAgICAgICAgICBsaW5lcyA9IGN1cnJlbnQubGluZXMgfHwgY3VycmVudC52YWx1ZS5yZXBsYWNlKC9cXG4kLywgJycpLnNwbGl0KCdcXG4nKTtcbiAgICAgICAgICBjdXJyZW50LmxpbmVzID0gbGluZXM7XG5cbiAgICAgICAgICBpZiAoY3VycmVudC5hZGRlZCB8fCBjdXJyZW50LnJlbW92ZWQpIHtcbiAgICAgICAgICAgIGlmICghb2xkUmFuZ2VTdGFydCkge1xuICAgICAgICAgICAgICB2YXIgcHJldiA9IGRpZmZbaS0xXTtcbiAgICAgICAgICAgICAgb2xkUmFuZ2VTdGFydCA9IG9sZExpbmU7XG4gICAgICAgICAgICAgIG5ld1JhbmdlU3RhcnQgPSBuZXdMaW5lO1xuXG4gICAgICAgICAgICAgIGlmIChwcmV2KSB7XG4gICAgICAgICAgICAgICAgY3VyUmFuZ2UgPSBjb250ZXh0TGluZXMocHJldi5saW5lcy5zbGljZSgtNCkpO1xuICAgICAgICAgICAgICAgIG9sZFJhbmdlU3RhcnQgLT0gY3VyUmFuZ2UubGVuZ3RoO1xuICAgICAgICAgICAgICAgIG5ld1JhbmdlU3RhcnQgLT0gY3VyUmFuZ2UubGVuZ3RoO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjdXJSYW5nZS5wdXNoLmFwcGx5KGN1clJhbmdlLCBtYXAobGluZXMsIGZ1bmN0aW9uKGVudHJ5KSB7IHJldHVybiAoY3VycmVudC5hZGRlZD8nKyc6Jy0nKSArIGVudHJ5OyB9KSk7XG4gICAgICAgICAgICBlb2ZOTChjdXJSYW5nZSwgaSwgY3VycmVudCk7XG5cbiAgICAgICAgICAgIGlmIChjdXJyZW50LmFkZGVkKSB7XG4gICAgICAgICAgICAgIG5ld0xpbmUgKz0gbGluZXMubGVuZ3RoO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgb2xkTGluZSArPSBsaW5lcy5sZW5ndGg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChvbGRSYW5nZVN0YXJ0KSB7XG4gICAgICAgICAgICAgIC8vIENsb3NlIG91dCBhbnkgY2hhbmdlcyB0aGF0IGhhdmUgYmVlbiBvdXRwdXQgKG9yIGpvaW4gb3ZlcmxhcHBpbmcpXG4gICAgICAgICAgICAgIGlmIChsaW5lcy5sZW5ndGggPD0gOCAmJiBpIDwgZGlmZi5sZW5ndGgtMikge1xuICAgICAgICAgICAgICAgIC8vIE92ZXJsYXBwaW5nXG4gICAgICAgICAgICAgICAgY3VyUmFuZ2UucHVzaC5hcHBseShjdXJSYW5nZSwgY29udGV4dExpbmVzKGxpbmVzKSk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gZW5kIHRoZSByYW5nZSBhbmQgb3V0cHV0XG4gICAgICAgICAgICAgICAgdmFyIGNvbnRleHRTaXplID0gTWF0aC5taW4obGluZXMubGVuZ3RoLCA0KTtcbiAgICAgICAgICAgICAgICByZXQucHVzaChcbiAgICAgICAgICAgICAgICAgICAgJ0BAIC0nICsgb2xkUmFuZ2VTdGFydCArICcsJyArIChvbGRMaW5lLW9sZFJhbmdlU3RhcnQrY29udGV4dFNpemUpXG4gICAgICAgICAgICAgICAgICAgICsgJyArJyArIG5ld1JhbmdlU3RhcnQgKyAnLCcgKyAobmV3TGluZS1uZXdSYW5nZVN0YXJ0K2NvbnRleHRTaXplKVxuICAgICAgICAgICAgICAgICAgICArICcgQEAnKTtcbiAgICAgICAgICAgICAgICByZXQucHVzaC5hcHBseShyZXQsIGN1clJhbmdlKTtcbiAgICAgICAgICAgICAgICByZXQucHVzaC5hcHBseShyZXQsIGNvbnRleHRMaW5lcyhsaW5lcy5zbGljZSgwLCBjb250ZXh0U2l6ZSkpKTtcbiAgICAgICAgICAgICAgICBpZiAobGluZXMubGVuZ3RoIDw9IDQpIHtcbiAgICAgICAgICAgICAgICAgIGVvZk5MKHJldCwgaSwgY3VycmVudCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgb2xkUmFuZ2VTdGFydCA9IDA7ICBuZXdSYW5nZVN0YXJ0ID0gMDsgY3VyUmFuZ2UgPSBbXTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb2xkTGluZSArPSBsaW5lcy5sZW5ndGg7XG4gICAgICAgICAgICBuZXdMaW5lICs9IGxpbmVzLmxlbmd0aDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmV0LmpvaW4oJ1xcbicpICsgJ1xcbic7XG4gICAgICB9LFxuXG4gICAgICBhcHBseVBhdGNoOiBmdW5jdGlvbihvbGRTdHIsIHVuaURpZmYpIHtcbiAgICAgICAgdmFyIGRpZmZzdHIgPSB1bmlEaWZmLnNwbGl0KCdcXG4nKTtcbiAgICAgICAgdmFyIGRpZmYgPSBbXTtcbiAgICAgICAgdmFyIHJlbUVPRk5MID0gZmFsc2UsXG4gICAgICAgICAgICBhZGRFT0ZOTCA9IGZhbHNlO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAoZGlmZnN0clswXVswXT09PSdJJz80OjApOyBpIDwgZGlmZnN0ci5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGlmKGRpZmZzdHJbaV1bMF0gPT09ICdAJykge1xuICAgICAgICAgICAgdmFyIG1laCA9IGRpZmZzdHJbaV0uc3BsaXQoL0BAIC0oXFxkKyksKFxcZCspIFxcKyhcXGQrKSwoXFxkKykgQEAvKTtcbiAgICAgICAgICAgIGRpZmYudW5zaGlmdCh7XG4gICAgICAgICAgICAgIHN0YXJ0Om1laFszXSxcbiAgICAgICAgICAgICAgb2xkbGVuZ3RoOm1laFsyXSxcbiAgICAgICAgICAgICAgb2xkbGluZXM6W10sXG4gICAgICAgICAgICAgIG5ld2xlbmd0aDptZWhbNF0sXG4gICAgICAgICAgICAgIG5ld2xpbmVzOltdXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9IGVsc2UgaWYoZGlmZnN0cltpXVswXSA9PT0gJysnKSB7XG4gICAgICAgICAgICBkaWZmWzBdLm5ld2xpbmVzLnB1c2goZGlmZnN0cltpXS5zdWJzdHIoMSkpO1xuICAgICAgICAgIH0gZWxzZSBpZihkaWZmc3RyW2ldWzBdID09PSAnLScpIHtcbiAgICAgICAgICAgIGRpZmZbMF0ub2xkbGluZXMucHVzaChkaWZmc3RyW2ldLnN1YnN0cigxKSk7XG4gICAgICAgICAgfSBlbHNlIGlmKGRpZmZzdHJbaV1bMF0gPT09ICcgJykge1xuICAgICAgICAgICAgZGlmZlswXS5uZXdsaW5lcy5wdXNoKGRpZmZzdHJbaV0uc3Vic3RyKDEpKTtcbiAgICAgICAgICAgIGRpZmZbMF0ub2xkbGluZXMucHVzaChkaWZmc3RyW2ldLnN1YnN0cigxKSk7XG4gICAgICAgICAgfSBlbHNlIGlmKGRpZmZzdHJbaV1bMF0gPT09ICdcXFxcJykge1xuICAgICAgICAgICAgaWYgKGRpZmZzdHJbaS0xXVswXSA9PT0gJysnKSB7XG4gICAgICAgICAgICAgIHJlbUVPRk5MID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZihkaWZmc3RyW2ktMV1bMF0gPT09ICctJykge1xuICAgICAgICAgICAgICBhZGRFT0ZOTCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHN0ciA9IG9sZFN0ci5zcGxpdCgnXFxuJyk7XG4gICAgICAgIGZvciAodmFyIGkgPSBkaWZmLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgdmFyIGQgPSBkaWZmW2ldO1xuICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgZC5vbGRsZW5ndGg7IGorKykge1xuICAgICAgICAgICAgaWYoc3RyW2Quc3RhcnQtMStqXSAhPT0gZC5vbGRsaW5lc1tqXSkge1xuICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIEFycmF5LnByb3RvdHlwZS5zcGxpY2UuYXBwbHkoc3RyLFtkLnN0YXJ0LTEsK2Qub2xkbGVuZ3RoXS5jb25jYXQoZC5uZXdsaW5lcykpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHJlbUVPRk5MKSB7XG4gICAgICAgICAgd2hpbGUgKCFzdHJbc3RyLmxlbmd0aC0xXSkge1xuICAgICAgICAgICAgc3RyLnBvcCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChhZGRFT0ZOTCkge1xuICAgICAgICAgIHN0ci5wdXNoKCcnKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3RyLmpvaW4oJ1xcbicpO1xuICAgICAgfSxcblxuICAgICAgY29udmVydENoYW5nZXNUb1hNTDogZnVuY3Rpb24oY2hhbmdlcyl7XG4gICAgICAgIHZhciByZXQgPSBbXTtcbiAgICAgICAgZm9yICggdmFyIGkgPSAwOyBpIDwgY2hhbmdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHZhciBjaGFuZ2UgPSBjaGFuZ2VzW2ldO1xuICAgICAgICAgIGlmIChjaGFuZ2UuYWRkZWQpIHtcbiAgICAgICAgICAgIHJldC5wdXNoKCc8aW5zPicpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoY2hhbmdlLnJlbW92ZWQpIHtcbiAgICAgICAgICAgIHJldC5wdXNoKCc8ZGVsPicpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldC5wdXNoKGVzY2FwZUhUTUwoY2hhbmdlLnZhbHVlKSk7XG5cbiAgICAgICAgICBpZiAoY2hhbmdlLmFkZGVkKSB7XG4gICAgICAgICAgICByZXQucHVzaCgnPC9pbnM+Jyk7XG4gICAgICAgICAgfSBlbHNlIGlmIChjaGFuZ2UucmVtb3ZlZCkge1xuICAgICAgICAgICAgcmV0LnB1c2goJzwvZGVsPicpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmV0LmpvaW4oJycpO1xuICAgICAgfSxcblxuICAgICAgLy8gU2VlOiBodHRwOi8vY29kZS5nb29nbGUuY29tL3AvZ29vZ2xlLWRpZmYtbWF0Y2gtcGF0Y2gvd2lraS9BUElcbiAgICAgIGNvbnZlcnRDaGFuZ2VzVG9ETVA6IGZ1bmN0aW9uKGNoYW5nZXMpe1xuICAgICAgICB2YXIgcmV0ID0gW10sIGNoYW5nZTtcbiAgICAgICAgZm9yICggdmFyIGkgPSAwOyBpIDwgY2hhbmdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGNoYW5nZSA9IGNoYW5nZXNbaV07XG4gICAgICAgICAgcmV0LnB1c2goWyhjaGFuZ2UuYWRkZWQgPyAxIDogY2hhbmdlLnJlbW92ZWQgPyAtMSA6IDApLCBjaGFuZ2UudmFsdWVdKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmV0O1xuICAgICAgfSxcblxuICAgICAgY2Fub25pY2FsaXplOiBjYW5vbmljYWxpemVcbiAgICB9O1xuICB9KSgpO1xuXG4gIC8qaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBtb2R1bGUuZXhwb3J0cyA9IEpzRGlmZjtcbiAgfVxuICBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nKSB7XG4gICAgLypnbG9iYWwgZGVmaW5lICovXG4gICAgZGVmaW5lKFtdLCBmdW5jdGlvbigpIHsgcmV0dXJuIEpzRGlmZjsgfSk7XG4gIH1cbiAgZWxzZSBpZiAodHlwZW9mIGdsb2JhbC5Kc0RpZmYgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgZ2xvYmFsLkpzRGlmZiA9IEpzRGlmZjtcbiAgfVxufSkodGhpcyk7XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL34vZGlmZi9kaWZmLmpzXG4gKiovIl0sInNvdXJjZVJvb3QiOiIiLCJmaWxlIjoiLi9kaXN0L3JlYWN0LWRpZmYuanMifQ==