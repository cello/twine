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
	'../support/array',
	'../support/compose',
	'../model/Model',
	'../support/promise'
], function (arr, compose, Model, promise) {
	'use strict';

	// XXX: in practice i've been using factories for lazy loading.  maybe remove this feature.
	function ModuleFiber() {
		this._listeners = [];
	}

	return compose(ModuleFiber, {
		id: 'Module Fiber',

		init: function (kernel) {
			this.kernel = kernel;
			kernel.modelBuilder.addProcessor(this);
		},

		process: function (model, next) {
			var kernel = this.kernel;
			return promise.when(model, function (model) {
				var managerModel,
					processed = false;

				if (model.moduleLoader) {
					managerModel = {
						// take the same id as the model
						id: model.id,
						// use the moduleLoader specified in the model
						module: model.moduleLoader,
						// no dependencies
						deps: null,
						// TODO: intercept events handled by the module
						//intercept: model.listen,
						// mixin a way for the loader to load the module
						mixin: {
							loadModule: function (args) {
								if (!processed) {
									model.id = 'managed:' + model.id;
									// continue processing the original model
									model = next(model);
									processed = true;
									return promise.when(model, function (model) {
										kernel.modelRegistry.addModel(model);
										return model.resolve(args);
									});
								}
								return promise.when(model, function (model) {
									return model.resolve(args);
								});
							}
						},
						load: model.load
					};
					return kernel.modelBuilder.process(managerModel);
				}
				else {
					return next(model);
				}
			});
		},

		terminate: function () {
			// stop all the listeners
			arr.forEach(this._listeners, function (listener) {
				listener.remove();
			});
		}
	});
});
