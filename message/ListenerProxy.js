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
	'../support/compose',
	'../support/promise'
], function (compose, promise) {
	'use strict';
	// provides a way to lazy load modules that listen to certain events
	return compose(function ListenerProxy(model) {
		this.model = model;
	}, {
		execute: function () {
			var args = arguments,
				model = this.model,
				proxy = this;

			return model.resolve().then(function (component) {
				proxy.component = component;
				var ret;

				if (component && typeof component.execute === 'function') {
					ret = component.execute.apply(component, args);
				}

				if (typeof component.error !== 'function' &&
						typeof component.results !== 'function') {
					model.release(component);
				}

				return ret;
			});
		},
		results: function (data) {
			var component = this.component,
				ret = data;

			if (component && typeof component.results === 'function') {
				ret = component.results.apply(component, arguments);
				this.model.release(component);
			}

			this.component = null;
			return ret;
		},
		error: function (error) {
			var component = this.component,
				ret = error;

			if (component && typeof component.error === 'function') {
				ret = component.error.apply(component, arguments);
				this.model.release(component);
			}

			this.component = null;
			return ret;
		}
	});
});
