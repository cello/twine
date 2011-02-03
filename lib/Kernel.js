/**
 * @license Copyright (c) 2011 Cello Software, LLC.
 * All rights reserved.
 * Available via the new BSD License.
 */
/*jslint maxlen: 100, nomen: false, newcap: true, onevar: true, white: true, plusplus: false */
/*global define: false */

define(['compose', 'events', './util/error', 'array', './kernel/ModelBuilder'],
function (Compose, events, error, array, ModelBuilder) {
	// the Kernel Class
	return Compose(
		// use compose to mixin options passed to the constructor
		Compose,
		// Kernel is an event emitter
		events.Evented,
		function Kernel() {
			// this is a registry of kernel extensions
			this._fibers = {};

			// this is a registry of component models.  this is the hub of the kernel.
			this._models = {};

			if (!this.modelBuilder) {
				this.modelBuilder = ModelBuilder(this);
			}
		},
		{
			// adds another fiber to the twine
			addFiber: function (fiber) {
				if (!fiber.id) {
					throw error.FiberNeedsID(fiber);
				}

				var fibers = this._fibers,
					id = fiber.id;

				if (fibers[id]) {
					throw error.FiberAlreadyExists(id);
				}

				fibers[id] = fiber;
				fiber.init(this);
				this.emit('fiberAdded', fiber);
			},

			// use a registration to register a component
			// the registration should end up calling addComponentModel
			register: function (registration) {
				registration.register(this);
			},

			// this is the way to add components to the kernel
			addComponentModel: function (model) {
				var kernel = this;
				// process the model
				return this.modelBuilder.process(model).then(function (model) {
					kernel._models[model.id] = model;
					kernel.emit('modelAdded', model);
					return model;
				});
			},

			// XXX: this is hardwired just to play with the demo
			resolve: function (spec) {
				console.log('request to resolve: ', spec);
				var component = {
					on: function (event, cb) {
						setTimeout(cb, 2500);
					}
				};

				this.emit('componentResolved', component);
				return component;
			},

			// release an instance
			release: function (instance) {
				this.emit('componentReleased', instance);
			},

			// destroy the kernel
			destroy: function () {
				this._releaseComponents();
				this._terminateFibers();
			},

			// release all components
			_releaseComponents: function () {
				var models = this._models;

				array.forEach(Object.keys(models), function (key) {
					array.forEach(models[key].instances || [], function (instance) {
						this.release(instance);
					}, this);
				}, this);
			},

			// terminate all extensions
			_terminateFibers: function () {
				var fibers = this._fibers;

				array.forEach(Object.keys(fibers), function (key) {
					fibers[key].terminate();
				});
			}
		}
	);
});
