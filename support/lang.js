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

define(['dojo/_base/lang'], function (d) {
	'use strict';
	// cache the lookup of some Object.prototype functions
	var hasOwn = {}.hasOwnProperty;

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

	return {
		isString: d.isString,
		isFunction: d.isFunction,
		keys: keys,
		hitch: d.hitch
	};
});