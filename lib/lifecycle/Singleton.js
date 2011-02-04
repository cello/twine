/**
 * @license Copyright (c) 2011 Cello Software, LLC.
 * All rights reserved.
 * Available via the new BSD License.
 */
/*jslint maxlen: 100, nomen: false, newcap: true, onevar: true, white: true, plusplus: false */
/*global define: false */

define(['compose', 'promise'], function (Compose, Promise) {
	return Compose(function Singleton(model) {
		this.model = model;
	}, {
		_released: true,

		resolve: function (args) {
			var lifestyle = this;

			// reuse a single instance
			return this._instance || Promise.when(this.model.construct(args), function (instance) {
				lifestyle._instance = instance;
				lifestyle._released = false;
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
