/**
 * @license Copyright (c) 2011 Cello Software, LLC.
 * All rights reserved.
 * Available via the new BSD License.
 */
/*jslint maxlen: 100, nomen: false, newcap: true, onevar: true, white: true, plusplus: false */
/*global define: false */

define(function () {
	var ret = {},
		slice = Array.prototype.slice;

	function toArray(it) {
		return slice.call(it);
	}

	// this is not complete and assumes es5.  add more as needed and complete the implementation.
	['forEach', 'filter', 'map'].forEach(function (method) {
		ret[method] = function (arr) {
			var args = slice.call(arguments, 1);
			return arr[method].apply(arr, args);
		};
	});

	ret.toArray = toArray;

	return ret;
});