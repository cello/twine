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
	'dojo/_base/array',
	'compose',
	'../model/Model',
	'lang',
	'promise'
], function (d, compose, Model, lang, promise) {
	'use strict';
	return compose(function ModuleFiber() {
		this._listeners = [];
	}, {
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
						}
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
			d.forEach(this._listeners, function (listener) {
				listener.remove();
			});
		}
	});
});
