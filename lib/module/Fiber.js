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
	'array',
	'twine/model/Model',
	'lang'
], function (compose, array, Model, lang) {
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
			var managerModel,
				processed = false,
				kernel = this.kernel;

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
								model = next(model);
								model = kernel.modelRegistry.addModel(model);
								processed = true;
							}
							return model.resolve(args);
						}
					}
				};
				return kernel.modelBuilder.process(managerModel);
			}
			else {
				return next(model);
			}
		},

		terminate: function () {
			// stop all the listeners
			array.forEach(this._listeners, function (listener) {
				listener.cancel();
			});
		}
	});
});
