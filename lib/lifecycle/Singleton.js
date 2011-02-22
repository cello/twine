/**
 * @license Copyright (c) 2011 Cello Software, LLC.
 * All rights reserved.
 * Available via the new BSD License.
 */
/*jshint
    bitwise: false, curly: true, eqeqeq: true, forin: true, immed: true, indent: 4, maxlen: 100,
    newcap: true, noarg: true, noempty: true, onevar: true, passfail: false, undef: true,
    white: true
*/
/*global define: false, require: false */

define(['compose', 'promise'], function (compose, promise) {
	return compose(function Singleton(model) {
		this.model = model;
	}, {
		_released: true,

		resolve: function (args) {
			var lifestyle = this;

			// reuse a single instance
			return this._instance || promise.when(this.model.construct(args), function (instance) {
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
