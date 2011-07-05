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
	'compose',
	'lang',
	'promise'
], function (compose, lang, promise) {
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

				if (component && lang.isFunction(component.execute)) {
					ret = component.execute.apply(component, args);
				}

				if (!lang.isFunction(component.error) && !lang.isFunction(component.results)) {
					model.release(component);
				}

				return ret;
			});
		},
		results: function (data) {
			var component = this.component,
				ret = data;

			if (component && lang.isFunction(component.results)) {
				ret = component.results.apply(component, arguments);
				this.model.release(component);
			}

			this.component = null;
			return ret;
		},
		error: function (error) {
			var component = this.component,
				ret = error;

			if (component && lang.isFunction(component.error)) {
				ret = component.error.apply(component, arguments);
				this.model.release(component);
			}

			this.component = null;
			return ret;
		}
	});
});
