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

define(['../support/compose'], function (compose) {
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

		MissingLifecycle: compose(Error, function (model) {
			this.model = model;
			this.message = 'Model with id "' + model.id + '" needs a lifecycle.';
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
