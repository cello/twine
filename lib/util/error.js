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

define(['compose'], function (compose) {
	'use strict';
	return {
		DuplicateFiber: compose(Error, function (fiber) {
			this.message = 'Fiber with id "' + fiber.id + '" was already added.';
			this.fiber = fiber;
		}),

		MissingId: compose(Error, function (it) {
			this.target = it;
			this.message = 'ID is missing.';
		}),

		ContainerDestroyed: compose(Error, function (container) {
			this.message = 'Container "' + container.name + ' has been destroyed.';
		}),

		DuplicateModel: compose(Error, function (model) {
			this.message = 'Model with id "' + model.id + '" already exists.';
			this.model = model;
		}),

		DuplicateServiceModel: compose(Error, function (model) {
			this.message = 'Model for service "' + model.service + '" with name "' + model.name +
				'" already exists.';
			this.model = model;
		})
	};
});
