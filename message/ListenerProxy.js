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
