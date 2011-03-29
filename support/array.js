/**
 * @license Copyright (c) 2011 Cello Software, LLC.
 * All rights reserved.
 * Available via the new BSD License.
 */
/*jshint
	bitwise: false, curly: true, eqeqeq: true, forin: true, immed: true, indent: 4, maxlen: 100,
	newcap: true, noarg: true, noempty: true, onevar: true, passfail: false, strict: true,
	undef: true, white: true
*/
/*global define: false, require: false */

define(function () {
	'use strict';
	var ret = {},
		slice = Array.prototype.slice;

	function toArray(it) {
		return slice.call(it);
	}

	// this is not complete and assumes es5.  add more as needed and complete the implementation.
	['forEach', 'filter', 'map', 'indexOf'].forEach(function (method) {
		ret[method] = function (arr) {
			var args = slice.call(arguments, 1);
			return arr[method].apply(arr, args);
		};
	});

	ret.toArray = toArray;

	return ret;
});