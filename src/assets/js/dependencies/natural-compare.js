/**
 * Natural Compare
 * https://github.com/woollybogger/string-natural-compare
 *
 * @version 1.1.1
 * @copyright 2015 Nathan Woltman
 * @license MIT https://github.com/woollybogger/string-natural-compare/blob/master/LICENSE.txt
 */

(function() {
  'use strict';

  var alphabet;
  var alphabetIndexMap;
  var alphabetIndexMapLength = 0;

  function isNumberCode(code) {
    return code >= 48 && code <= 57;
  }

  function naturalCompare(a, b) {
    var lengthA = (a += '').length;
    var lengthB = (b += '').length;
    var aIndex = 0;
    var bIndex = 0;
    var alphabetIndexA;
    var alphabetIndexB;

    while (aIndex < lengthA && bIndex < lengthB) {
      var charCodeA = a.charCodeAt(aIndex);
      var charCodeB = b.charCodeAt(bIndex);

      if (isNumberCode(charCodeA)) {
        if (!isNumberCode(charCodeB)) {
          return charCodeA - charCodeB;
        }

        var numStartA = aIndex;
        var numStartB = bIndex;

        while (charCodeA === 48 && ++numStartA < lengthA) {
          charCodeA = a.charCodeAt(numStartA);
        }
        while (charCodeB === 48 && ++numStartB < lengthB) {
          charCodeB = b.charCodeAt(numStartB);
        }

        var numEndA = numStartA;
        var numEndB = numStartB;

        while (numEndA < lengthA && isNumberCode(a.charCodeAt(numEndA))) {
          ++numEndA;
        }
        while (numEndB < lengthB && isNumberCode(b.charCodeAt(numEndB))) {
          ++numEndB;
        }

        var numLengthA = numEndA - numStartA;
        var numLengthB = numEndB - numStartB;

        if (numLengthA < numLengthB) {
          return -1;
        }
        if (numLengthA > numLengthB) {
          return 1;
        }

        if (numLengthA) {
          var numA = a.slice(numStartA, numEndA);
          var numB = b.slice(numStartB, numEndB);

          if (numA < numB) {
            return -1;
          }
          if (numA > numB) {
            return 1;
          }
        }

        aIndex = numEndA;
        bIndex = numEndB;
        continue;
      }

      if (charCodeA !== charCodeB) {
        if (
          alphabetIndexMapLength &&
          charCodeA < alphabetIndexMapLength &&
          charCodeB < alphabetIndexMapLength &&
          (alphabetIndexA = alphabetIndexMap[charCodeA]) !== -1 &&
          (alphabetIndexB = alphabetIndexMap[charCodeB]) !== -1
        ) {
          return alphabetIndexA - alphabetIndexB;
        }

        return charCodeA - charCodeB;
      }

      ++aIndex;
      ++bIndex;
    }

    return lengthA - lengthB;
  }

  Object.defineProperties(String, {
    alphabet: {
      get: function() {
        return alphabet;
      },
      set: function(value) {
        alphabet = value;
        alphabetIndexMap = [];
        var i = 0;
        if (alphabet) {
          for (; i < alphabet.length; i++) {
            alphabetIndexMap[alphabet.charCodeAt(i)] = i;
          }
        }
        alphabetIndexMapLength = alphabetIndexMap.length;
        for (i = 0; i < alphabetIndexMapLength; i++) {
          if (i in alphabetIndexMap) continue;
          alphabetIndexMap[i] = -1;
        }
      },
    },
    naturalCompare: {
      value: naturalCompare,
      configurable: true,
      writable: true,
    },
    naturalCaseCompare: {
      value: function(a, b) {
        return naturalCompare(('' + a).toLowerCase(), ('' + b).toLowerCase());
      },
      configurable: true,
      writable: true,
    },
  });

})();
