/**
 * @license Copyright (c) 2011 Cello Software, LLC.
 * All rights reserved.
 * Available via the new BSD License.
 */
/*jshint
	asi: false, bitwise: false, boss: false, curly: true, eqeqeq: true, eqnull: false, es5: true,
	evil: false, expr: true, forin: true, globalstrict: false, immed: true, indent: 4, latedef: true,
	laxbreak: false, loopfunc: true, maxlen: 100, newcap: true, noarg: true, noempty: true,
	nonew: true, nomen: false, onevar: true, passfail: false, plusplus: false, shadow: false,
	strict: false, sub: false, trailing: true, undef: true, white: true
*/
/*global define: false, require: false*/

define([
	'../support/compose'
], function (compose) {
	'use strict';
	// provides a way to lazy load modules that intercept specific events
	return compose(function InterceptorProxy(model) {
		this.model = model;
	}, {
		intercept: function () {
			var args = arguments,
				model = this.model;

			return model.resolve().then(function (component) {
				var ret;

				if (component && typeof component.intercept === 'function') {
					ret = component.intercept.apply(component, args);
				}
				model.release(component);

				return ret;
			});
		}
	});
});
