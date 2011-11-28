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

	function Singleton(model) {
		this.model = model;
	}

	return compose(Singleton, {
		_released: true,

		resolve: function (args) {
			var lStyle = this,
				inst = lStyle._instance = lStyle._instance || lStyle.model.construct(args),
				model = this.model,
				wasReleased = lStyle._released;

			lStyle._released = false;

			// reuse a single instance
			return promise.when(inst, function (instance) {
				lStyle._instance = instance;
				// only commission instances that were released
				if (wasReleased) {
					return model.commission(instance);
				}
				return instance;
			});
		},

		release: function (instance) {
			// do nothing
			this.model.decommission(instance);
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
