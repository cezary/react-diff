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
	
	module.exports = React.createClass({
	  displayName: 'Diff',
	
	  render: function () {
	    var diff = jsdiff.diffChars(this.props.stringA, this.props.stringB);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCA1ZWFmNzc1ZDllMDZhMzcwYjc5OCIsIndlYnBhY2s6Ly8vLi9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9saWIvcmVhY3QtZGlmZi5qcyIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJSZWFjdFwiIiwid2VicGFjazovLy8uL34vZGlmZi9kaWZmLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRCxPO0FDVkE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsdUJBQWU7QUFDZjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQSx3Qzs7Ozs7OztBQ3RDQSxPQUFNLENBQUMsT0FBTyxHQUFHLG1CQUFPLENBQUMsQ0FBa0IsQ0FBQyxDQUFDOzs7Ozs7O0FDQTdDLEtBQUksS0FBSyxHQUFHLG1CQUFPLENBQUMsQ0FBTyxDQUFDLENBQUM7QUFDN0IsS0FBSSxNQUFNLEdBQUcsbUJBQU8sQ0FBQyxDQUFNLENBQUMsQ0FBQzs7QUFFN0IsT0FBTSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDO0FBQ25DLEdBQUUsV0FBVyxFQUFFLE1BQU07O0dBRW5CLE1BQU0sRUFBRSxZQUFZO0tBQ2xCLElBQUksSUFBSSxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUNwRSxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsSUFBSSxF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dGlvbihyb290LCBmYWN0b3J5KSB7XG5cdGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0Jylcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkocmVxdWlyZShcIlJlYWN0XCIpKTtcblx0ZWxzZSBpZih0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpXG5cdFx0ZGVmaW5lKFtcIlJlYWN0XCJdLCBmYWN0b3J5KTtcblx0ZWxzZSBpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpXG5cdFx0ZXhwb3J0c1tcIkRpZmZcIl0gPSBmYWN0b3J5KHJlcXVpcmUoXCJSZWFjdFwiKSk7XG5cdGVsc2Vcblx0XHRyb290W1wiRGlmZlwiXSA9IGZhY3Rvcnkocm9vdFtcIlJlYWN0XCJdKTtcbn0pKHRoaXMsIGZ1bmN0aW9uKF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfMl9fKSB7XG5yZXR1cm4gXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uXG4gKiovIiwiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pXG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG5cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGV4cG9ydHM6IHt9LFxuIFx0XHRcdGlkOiBtb2R1bGVJZCxcbiBcdFx0XHRsb2FkZWQ6IGZhbHNlXG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmxvYWRlZCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oMCk7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogd2VicGFjay9ib290c3RyYXAgNWVhZjc3NWQ5ZTA2YTM3MGI3OThcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vbGliL3JlYWN0LWRpZmYnKTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vaW5kZXguanNcbiAqKi8iLCJ2YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIGpzZGlmZiA9IHJlcXVpcmUoJ2RpZmYnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gIGRpc3BsYXlOYW1lOiAnRGlmZicsXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGRpZmYgPSBqc2RpZmYuZGlmZkNoYXJzKHRoaXMucHJvcHMuc3RyaW5nQSwgdGhpcy5wcm9wcy5zdHJpbmdCKTtcbiAgICB2YXIgcmVzdWx0ID0gZGlmZi5tYXAoZnVuY3Rpb24ocGFydCkge1xuICAgICAgdmFyIHNwYW5TdHlsZSA9IHtcbiAgICAgICAgYmFja2dyb3VuZENvbG9yOiBwYXJ0LmFkZGVkID8gJ2xpZ2h0Z3JlZW4nIDogcGFydC5yZW1vdmVkID8gJ3NhbG1vbicgOiAnbGlnaHRncmV5J1xuICAgICAgfVxuICAgICAgcmV0dXJuIDxzcGFuIHN0eWxlPXtzcGFuU3R5bGV9PntwYXJ0LnZhbHVlfTwvc3Bhbj5cbiAgICB9KTtcbiAgICByZXR1cm4gKFxuICAgICAgPHByZSBjbGFzc05hbWU9J2RpZmYtcmVzdWx0Jz5cbiAgICAgICAge3Jlc3VsdH1cbiAgICAgIDwvcHJlPlxuICAgICk7XG4gIH0sXG59KTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vbGliL3JlYWN0LWRpZmYuanNcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfMl9fO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogZXh0ZXJuYWwgXCJSZWFjdFwiXG4gKiogbW9kdWxlIGlkID0gMlxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLyogU2VlIExJQ0VOU0UgZmlsZSBmb3IgdGVybXMgb2YgdXNlICovXG5cbi8qXG4gKiBUZXh0IGRpZmYgaW1wbGVtZW50YXRpb24uXG4gKlxuICogVGhpcyBsaWJyYXJ5IHN1cHBvcnRzIHRoZSBmb2xsb3dpbmcgQVBJUzpcbiAqIEpzRGlmZi5kaWZmQ2hhcnM6IENoYXJhY3RlciBieSBjaGFyYWN0ZXIgZGlmZlxuICogSnNEaWZmLmRpZmZXb3JkczogV29yZCAoYXMgZGVmaW5lZCBieSBcXGIgcmVnZXgpIGRpZmYgd2hpY2ggaWdub3JlcyB3aGl0ZXNwYWNlXG4gKiBKc0RpZmYuZGlmZkxpbmVzOiBMaW5lIGJhc2VkIGRpZmZcbiAqXG4gKiBKc0RpZmYuZGlmZkNzczogRGlmZiB0YXJnZXRlZCBhdCBDU1MgY29udGVudFxuICpcbiAqIFRoZXNlIG1ldGhvZHMgYXJlIGJhc2VkIG9uIHRoZSBpbXBsZW1lbnRhdGlvbiBwcm9wb3NlZCBpblxuICogXCJBbiBPKE5EKSBEaWZmZXJlbmNlIEFsZ29yaXRobSBhbmQgaXRzIFZhcmlhdGlvbnNcIiAoTXllcnMsIDE5ODYpLlxuICogaHR0cDovL2NpdGVzZWVyeC5pc3QucHN1LmVkdS92aWV3ZG9jL3N1bW1hcnk/ZG9pPTEwLjEuMS40LjY5MjdcbiAqL1xuKGZ1bmN0aW9uKGdsb2JhbCwgdW5kZWZpbmVkKSB7XG4gIHZhciBKc0RpZmYgPSAoZnVuY3Rpb24oKSB7XG4gICAgLypqc2hpbnQgbWF4cGFyYW1zOiA1Ki9cbiAgICAvKmlzdGFuYnVsIGlnbm9yZSBuZXh0Ki9cbiAgICBmdW5jdGlvbiBtYXAoYXJyLCBtYXBwZXIsIHRoYXQpIHtcbiAgICAgIGlmIChBcnJheS5wcm90b3R5cGUubWFwKSB7XG4gICAgICAgIHJldHVybiBBcnJheS5wcm90b3R5cGUubWFwLmNhbGwoYXJyLCBtYXBwZXIsIHRoYXQpO1xuICAgICAgfVxuXG4gICAgICB2YXIgb3RoZXIgPSBuZXcgQXJyYXkoYXJyLmxlbmd0aCk7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwLCBuID0gYXJyLmxlbmd0aDsgaSA8IG47IGkrKykge1xuICAgICAgICBvdGhlcltpXSA9IG1hcHBlci5jYWxsKHRoYXQsIGFycltpXSwgaSwgYXJyKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBvdGhlcjtcbiAgICB9XG4gICAgZnVuY3Rpb24gY2xvbmVQYXRoKHBhdGgpIHtcbiAgICAgIHJldHVybiB7IG5ld1BvczogcGF0aC5uZXdQb3MsIGNvbXBvbmVudHM6IHBhdGguY29tcG9uZW50cy5zbGljZSgwKSB9O1xuICAgIH1cbiAgICBmdW5jdGlvbiByZW1vdmVFbXB0eShhcnJheSkge1xuICAgICAgdmFyIHJldCA9IFtdO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoYXJyYXlbaV0pIHtcbiAgICAgICAgICByZXQucHVzaChhcnJheVtpXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGVzY2FwZUhUTUwocykge1xuICAgICAgdmFyIG4gPSBzO1xuICAgICAgbiA9IG4ucmVwbGFjZSgvJi9nLCAnJmFtcDsnKTtcbiAgICAgIG4gPSBuLnJlcGxhY2UoLzwvZywgJyZsdDsnKTtcbiAgICAgIG4gPSBuLnJlcGxhY2UoLz4vZywgJyZndDsnKTtcbiAgICAgIG4gPSBuLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKTtcblxuICAgICAgcmV0dXJuIG47XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYnVpbGRWYWx1ZXMoY29tcG9uZW50cywgbmV3U3RyaW5nLCBvbGRTdHJpbmcsIHVzZUxvbmdlc3RUb2tlbikge1xuICAgICAgdmFyIGNvbXBvbmVudFBvcyA9IDAsXG4gICAgICAgICAgY29tcG9uZW50TGVuID0gY29tcG9uZW50cy5sZW5ndGgsXG4gICAgICAgICAgbmV3UG9zID0gMCxcbiAgICAgICAgICBvbGRQb3MgPSAwO1xuXG4gICAgICBmb3IgKDsgY29tcG9uZW50UG9zIDwgY29tcG9uZW50TGVuOyBjb21wb25lbnRQb3MrKykge1xuICAgICAgICB2YXIgY29tcG9uZW50ID0gY29tcG9uZW50c1tjb21wb25lbnRQb3NdO1xuICAgICAgICBpZiAoIWNvbXBvbmVudC5yZW1vdmVkKSB7XG4gICAgICAgICAgaWYgKCFjb21wb25lbnQuYWRkZWQgJiYgdXNlTG9uZ2VzdFRva2VuKSB7XG4gICAgICAgICAgICB2YXIgdmFsdWUgPSBuZXdTdHJpbmcuc2xpY2UobmV3UG9zLCBuZXdQb3MgKyBjb21wb25lbnQuY291bnQpO1xuICAgICAgICAgICAgdmFsdWUgPSBtYXAodmFsdWUsIGZ1bmN0aW9uKHZhbHVlLCBpKSB7XG4gICAgICAgICAgICAgIHZhciBvbGRWYWx1ZSA9IG9sZFN0cmluZ1tvbGRQb3MgKyBpXTtcbiAgICAgICAgICAgICAgcmV0dXJuIG9sZFZhbHVlLmxlbmd0aCA+IHZhbHVlLmxlbmd0aCA/IG9sZFZhbHVlIDogdmFsdWU7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgY29tcG9uZW50LnZhbHVlID0gdmFsdWUuam9pbignJyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbXBvbmVudC52YWx1ZSA9IG5ld1N0cmluZy5zbGljZShuZXdQb3MsIG5ld1BvcyArIGNvbXBvbmVudC5jb3VudCkuam9pbignJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIG5ld1BvcyArPSBjb21wb25lbnQuY291bnQ7XG5cbiAgICAgICAgICAvLyBDb21tb24gY2FzZVxuICAgICAgICAgIGlmICghY29tcG9uZW50LmFkZGVkKSB7XG4gICAgICAgICAgICBvbGRQb3MgKz0gY29tcG9uZW50LmNvdW50O1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb21wb25lbnQudmFsdWUgPSBvbGRTdHJpbmcuc2xpY2Uob2xkUG9zLCBvbGRQb3MgKyBjb21wb25lbnQuY291bnQpLmpvaW4oJycpO1xuICAgICAgICAgIG9sZFBvcyArPSBjb21wb25lbnQuY291bnQ7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGNvbXBvbmVudHM7XG4gICAgfVxuXG4gICAgdmFyIERpZmYgPSBmdW5jdGlvbihpZ25vcmVXaGl0ZXNwYWNlKSB7XG4gICAgICB0aGlzLmlnbm9yZVdoaXRlc3BhY2UgPSBpZ25vcmVXaGl0ZXNwYWNlO1xuICAgIH07XG4gICAgRGlmZi5wcm90b3R5cGUgPSB7XG4gICAgICAgIGRpZmY6IGZ1bmN0aW9uKG9sZFN0cmluZywgbmV3U3RyaW5nLCBjYWxsYmFjaykge1xuICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICAgIGZ1bmN0aW9uIGRvbmUodmFsdWUpIHtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyBjYWxsYmFjayh1bmRlZmluZWQsIHZhbHVlKTsgfSwgMCk7XG4gICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIEhhbmRsZSB0aGUgaWRlbnRpdHkgY2FzZSAodGhpcyBpcyBkdWUgdG8gdW5yb2xsaW5nIGVkaXRMZW5ndGggPT0gMFxuICAgICAgICAgIGlmIChuZXdTdHJpbmcgPT09IG9sZFN0cmluZykge1xuICAgICAgICAgICAgcmV0dXJuIGRvbmUoW3sgdmFsdWU6IG5ld1N0cmluZyB9XSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICghbmV3U3RyaW5nKSB7XG4gICAgICAgICAgICByZXR1cm4gZG9uZShbeyB2YWx1ZTogb2xkU3RyaW5nLCByZW1vdmVkOiB0cnVlIH1dKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCFvbGRTdHJpbmcpIHtcbiAgICAgICAgICAgIHJldHVybiBkb25lKFt7IHZhbHVlOiBuZXdTdHJpbmcsIGFkZGVkOiB0cnVlIH1dKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBuZXdTdHJpbmcgPSB0aGlzLnRva2VuaXplKG5ld1N0cmluZyk7XG4gICAgICAgICAgb2xkU3RyaW5nID0gdGhpcy50b2tlbml6ZShvbGRTdHJpbmcpO1xuXG4gICAgICAgICAgdmFyIG5ld0xlbiA9IG5ld1N0cmluZy5sZW5ndGgsIG9sZExlbiA9IG9sZFN0cmluZy5sZW5ndGg7XG4gICAgICAgICAgdmFyIG1heEVkaXRMZW5ndGggPSBuZXdMZW4gKyBvbGRMZW47XG4gICAgICAgICAgdmFyIGJlc3RQYXRoID0gW3sgbmV3UG9zOiAtMSwgY29tcG9uZW50czogW10gfV07XG5cbiAgICAgICAgICAvLyBTZWVkIGVkaXRMZW5ndGggPSAwLCBpLmUuIHRoZSBjb250ZW50IHN0YXJ0cyB3aXRoIHRoZSBzYW1lIHZhbHVlc1xuICAgICAgICAgIHZhciBvbGRQb3MgPSB0aGlzLmV4dHJhY3RDb21tb24oYmVzdFBhdGhbMF0sIG5ld1N0cmluZywgb2xkU3RyaW5nLCAwKTtcbiAgICAgICAgICBpZiAoYmVzdFBhdGhbMF0ubmV3UG9zKzEgPj0gbmV3TGVuICYmIG9sZFBvcysxID49IG9sZExlbikge1xuICAgICAgICAgICAgLy8gSWRlbnRpdHkgcGVyIHRoZSBlcXVhbGl0eSBhbmQgdG9rZW5pemVyXG4gICAgICAgICAgICByZXR1cm4gZG9uZShbe3ZhbHVlOiBuZXdTdHJpbmcuam9pbignJyl9XSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gTWFpbiB3b3JrZXIgbWV0aG9kLiBjaGVja3MgYWxsIHBlcm11dGF0aW9ucyBvZiBhIGdpdmVuIGVkaXQgbGVuZ3RoIGZvciBhY2NlcHRhbmNlLlxuICAgICAgICAgIGZ1bmN0aW9uIGV4ZWNFZGl0TGVuZ3RoKCkge1xuICAgICAgICAgICAgZm9yICh2YXIgZGlhZ29uYWxQYXRoID0gLTEqZWRpdExlbmd0aDsgZGlhZ29uYWxQYXRoIDw9IGVkaXRMZW5ndGg7IGRpYWdvbmFsUGF0aCs9Mikge1xuICAgICAgICAgICAgICB2YXIgYmFzZVBhdGg7XG4gICAgICAgICAgICAgIHZhciBhZGRQYXRoID0gYmVzdFBhdGhbZGlhZ29uYWxQYXRoLTFdLFxuICAgICAgICAgICAgICAgICAgcmVtb3ZlUGF0aCA9IGJlc3RQYXRoW2RpYWdvbmFsUGF0aCsxXTtcbiAgICAgICAgICAgICAgb2xkUG9zID0gKHJlbW92ZVBhdGggPyByZW1vdmVQYXRoLm5ld1BvcyA6IDApIC0gZGlhZ29uYWxQYXRoO1xuICAgICAgICAgICAgICBpZiAoYWRkUGF0aCkge1xuICAgICAgICAgICAgICAgIC8vIE5vIG9uZSBlbHNlIGlzIGdvaW5nIHRvIGF0dGVtcHQgdG8gdXNlIHRoaXMgdmFsdWUsIGNsZWFyIGl0XG4gICAgICAgICAgICAgICAgYmVzdFBhdGhbZGlhZ29uYWxQYXRoLTFdID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgdmFyIGNhbkFkZCA9IGFkZFBhdGggJiYgYWRkUGF0aC5uZXdQb3MrMSA8IG5ld0xlbjtcbiAgICAgICAgICAgICAgdmFyIGNhblJlbW92ZSA9IHJlbW92ZVBhdGggJiYgMCA8PSBvbGRQb3MgJiYgb2xkUG9zIDwgb2xkTGVuO1xuICAgICAgICAgICAgICBpZiAoIWNhbkFkZCAmJiAhY2FuUmVtb3ZlKSB7XG4gICAgICAgICAgICAgICAgLy8gSWYgdGhpcyBwYXRoIGlzIGEgdGVybWluYWwgdGhlbiBwcnVuZVxuICAgICAgICAgICAgICAgIGJlc3RQYXRoW2RpYWdvbmFsUGF0aF0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAvLyBTZWxlY3QgdGhlIGRpYWdvbmFsIHRoYXQgd2Ugd2FudCB0byBicmFuY2ggZnJvbS4gV2Ugc2VsZWN0IHRoZSBwcmlvclxuICAgICAgICAgICAgICAvLyBwYXRoIHdob3NlIHBvc2l0aW9uIGluIHRoZSBuZXcgc3RyaW5nIGlzIHRoZSBmYXJ0aGVzdCBmcm9tIHRoZSBvcmlnaW5cbiAgICAgICAgICAgICAgLy8gYW5kIGRvZXMgbm90IHBhc3MgdGhlIGJvdW5kcyBvZiB0aGUgZGlmZiBncmFwaFxuICAgICAgICAgICAgICBpZiAoIWNhbkFkZCB8fCAoY2FuUmVtb3ZlICYmIGFkZFBhdGgubmV3UG9zIDwgcmVtb3ZlUGF0aC5uZXdQb3MpKSB7XG4gICAgICAgICAgICAgICAgYmFzZVBhdGggPSBjbG9uZVBhdGgocmVtb3ZlUGF0aCk7XG4gICAgICAgICAgICAgICAgc2VsZi5wdXNoQ29tcG9uZW50KGJhc2VQYXRoLmNvbXBvbmVudHMsIHVuZGVmaW5lZCwgdHJ1ZSk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYmFzZVBhdGggPSBhZGRQYXRoOyAgIC8vIE5vIG5lZWQgdG8gY2xvbmUsIHdlJ3ZlIHB1bGxlZCBpdCBmcm9tIHRoZSBsaXN0XG4gICAgICAgICAgICAgICAgYmFzZVBhdGgubmV3UG9zKys7XG4gICAgICAgICAgICAgICAgc2VsZi5wdXNoQ29tcG9uZW50KGJhc2VQYXRoLmNvbXBvbmVudHMsIHRydWUsIHVuZGVmaW5lZCk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICB2YXIgb2xkUG9zID0gc2VsZi5leHRyYWN0Q29tbW9uKGJhc2VQYXRoLCBuZXdTdHJpbmcsIG9sZFN0cmluZywgZGlhZ29uYWxQYXRoKTtcblxuICAgICAgICAgICAgICAvLyBJZiB3ZSBoYXZlIGhpdCB0aGUgZW5kIG9mIGJvdGggc3RyaW5ncywgdGhlbiB3ZSBhcmUgZG9uZVxuICAgICAgICAgICAgICBpZiAoYmFzZVBhdGgubmV3UG9zKzEgPj0gbmV3TGVuICYmIG9sZFBvcysxID49IG9sZExlbikge1xuICAgICAgICAgICAgICAgIHJldHVybiBkb25lKGJ1aWxkVmFsdWVzKGJhc2VQYXRoLmNvbXBvbmVudHMsIG5ld1N0cmluZywgb2xkU3RyaW5nLCBzZWxmLnVzZUxvbmdlc3RUb2tlbikpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIE90aGVyd2lzZSB0cmFjayB0aGlzIHBhdGggYXMgYSBwb3RlbnRpYWwgY2FuZGlkYXRlIGFuZCBjb250aW51ZS5cbiAgICAgICAgICAgICAgICBiZXN0UGF0aFtkaWFnb25hbFBhdGhdID0gYmFzZVBhdGg7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZWRpdExlbmd0aCsrO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFBlcmZvcm1zIHRoZSBsZW5ndGggb2YgZWRpdCBpdGVyYXRpb24uIElzIGEgYml0IGZ1Z2x5IGFzIHRoaXMgaGFzIHRvIHN1cHBvcnQgdGhlIFxuICAgICAgICAgIC8vIHN5bmMgYW5kIGFzeW5jIG1vZGUgd2hpY2ggaXMgbmV2ZXIgZnVuLiBMb29wcyBvdmVyIGV4ZWNFZGl0TGVuZ3RoIHVudGlsIGEgdmFsdWVcbiAgICAgICAgICAvLyBpcyBwcm9kdWNlZC5cbiAgICAgICAgICB2YXIgZWRpdExlbmd0aCA9IDE7XG4gICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAoZnVuY3Rpb24gZXhlYygpIHtcbiAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAvLyBUaGlzIHNob3VsZCBub3QgaGFwcGVuLCBidXQgd2Ugd2FudCB0byBiZSBzYWZlLlxuICAgICAgICAgICAgICAgIC8qaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgICAgICAgICBpZiAoZWRpdExlbmd0aCA+IG1heEVkaXRMZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjaygpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICghZXhlY0VkaXRMZW5ndGgoKSkge1xuICAgICAgICAgICAgICAgICAgZXhlYygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSwgMCk7XG4gICAgICAgICAgICB9KSgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB3aGlsZShlZGl0TGVuZ3RoIDw9IG1heEVkaXRMZW5ndGgpIHtcbiAgICAgICAgICAgICAgdmFyIHJldCA9IGV4ZWNFZGl0TGVuZ3RoKCk7XG4gICAgICAgICAgICAgIGlmIChyZXQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmV0O1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHB1c2hDb21wb25lbnQ6IGZ1bmN0aW9uKGNvbXBvbmVudHMsIGFkZGVkLCByZW1vdmVkKSB7XG4gICAgICAgICAgdmFyIGxhc3QgPSBjb21wb25lbnRzW2NvbXBvbmVudHMubGVuZ3RoLTFdO1xuICAgICAgICAgIGlmIChsYXN0ICYmIGxhc3QuYWRkZWQgPT09IGFkZGVkICYmIGxhc3QucmVtb3ZlZCA9PT0gcmVtb3ZlZCkge1xuICAgICAgICAgICAgLy8gV2UgbmVlZCB0byBjbG9uZSBoZXJlIGFzIHRoZSBjb21wb25lbnQgY2xvbmUgb3BlcmF0aW9uIGlzIGp1c3RcbiAgICAgICAgICAgIC8vIGFzIHNoYWxsb3cgYXJyYXkgY2xvbmVcbiAgICAgICAgICAgIGNvbXBvbmVudHNbY29tcG9uZW50cy5sZW5ndGgtMV0gPSB7Y291bnQ6IGxhc3QuY291bnQgKyAxLCBhZGRlZDogYWRkZWQsIHJlbW92ZWQ6IHJlbW92ZWQgfTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29tcG9uZW50cy5wdXNoKHtjb3VudDogMSwgYWRkZWQ6IGFkZGVkLCByZW1vdmVkOiByZW1vdmVkIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZXh0cmFjdENvbW1vbjogZnVuY3Rpb24oYmFzZVBhdGgsIG5ld1N0cmluZywgb2xkU3RyaW5nLCBkaWFnb25hbFBhdGgpIHtcbiAgICAgICAgICB2YXIgbmV3TGVuID0gbmV3U3RyaW5nLmxlbmd0aCxcbiAgICAgICAgICAgICAgb2xkTGVuID0gb2xkU3RyaW5nLmxlbmd0aCxcbiAgICAgICAgICAgICAgbmV3UG9zID0gYmFzZVBhdGgubmV3UG9zLFxuICAgICAgICAgICAgICBvbGRQb3MgPSBuZXdQb3MgLSBkaWFnb25hbFBhdGgsXG5cbiAgICAgICAgICAgICAgY29tbW9uQ291bnQgPSAwO1xuICAgICAgICAgIHdoaWxlIChuZXdQb3MrMSA8IG5ld0xlbiAmJiBvbGRQb3MrMSA8IG9sZExlbiAmJiB0aGlzLmVxdWFscyhuZXdTdHJpbmdbbmV3UG9zKzFdLCBvbGRTdHJpbmdbb2xkUG9zKzFdKSkge1xuICAgICAgICAgICAgbmV3UG9zKys7XG4gICAgICAgICAgICBvbGRQb3MrKztcbiAgICAgICAgICAgIGNvbW1vbkNvdW50Kys7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGNvbW1vbkNvdW50KSB7XG4gICAgICAgICAgICBiYXNlUGF0aC5jb21wb25lbnRzLnB1c2goe2NvdW50OiBjb21tb25Db3VudH0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGJhc2VQYXRoLm5ld1BvcyA9IG5ld1BvcztcbiAgICAgICAgICByZXR1cm4gb2xkUG9zO1xuICAgICAgICB9LFxuXG4gICAgICAgIGVxdWFsczogZnVuY3Rpb24obGVmdCwgcmlnaHQpIHtcbiAgICAgICAgICB2YXIgcmVXaGl0ZXNwYWNlID0gL1xcUy87XG4gICAgICAgICAgcmV0dXJuIGxlZnQgPT09IHJpZ2h0IHx8ICh0aGlzLmlnbm9yZVdoaXRlc3BhY2UgJiYgIXJlV2hpdGVzcGFjZS50ZXN0KGxlZnQpICYmICFyZVdoaXRlc3BhY2UudGVzdChyaWdodCkpO1xuICAgICAgICB9LFxuICAgICAgICB0b2tlbml6ZTogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICByZXR1cm4gdmFsdWUuc3BsaXQoJycpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHZhciBDaGFyRGlmZiA9IG5ldyBEaWZmKCk7XG5cbiAgICB2YXIgV29yZERpZmYgPSBuZXcgRGlmZih0cnVlKTtcbiAgICB2YXIgV29yZFdpdGhTcGFjZURpZmYgPSBuZXcgRGlmZigpO1xuICAgIFdvcmREaWZmLnRva2VuaXplID0gV29yZFdpdGhTcGFjZURpZmYudG9rZW5pemUgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgcmV0dXJuIHJlbW92ZUVtcHR5KHZhbHVlLnNwbGl0KC8oXFxzK3xcXGIpLykpO1xuICAgIH07XG5cbiAgICB2YXIgQ3NzRGlmZiA9IG5ldyBEaWZmKHRydWUpO1xuICAgIENzc0RpZmYudG9rZW5pemUgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgcmV0dXJuIHJlbW92ZUVtcHR5KHZhbHVlLnNwbGl0KC8oW3t9OjssXXxcXHMrKS8pKTtcbiAgICB9O1xuXG4gICAgdmFyIExpbmVEaWZmID0gbmV3IERpZmYoKTtcbiAgICBMaW5lRGlmZi50b2tlbml6ZSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICB2YXIgcmV0TGluZXMgPSBbXSxcbiAgICAgICAgICBsaW5lcyA9IHZhbHVlLnNwbGl0KC9eL20pO1xuXG4gICAgICBmb3IodmFyIGkgPSAwOyBpIDwgbGluZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGxpbmUgPSBsaW5lc1tpXSxcbiAgICAgICAgICAgIGxhc3RMaW5lID0gbGluZXNbaSAtIDFdO1xuXG4gICAgICAgIC8vIE1lcmdlIGxpbmVzIHRoYXQgbWF5IGNvbnRhaW4gd2luZG93cyBuZXcgbGluZXNcbiAgICAgICAgaWYgKGxpbmUgPT09ICdcXG4nICYmIGxhc3RMaW5lICYmIGxhc3RMaW5lW2xhc3RMaW5lLmxlbmd0aCAtIDFdID09PSAnXFxyJykge1xuICAgICAgICAgIHJldExpbmVzW3JldExpbmVzLmxlbmd0aCAtIDFdICs9ICdcXG4nO1xuICAgICAgICB9IGVsc2UgaWYgKGxpbmUpIHtcbiAgICAgICAgICByZXRMaW5lcy5wdXNoKGxpbmUpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXRMaW5lcztcbiAgICB9O1xuXG4gICAgdmFyIFNlbnRlbmNlRGlmZiA9IG5ldyBEaWZmKCk7XG4gICAgU2VudGVuY2VEaWZmLnRva2VuaXplID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICByZXR1cm4gcmVtb3ZlRW1wdHkodmFsdWUuc3BsaXQoLyhcXFMuKz9bLiE/XSkoPz1cXHMrfCQpLykpO1xuICAgIH07XG5cbiAgICB2YXIgSnNvbkRpZmYgPSBuZXcgRGlmZigpO1xuICAgIC8vIERpc2NyaW1pbmF0ZSBiZXR3ZWVuIHR3byBsaW5lcyBvZiBwcmV0dHktcHJpbnRlZCwgc2VyaWFsaXplZCBKU09OIHdoZXJlIG9uZSBvZiB0aGVtIGhhcyBhXG4gICAgLy8gZGFuZ2xpbmcgY29tbWEgYW5kIHRoZSBvdGhlciBkb2Vzbid0LiBUdXJucyBvdXQgaW5jbHVkaW5nIHRoZSBkYW5nbGluZyBjb21tYSB5aWVsZHMgdGhlIG5pY2VzdCBvdXRwdXQ6XG4gICAgSnNvbkRpZmYudXNlTG9uZ2VzdFRva2VuID0gdHJ1ZTtcbiAgICBKc29uRGlmZi50b2tlbml6ZSA9IExpbmVEaWZmLnRva2VuaXplO1xuICAgIEpzb25EaWZmLmVxdWFscyA9IGZ1bmN0aW9uKGxlZnQsIHJpZ2h0KSB7XG4gICAgICByZXR1cm4gTGluZURpZmYuZXF1YWxzKGxlZnQucmVwbGFjZSgvLChbXFxyXFxuXSkvZywgJyQxJyksIHJpZ2h0LnJlcGxhY2UoLywoW1xcclxcbl0pL2csICckMScpKTtcbiAgICB9O1xuXG4gICAgdmFyIG9iamVjdFByb3RvdHlwZVRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuICAgIC8vIFRoaXMgZnVuY3Rpb24gaGFuZGxlcyB0aGUgcHJlc2VuY2Ugb2YgY2lyY3VsYXIgcmVmZXJlbmNlcyBieSBiYWlsaW5nIG91dCB3aGVuIGVuY291bnRlcmluZyBhblxuICAgIC8vIG9iamVjdCB0aGF0IGlzIGFscmVhZHkgb24gdGhlIFwic3RhY2tcIiBvZiBpdGVtcyBiZWluZyBwcm9jZXNzZWQuXG4gICAgZnVuY3Rpb24gY2Fub25pY2FsaXplKG9iaiwgc3RhY2ssIHJlcGxhY2VtZW50U3RhY2spIHtcbiAgICAgIHN0YWNrID0gc3RhY2sgfHwgW107XG4gICAgICByZXBsYWNlbWVudFN0YWNrID0gcmVwbGFjZW1lbnRTdGFjayB8fCBbXTtcblxuICAgICAgdmFyIGk7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwIDsgaSA8IHN0YWNrLmxlbmd0aCA7IGkgKz0gMSkge1xuICAgICAgICBpZiAoc3RhY2tbaV0gPT09IG9iaikge1xuICAgICAgICAgIHJldHVybiByZXBsYWNlbWVudFN0YWNrW2ldO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHZhciBjYW5vbmljYWxpemVkT2JqO1xuXG4gICAgICBpZiAoJ1tvYmplY3QgQXJyYXldJyA9PT0gb2JqZWN0UHJvdG90eXBlVG9TdHJpbmcuY2FsbChvYmopKSB7XG4gICAgICAgIHN0YWNrLnB1c2gob2JqKTtcbiAgICAgICAgY2Fub25pY2FsaXplZE9iaiA9IG5ldyBBcnJheShvYmoubGVuZ3RoKTtcbiAgICAgICAgcmVwbGFjZW1lbnRTdGFjay5wdXNoKGNhbm9uaWNhbGl6ZWRPYmopO1xuICAgICAgICBmb3IgKGkgPSAwIDsgaSA8IG9iai5sZW5ndGggOyBpICs9IDEpIHtcbiAgICAgICAgICBjYW5vbmljYWxpemVkT2JqW2ldID0gY2Fub25pY2FsaXplKG9ialtpXSwgc3RhY2ssIHJlcGxhY2VtZW50U3RhY2spO1xuICAgICAgICB9XG4gICAgICAgIHN0YWNrLnBvcCgpO1xuICAgICAgICByZXBsYWNlbWVudFN0YWNrLnBvcCgpO1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2Ygb2JqID09PSAnb2JqZWN0JyAmJiBvYmogIT09IG51bGwpIHtcbiAgICAgICAgc3RhY2sucHVzaChvYmopO1xuICAgICAgICBjYW5vbmljYWxpemVkT2JqID0ge307XG4gICAgICAgIHJlcGxhY2VtZW50U3RhY2sucHVzaChjYW5vbmljYWxpemVkT2JqKTtcbiAgICAgICAgdmFyIHNvcnRlZEtleXMgPSBbXTtcbiAgICAgICAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgICAgICAgIHNvcnRlZEtleXMucHVzaChrZXkpO1xuICAgICAgICB9XG4gICAgICAgIHNvcnRlZEtleXMuc29ydCgpO1xuICAgICAgICBmb3IgKGkgPSAwIDsgaSA8IHNvcnRlZEtleXMubGVuZ3RoIDsgaSArPSAxKSB7XG4gICAgICAgICAgdmFyIGtleSA9IHNvcnRlZEtleXNbaV07XG4gICAgICAgICAgY2Fub25pY2FsaXplZE9ialtrZXldID0gY2Fub25pY2FsaXplKG9ialtrZXldLCBzdGFjaywgcmVwbGFjZW1lbnRTdGFjayk7XG4gICAgICAgIH1cbiAgICAgICAgc3RhY2sucG9wKCk7XG4gICAgICAgIHJlcGxhY2VtZW50U3RhY2sucG9wKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjYW5vbmljYWxpemVkT2JqID0gb2JqO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNhbm9uaWNhbGl6ZWRPYmo7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIERpZmY6IERpZmYsXG5cbiAgICAgIGRpZmZDaGFyczogZnVuY3Rpb24ob2xkU3RyLCBuZXdTdHIsIGNhbGxiYWNrKSB7IHJldHVybiBDaGFyRGlmZi5kaWZmKG9sZFN0ciwgbmV3U3RyLCBjYWxsYmFjayk7IH0sXG4gICAgICBkaWZmV29yZHM6IGZ1bmN0aW9uKG9sZFN0ciwgbmV3U3RyLCBjYWxsYmFjaykgeyByZXR1cm4gV29yZERpZmYuZGlmZihvbGRTdHIsIG5ld1N0ciwgY2FsbGJhY2spOyB9LFxuICAgICAgZGlmZldvcmRzV2l0aFNwYWNlOiBmdW5jdGlvbihvbGRTdHIsIG5ld1N0ciwgY2FsbGJhY2spIHsgcmV0dXJuIFdvcmRXaXRoU3BhY2VEaWZmLmRpZmYob2xkU3RyLCBuZXdTdHIsIGNhbGxiYWNrKTsgfSxcbiAgICAgIGRpZmZMaW5lczogZnVuY3Rpb24ob2xkU3RyLCBuZXdTdHIsIGNhbGxiYWNrKSB7IHJldHVybiBMaW5lRGlmZi5kaWZmKG9sZFN0ciwgbmV3U3RyLCBjYWxsYmFjayk7IH0sXG4gICAgICBkaWZmU2VudGVuY2VzOiBmdW5jdGlvbihvbGRTdHIsIG5ld1N0ciwgY2FsbGJhY2spIHsgcmV0dXJuIFNlbnRlbmNlRGlmZi5kaWZmKG9sZFN0ciwgbmV3U3RyLCBjYWxsYmFjayk7IH0sXG5cbiAgICAgIGRpZmZDc3M6IGZ1bmN0aW9uKG9sZFN0ciwgbmV3U3RyLCBjYWxsYmFjaykgeyByZXR1cm4gQ3NzRGlmZi5kaWZmKG9sZFN0ciwgbmV3U3RyLCBjYWxsYmFjayk7IH0sXG4gICAgICBkaWZmSnNvbjogZnVuY3Rpb24ob2xkT2JqLCBuZXdPYmosIGNhbGxiYWNrKSB7XG4gICAgICAgIHJldHVybiBKc29uRGlmZi5kaWZmKFxuICAgICAgICAgIHR5cGVvZiBvbGRPYmogPT09ICdzdHJpbmcnID8gb2xkT2JqIDogSlNPTi5zdHJpbmdpZnkoY2Fub25pY2FsaXplKG9sZE9iaiksIHVuZGVmaW5lZCwgJyAgJyksXG4gICAgICAgICAgdHlwZW9mIG5ld09iaiA9PT0gJ3N0cmluZycgPyBuZXdPYmogOiBKU09OLnN0cmluZ2lmeShjYW5vbmljYWxpemUobmV3T2JqKSwgdW5kZWZpbmVkLCAnICAnKSxcbiAgICAgICAgICBjYWxsYmFja1xuICAgICAgICApO1xuICAgICAgfSxcblxuICAgICAgY3JlYXRlUGF0Y2g6IGZ1bmN0aW9uKGZpbGVOYW1lLCBvbGRTdHIsIG5ld1N0ciwgb2xkSGVhZGVyLCBuZXdIZWFkZXIpIHtcbiAgICAgICAgdmFyIHJldCA9IFtdO1xuXG4gICAgICAgIHJldC5wdXNoKCdJbmRleDogJyArIGZpbGVOYW1lKTtcbiAgICAgICAgcmV0LnB1c2goJz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0nKTtcbiAgICAgICAgcmV0LnB1c2goJy0tLSAnICsgZmlsZU5hbWUgKyAodHlwZW9mIG9sZEhlYWRlciA9PT0gJ3VuZGVmaW5lZCcgPyAnJyA6ICdcXHQnICsgb2xkSGVhZGVyKSk7XG4gICAgICAgIHJldC5wdXNoKCcrKysgJyArIGZpbGVOYW1lICsgKHR5cGVvZiBuZXdIZWFkZXIgPT09ICd1bmRlZmluZWQnID8gJycgOiAnXFx0JyArIG5ld0hlYWRlcikpO1xuXG4gICAgICAgIHZhciBkaWZmID0gTGluZURpZmYuZGlmZihvbGRTdHIsIG5ld1N0cik7XG4gICAgICAgIGlmICghZGlmZltkaWZmLmxlbmd0aC0xXS52YWx1ZSkge1xuICAgICAgICAgIGRpZmYucG9wKCk7ICAgLy8gUmVtb3ZlIHRyYWlsaW5nIG5ld2xpbmUgYWRkXG4gICAgICAgIH1cbiAgICAgICAgZGlmZi5wdXNoKHt2YWx1ZTogJycsIGxpbmVzOiBbXX0pOyAgIC8vIEFwcGVuZCBhbiBlbXB0eSB2YWx1ZSB0byBtYWtlIGNsZWFudXAgZWFzaWVyXG5cbiAgICAgICAgZnVuY3Rpb24gY29udGV4dExpbmVzKGxpbmVzKSB7XG4gICAgICAgICAgcmV0dXJuIG1hcChsaW5lcywgZnVuY3Rpb24oZW50cnkpIHsgcmV0dXJuICcgJyArIGVudHJ5OyB9KTtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiBlb2ZOTChjdXJSYW5nZSwgaSwgY3VycmVudCkge1xuICAgICAgICAgIHZhciBsYXN0ID0gZGlmZltkaWZmLmxlbmd0aC0yXSxcbiAgICAgICAgICAgICAgaXNMYXN0ID0gaSA9PT0gZGlmZi5sZW5ndGgtMixcbiAgICAgICAgICAgICAgaXNMYXN0T2ZUeXBlID0gaSA9PT0gZGlmZi5sZW5ndGgtMyAmJiAoY3VycmVudC5hZGRlZCAhPT0gbGFzdC5hZGRlZCB8fCBjdXJyZW50LnJlbW92ZWQgIT09IGxhc3QucmVtb3ZlZCk7XG5cbiAgICAgICAgICAvLyBGaWd1cmUgb3V0IGlmIHRoaXMgaXMgdGhlIGxhc3QgbGluZSBmb3IgdGhlIGdpdmVuIGZpbGUgYW5kIG1pc3NpbmcgTkxcbiAgICAgICAgICBpZiAoIS9cXG4kLy50ZXN0KGN1cnJlbnQudmFsdWUpICYmIChpc0xhc3QgfHwgaXNMYXN0T2ZUeXBlKSkge1xuICAgICAgICAgICAgY3VyUmFuZ2UucHVzaCgnXFxcXCBObyBuZXdsaW5lIGF0IGVuZCBvZiBmaWxlJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIG9sZFJhbmdlU3RhcnQgPSAwLCBuZXdSYW5nZVN0YXJ0ID0gMCwgY3VyUmFuZ2UgPSBbXSxcbiAgICAgICAgICAgIG9sZExpbmUgPSAxLCBuZXdMaW5lID0gMTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkaWZmLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgdmFyIGN1cnJlbnQgPSBkaWZmW2ldLFxuICAgICAgICAgICAgICBsaW5lcyA9IGN1cnJlbnQubGluZXMgfHwgY3VycmVudC52YWx1ZS5yZXBsYWNlKC9cXG4kLywgJycpLnNwbGl0KCdcXG4nKTtcbiAgICAgICAgICBjdXJyZW50LmxpbmVzID0gbGluZXM7XG5cbiAgICAgICAgICBpZiAoY3VycmVudC5hZGRlZCB8fCBjdXJyZW50LnJlbW92ZWQpIHtcbiAgICAgICAgICAgIGlmICghb2xkUmFuZ2VTdGFydCkge1xuICAgICAgICAgICAgICB2YXIgcHJldiA9IGRpZmZbaS0xXTtcbiAgICAgICAgICAgICAgb2xkUmFuZ2VTdGFydCA9IG9sZExpbmU7XG4gICAgICAgICAgICAgIG5ld1JhbmdlU3RhcnQgPSBuZXdMaW5lO1xuXG4gICAgICAgICAgICAgIGlmIChwcmV2KSB7XG4gICAgICAgICAgICAgICAgY3VyUmFuZ2UgPSBjb250ZXh0TGluZXMocHJldi5saW5lcy5zbGljZSgtNCkpO1xuICAgICAgICAgICAgICAgIG9sZFJhbmdlU3RhcnQgLT0gY3VyUmFuZ2UubGVuZ3RoO1xuICAgICAgICAgICAgICAgIG5ld1JhbmdlU3RhcnQgLT0gY3VyUmFuZ2UubGVuZ3RoO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjdXJSYW5nZS5wdXNoLmFwcGx5KGN1clJhbmdlLCBtYXAobGluZXMsIGZ1bmN0aW9uKGVudHJ5KSB7IHJldHVybiAoY3VycmVudC5hZGRlZD8nKyc6Jy0nKSArIGVudHJ5OyB9KSk7XG4gICAgICAgICAgICBlb2ZOTChjdXJSYW5nZSwgaSwgY3VycmVudCk7XG5cbiAgICAgICAgICAgIGlmIChjdXJyZW50LmFkZGVkKSB7XG4gICAgICAgICAgICAgIG5ld0xpbmUgKz0gbGluZXMubGVuZ3RoO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgb2xkTGluZSArPSBsaW5lcy5sZW5ndGg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChvbGRSYW5nZVN0YXJ0KSB7XG4gICAgICAgICAgICAgIC8vIENsb3NlIG91dCBhbnkgY2hhbmdlcyB0aGF0IGhhdmUgYmVlbiBvdXRwdXQgKG9yIGpvaW4gb3ZlcmxhcHBpbmcpXG4gICAgICAgICAgICAgIGlmIChsaW5lcy5sZW5ndGggPD0gOCAmJiBpIDwgZGlmZi5sZW5ndGgtMikge1xuICAgICAgICAgICAgICAgIC8vIE92ZXJsYXBwaW5nXG4gICAgICAgICAgICAgICAgY3VyUmFuZ2UucHVzaC5hcHBseShjdXJSYW5nZSwgY29udGV4dExpbmVzKGxpbmVzKSk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gZW5kIHRoZSByYW5nZSBhbmQgb3V0cHV0XG4gICAgICAgICAgICAgICAgdmFyIGNvbnRleHRTaXplID0gTWF0aC5taW4obGluZXMubGVuZ3RoLCA0KTtcbiAgICAgICAgICAgICAgICByZXQucHVzaChcbiAgICAgICAgICAgICAgICAgICAgJ0BAIC0nICsgb2xkUmFuZ2VTdGFydCArICcsJyArIChvbGRMaW5lLW9sZFJhbmdlU3RhcnQrY29udGV4dFNpemUpXG4gICAgICAgICAgICAgICAgICAgICsgJyArJyArIG5ld1JhbmdlU3RhcnQgKyAnLCcgKyAobmV3TGluZS1uZXdSYW5nZVN0YXJ0K2NvbnRleHRTaXplKVxuICAgICAgICAgICAgICAgICAgICArICcgQEAnKTtcbiAgICAgICAgICAgICAgICByZXQucHVzaC5hcHBseShyZXQsIGN1clJhbmdlKTtcbiAgICAgICAgICAgICAgICByZXQucHVzaC5hcHBseShyZXQsIGNvbnRleHRMaW5lcyhsaW5lcy5zbGljZSgwLCBjb250ZXh0U2l6ZSkpKTtcbiAgICAgICAgICAgICAgICBpZiAobGluZXMubGVuZ3RoIDw9IDQpIHtcbiAgICAgICAgICAgICAgICAgIGVvZk5MKHJldCwgaSwgY3VycmVudCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgb2xkUmFuZ2VTdGFydCA9IDA7ICBuZXdSYW5nZVN0YXJ0ID0gMDsgY3VyUmFuZ2UgPSBbXTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb2xkTGluZSArPSBsaW5lcy5sZW5ndGg7XG4gICAgICAgICAgICBuZXdMaW5lICs9IGxpbmVzLmxlbmd0aDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmV0LmpvaW4oJ1xcbicpICsgJ1xcbic7XG4gICAgICB9LFxuXG4gICAgICBhcHBseVBhdGNoOiBmdW5jdGlvbihvbGRTdHIsIHVuaURpZmYpIHtcbiAgICAgICAgdmFyIGRpZmZzdHIgPSB1bmlEaWZmLnNwbGl0KCdcXG4nKTtcbiAgICAgICAgdmFyIGRpZmYgPSBbXTtcbiAgICAgICAgdmFyIHJlbUVPRk5MID0gZmFsc2UsXG4gICAgICAgICAgICBhZGRFT0ZOTCA9IGZhbHNlO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAoZGlmZnN0clswXVswXT09PSdJJz80OjApOyBpIDwgZGlmZnN0ci5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGlmKGRpZmZzdHJbaV1bMF0gPT09ICdAJykge1xuICAgICAgICAgICAgdmFyIG1laCA9IGRpZmZzdHJbaV0uc3BsaXQoL0BAIC0oXFxkKyksKFxcZCspIFxcKyhcXGQrKSwoXFxkKykgQEAvKTtcbiAgICAgICAgICAgIGRpZmYudW5zaGlmdCh7XG4gICAgICAgICAgICAgIHN0YXJ0Om1laFszXSxcbiAgICAgICAgICAgICAgb2xkbGVuZ3RoOm1laFsyXSxcbiAgICAgICAgICAgICAgb2xkbGluZXM6W10sXG4gICAgICAgICAgICAgIG5ld2xlbmd0aDptZWhbNF0sXG4gICAgICAgICAgICAgIG5ld2xpbmVzOltdXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9IGVsc2UgaWYoZGlmZnN0cltpXVswXSA9PT0gJysnKSB7XG4gICAgICAgICAgICBkaWZmWzBdLm5ld2xpbmVzLnB1c2goZGlmZnN0cltpXS5zdWJzdHIoMSkpO1xuICAgICAgICAgIH0gZWxzZSBpZihkaWZmc3RyW2ldWzBdID09PSAnLScpIHtcbiAgICAgICAgICAgIGRpZmZbMF0ub2xkbGluZXMucHVzaChkaWZmc3RyW2ldLnN1YnN0cigxKSk7XG4gICAgICAgICAgfSBlbHNlIGlmKGRpZmZzdHJbaV1bMF0gPT09ICcgJykge1xuICAgICAgICAgICAgZGlmZlswXS5uZXdsaW5lcy5wdXNoKGRpZmZzdHJbaV0uc3Vic3RyKDEpKTtcbiAgICAgICAgICAgIGRpZmZbMF0ub2xkbGluZXMucHVzaChkaWZmc3RyW2ldLnN1YnN0cigxKSk7XG4gICAgICAgICAgfSBlbHNlIGlmKGRpZmZzdHJbaV1bMF0gPT09ICdcXFxcJykge1xuICAgICAgICAgICAgaWYgKGRpZmZzdHJbaS0xXVswXSA9PT0gJysnKSB7XG4gICAgICAgICAgICAgIHJlbUVPRk5MID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZihkaWZmc3RyW2ktMV1bMF0gPT09ICctJykge1xuICAgICAgICAgICAgICBhZGRFT0ZOTCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHN0ciA9IG9sZFN0ci5zcGxpdCgnXFxuJyk7XG4gICAgICAgIGZvciAodmFyIGkgPSBkaWZmLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgdmFyIGQgPSBkaWZmW2ldO1xuICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgZC5vbGRsZW5ndGg7IGorKykge1xuICAgICAgICAgICAgaWYoc3RyW2Quc3RhcnQtMStqXSAhPT0gZC5vbGRsaW5lc1tqXSkge1xuICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIEFycmF5LnByb3RvdHlwZS5zcGxpY2UuYXBwbHkoc3RyLFtkLnN0YXJ0LTEsK2Qub2xkbGVuZ3RoXS5jb25jYXQoZC5uZXdsaW5lcykpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHJlbUVPRk5MKSB7XG4gICAgICAgICAgd2hpbGUgKCFzdHJbc3RyLmxlbmd0aC0xXSkge1xuICAgICAgICAgICAgc3RyLnBvcCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChhZGRFT0ZOTCkge1xuICAgICAgICAgIHN0ci5wdXNoKCcnKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3RyLmpvaW4oJ1xcbicpO1xuICAgICAgfSxcblxuICAgICAgY29udmVydENoYW5nZXNUb1hNTDogZnVuY3Rpb24oY2hhbmdlcyl7XG4gICAgICAgIHZhciByZXQgPSBbXTtcbiAgICAgICAgZm9yICggdmFyIGkgPSAwOyBpIDwgY2hhbmdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHZhciBjaGFuZ2UgPSBjaGFuZ2VzW2ldO1xuICAgICAgICAgIGlmIChjaGFuZ2UuYWRkZWQpIHtcbiAgICAgICAgICAgIHJldC5wdXNoKCc8aW5zPicpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoY2hhbmdlLnJlbW92ZWQpIHtcbiAgICAgICAgICAgIHJldC5wdXNoKCc8ZGVsPicpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldC5wdXNoKGVzY2FwZUhUTUwoY2hhbmdlLnZhbHVlKSk7XG5cbiAgICAgICAgICBpZiAoY2hhbmdlLmFkZGVkKSB7XG4gICAgICAgICAgICByZXQucHVzaCgnPC9pbnM+Jyk7XG4gICAgICAgICAgfSBlbHNlIGlmIChjaGFuZ2UucmVtb3ZlZCkge1xuICAgICAgICAgICAgcmV0LnB1c2goJzwvZGVsPicpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmV0LmpvaW4oJycpO1xuICAgICAgfSxcblxuICAgICAgLy8gU2VlOiBodHRwOi8vY29kZS5nb29nbGUuY29tL3AvZ29vZ2xlLWRpZmYtbWF0Y2gtcGF0Y2gvd2lraS9BUElcbiAgICAgIGNvbnZlcnRDaGFuZ2VzVG9ETVA6IGZ1bmN0aW9uKGNoYW5nZXMpe1xuICAgICAgICB2YXIgcmV0ID0gW10sIGNoYW5nZTtcbiAgICAgICAgZm9yICggdmFyIGkgPSAwOyBpIDwgY2hhbmdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGNoYW5nZSA9IGNoYW5nZXNbaV07XG4gICAgICAgICAgcmV0LnB1c2goWyhjaGFuZ2UuYWRkZWQgPyAxIDogY2hhbmdlLnJlbW92ZWQgPyAtMSA6IDApLCBjaGFuZ2UudmFsdWVdKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmV0O1xuICAgICAgfSxcblxuICAgICAgY2Fub25pY2FsaXplOiBjYW5vbmljYWxpemVcbiAgICB9O1xuICB9KSgpO1xuXG4gIC8qaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBtb2R1bGUuZXhwb3J0cyA9IEpzRGlmZjtcbiAgfVxuICBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nKSB7XG4gICAgLypnbG9iYWwgZGVmaW5lICovXG4gICAgZGVmaW5lKFtdLCBmdW5jdGlvbigpIHsgcmV0dXJuIEpzRGlmZjsgfSk7XG4gIH1cbiAgZWxzZSBpZiAodHlwZW9mIGdsb2JhbC5Kc0RpZmYgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgZ2xvYmFsLkpzRGlmZiA9IEpzRGlmZjtcbiAgfVxufSkodGhpcyk7XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL34vZGlmZi9kaWZmLmpzXG4gKiovIl0sInNvdXJjZVJvb3QiOiIiLCJmaWxlIjoiLi9kaXN0L3JlYWN0LWRpZmYuanMifQ==