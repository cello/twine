/**
 * @license Copyright (c) 2011 Cello Software, LLC.
 * All rights reserved.
 * Available via the new BSD License.
 */
/*jslint maxlen: 100, nomen: false, newcap: true, onevar: true, white: true, plusplus: false */
/*global define: false */

define(['compose'], function (Compose) {
	return {
		DuplicateFiber: Compose(Error, function (fiber) {
			this.message = 'Fiber with id "' + fiber.id + '" was already added.';
			this.fiber = fiber;
		}),

		MissingId: Compose(Error, function (it) {
			this.target = it;
			this.message = 'ID is missing.';
		}),

		ContainerDestroyed: Compose(Error, function (container) {
			this.message = 'Container "' + container.name + ' has been destroyed.';
		}),

		DuplicateModel: Compose(Error, function (model) {
			this.message = 'Model with id "' + model.id + '" already exists.';
			this.model = model;
		}),

		DuplicateServiceModel: Compose(Error, function (model) {
			this.message = 'Model for service "' + model.service + '" with name "' + model.name +
				'" already exists.';
			this.model = model;
		})
	};
});
