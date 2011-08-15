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
	'../support/compose',
	'../support/lang',
	'../support/promise',
	'../support/array'
], function (compose, lang, promise, array) {
	'use strict';
	return compose(function FactoryFiber() {
		this._listeners = [];
	}, {
		id: 'Factory Fiber',

		init: function (kernel) {
			this.kernel = kernel;
			kernel.modelBuilder.addProcessor(this);
		},

		process: function (model, next) {
			var kernel = this.kernel;
			return promise.when(model, function (model) {
				var factory = model.factory,
					module = {};

				if (factory) {
					// model.factory is a map of
					//	propertyName -> moduleId
					// instance.propertyName will be a factory for a moduleId
					array.forEach(lang.keys(factory), function (property) {
						module[property] = function (args) {
							return kernel.resolve(factory[property], args);
						};
					});
					model.module = module;
				}
			});
		},

		terminate: function () {
			// stop all the listeners
			array.forEach(this._listeners, function (listener) {
				listener.remove();
			});
		}
	});
});
