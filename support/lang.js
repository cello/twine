/**
 * @license Copyright (c) 2011 Cello Software, LLC.
 * All rights reserved.
 * Available via the new BSD License.
 */
/*jslint maxlen: 100, nomen: false, newcap: true, onevar: true, white: true, plusplus: false */
/*global define: false */

define(function () {
	// cache the lookup of toString
	var toString = Object.prototype.toString;

	return {
		isString: function (it) {
			return (typeof it === 'string' || it instanceof String);
		},
		isFunction: function (it) {
			return toString.call(x) === "[object Function]";
		}
	};
});