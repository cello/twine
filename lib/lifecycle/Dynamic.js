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

define(['compose', 'promise', 'array'], function (compose, promise, array) {
	'use strict';
	return compose(function Dynamic(model) {
		this.model = model;
		this._instances = [];
	}, {
		resolve: function (args) {
			var instances = this._instances;

			// always construct a new instance
			return promise.when(this.model.construct(args), function (instance) {
				instances.push(instance);
				return instance;
			});
		},

		release: function (instance) {
			var instances = this._instances,
				index = array.indexOf(instances);

			if (~index) {
				instances.splice(index, 1);
				this.model.deconstruct(instance);
			}
		},
		destroy: function () {
			array.forEach(this._instances, function (instance) {
				this.release(instance);
			}, this);
		}
	});
});
