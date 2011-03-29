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
	// cache the lookup of some Object.prototype functions
	var toString = {}.toString,
		hasOwn = {}.hasOwnProperty;

	function isString(it) {
		return (typeof it === 'string' || it instanceof String);
	}

	function isFunction(it) {
		return toString.call(it) === "[object Function]";
	}

	function keys(it) {
		var out = [],
			prop;

		for (prop in it) {
			if (hasOwn.call(it, prop)) {
				out.push(prop);
			}
		}
		return out;
	}
	Object.keys = keys;

	function noop() {}

	function hitch(context, func) {
		if (isString(func)) {
			func = context[func];
		}
		if (func && isFunction(func)) {
			return function () {
				return func.apply(context, arguments);
			};
		}
		else {
			return noop;
		}
	}

return {
		isString: isString,
		isFunction: isFunction,
		keys: keys,
		hitch: hitch
	};
});