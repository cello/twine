/**
 * @license Copyright (c) 2011 Cello Software, LLC.
 * All rights reserved.
 * Available via the new BSD License.
 */
/*jslint maxlen: 100, nomen: false, newcap: true, onevar: true, white: true, plusplus: false */
/*global define: false */

define([
	'compose',
	'./util/error',
	'array',
	'lang',
	'./model/Builder',
	'./model/Registry',
	'promise'
], function (Compose, error, array, lang, ModelBuilder, ModelRegistry, Promise) {
	// the Kernel Class
	return Compose(
		// use compose to mixin options passed to the constructor
		Compose,
		function Kernel() {
			// this is a registry of kernel extensions
			this._fibers = {};

			if (!this.modelRegistry) {
				this.modelRegistry = ModelRegistry(this);
			}

			if (!this.modelBuilder) {
				this.modelBuilder = ModelBuilder(this);
			}
		},
		{
			// adds another fiber to the twine
			addFiber: function (fiber) {
				if (!fiber.id) {
					throw error.MissingId(fiber);
				}

				var fibers = this._fibers,
					id = fiber.id;

				if (fibers[id]) {
					throw error.DuplicateFiber(fiber);
				}

				fibers[id] = fiber;
				return fiber.init(this);;
			},

			// use a registration to register a component
			// the registration should end up calling addComponentModel
			register: function (registration) {
				registration.register(this);
			},

			// this is the way to add components to the kernel
			addComponentModel: function (config) {
				var model = this.modelBuilder.process(config);

				return this.modelRegistry.addModel(model);
			},

			resolve: function (spec, args) {
				console.log('request to resolve: ', spec, args);
				var model = this.modelRegistry.getModel(spec);

				return Promise.when(model.resolve(args));
			},

			// release an instance
			release: function (instance) {
				console.log('request to release: ', instance);
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

				array.forEach(lang.keys(fibers), function (key) {
					fibers[key].terminate();
				});
			}
		}
	);
});
