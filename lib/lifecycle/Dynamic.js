/**
 * @license Copyright (c) 2011 Cello Software, LLC.
 * All rights reserved.
 * Available via the new BSD License.
 */
/*jslint maxlen: 100, nomen: false, newcap: true, onevar: true, white: true, plusplus: false */
/*global define: false */

define(['compose', 'promise', 'array'], function (Compose, Promise, array) {
	return Compose(function Dynamic(model) {
		this.model = model;
		this._instances = [];
	}, {
		resolve: function (args) {
			var instances = this._instances;

			// always construct a new instance
			return Promise.when(this.model.construct(args), function (instance) {
				instances.push(instance);
				return instance;
			});
		},

		release: function (instance) {
			var instances = this._instances,
				index = array.indexOf(instances);

			if (~index) {
				instances.splice(index, 1);
				model.deconstruct(instance);
			}
		},
		destroy: function () {
			array.forEach(this._instances, function (instance) {
				this.release(instance);
			}, this);
		}
	});
});
