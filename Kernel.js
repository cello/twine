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
	'./support/array',
	'./support/compose',
	'./util/error',
	'./support/lang',
	'./model/Builder',
	'./model/Registry',
	'./support/promise'
], function (arr, compose, error, lang, ModelBuilder, ModelRegistry, promise) {
	'use strict';
	// the Kernel Class
	return compose(
		// use compose to mixin options passed to the constructor
		compose,
		function Kernel() {
			// this is a registry of kernel extensions
			this._fibers = {};

			if (!this.modelRegistry) {
				this.modelRegistry = new ModelRegistry(this);
			}

			if (!this.modelBuilder) {
				this.modelBuilder = new ModelBuilder(this);
			}
		},
		{
			// adds another fiber to the twine
			addFiber: function (fiber) {
				if (!fiber.id) {
					throw new error.MissingId(fiber);
				}

				var fibers = this._fibers,
					id = fiber.id;

				if (fibers[id]) {
					throw new error.DuplicateFiber(fiber);
				}

				fibers[id] = fiber;
				return fiber.init(this);
			},

			// this is the way to add components to the kernel
			addComponentModel: function (config) {
				var kernel = this;
				return promise.when(kernel.modelBuilder.process(config), function (model) {
					return kernel.modelRegistry.addModel(model);
				});
			},

			resolve: function (spec, args) {
				var model = this.modelRegistry.getModel(spec);

				return model.resolve(args);
			},

			// release an instance
			release: function (instance) {
				var model = this.modelRegistry.getModel({
					instance: instance
				});

				return model.release(instance);
			},

			// destroy the kernel
			destroy: function () {
				this._terminateFibers();
				this.modelBuilder.destroy();
				this.modelRegistry.destroy();
			},

			// terminate all extensions
			_terminateFibers: function () {
				var fibers = this._fibers;

				arr.forEach(lang.keys(fibers), function (key) {
					var fiber = fibers[key];
					if (fiber.terminate) {
						fiber.terminate();
					}
				});
			}
		}
	);
});
