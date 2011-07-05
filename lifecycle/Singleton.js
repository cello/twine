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
	return compose(function Singleton(model) {
		this.model = model;
	}, {
		_released: true,

		resolve: function (args) {
			var lStyle = this,
				inst = lStyle._instance = lStyle._instance || lStyle.model.construct(args);

			lStyle._released = false;

			// reuse a single instance
			return promise.when(inst, function (instance) {
				lStyle._instance = instance;
				return instance;
			});
		},

		release: function (instance) {
			// do nothing
			this._released = true;
		},

		destroy: function () {
			var model = this.model,
				instance = this._instance;

			if (!this._released) {
				model.release(instance);
			}
			model.deconstruct(instance);
		}
	});
});
