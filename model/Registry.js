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
	'../support/array',
	'../support/compose',
	'../support/on',
	'../util/error',
	'../support/lang'
], function (arr, compose, on, error, lang) {
	'use strict';
	return compose(
		on.Evented,
		function Registry() {
			// this is a map of id -> model
			this._models = {};

			// this is a map of model.service -> model.name -> model
			this._services = {};

			// for each instance in _instances, it's model is at the same index in _instanceModels
			// this allows mapping from the instance to the model using indexOf
			this._instances = [];
			this._instanceModels = [];

			this._listeners = [];
		}, {
			addModel: function (model) {
				var services = this._services,
					models = this._models,
					instances = this._instances,
					instanceModels = this._instanceModels,
					listeners = this._listeners,
					id = model.id,
					service = model.service || '',
					name = model.name || '';

				// check for an id
				if (!id) {
					throw new error.MissingId(model);
				}

				// check if a model already exists for this id
				if (id in models) {
					throw new error.DuplicateModel(model);
				}

				// check if a service was specified
				if (service) {
					// if the service already exists and it has no name or the name already exists
					if (service in services && (!name || (name && name in services[service]))) {
						// attempting to add a duplicate service
						throw new error.DuplicateServiceModel(model);
					}
					// add the service
					services[service] = services[service] || {};
					services[service][name] = model;
				}

				// everything checked out ok - add the model
				models[id] = model;

				// track the instances of each model
				listeners.push(model.on('componentConstructed', function (instance) {
					instances.push(instance);
					instanceModels.push(model);
				}));

				listeners.push(model.on('componentDeconstructed', function (instance) {
					var instanceIndex = arr.indexOf(instances, instance);
					if (~instanceIndex) {
						instances.splice(instanceIndex, 1);
						instanceModels.splice(instanceIndex, 1);
					}
				}));

				// let everybody know that there's a new model
				this.emit('modelAdded', model);

				return model;
			},

			getModel: function (spec) {
				// assume that a string is a request for an id
				if (typeof spec === 'string') {
					spec = {
						id: spec
					};
				}

				var id = spec.id,
					service = spec.service || '',
					name = spec.name || '',
					instance = spec.instance,
					services = this._services,
					index;

				// if an instance is specified, it wins
				if (instance) {
					index = arr.indexOf(this._instances, instance);
					if (~index) {
						return this._instanceModels[index];
					}
					// if an instance was specified, nothing else is considered
					return;
				}

				// if an id is specified, it gets the next chance
				if (id) {
					return this._models[id];
				}

				// lastly, we'll try to get the model based on the service
				if (service) {
					return services[service] && services[service][name];
				}
			},

			destroy: function () {
				var models = this._models;

				// destroy all the models
				arr.forEach(lang.keys(models), function (key) {
					models[key].destroy();
				});

				// stop all the listeners
				arr.forEach(this._listeners, function (listener) {
					listener.remove();
				});
			}
		}
	);
});
