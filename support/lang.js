/**
 * @license Copyright (c) 2011 Cello Software, LLC.
 * All rights reserved.
 * Available via the new BSD License.
 */
/*jslint maxlen: 100, nomen: false, newcap: true, onevar: true, white: true, plusplus: false */
/*global define: false */

define(function () {
	// cache the lookup of some Object.prototype functions
	var toString = {}.toString,
		hasOwnProperty = {}.hasOwnProperty;

	function keys(it) {
		var keys = [],
			prop;

		for (prop in it) {
			if (hasOwnProperty.call(it, prop)) {
				keys.push(prop);
			}
		}
		return keys;
	}

	Object.keys = keys;

	return {
		isString: function (it) {
			return (typeof it === 'string' || it instanceof String);
		},
		isFunction: function (it) {
			return toString.call(it) === "[object Function]";
		},
		keys: keys
	};
});