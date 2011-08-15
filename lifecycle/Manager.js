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
	'../support/promise',
	'../support/compose',
	'./Singleton'
], function (promise, compose, Singleton) {
	'use strict';
	return compose(function LifecycleManager() {
	}, {
		process: function (model, next) {
			var dfd = promise.defer();

			function assign(Lifecycle) {
				var lifecycle = new Lifecycle(model);

				model.lifecycle = lifecycle;
				model.on('destroyed', function () {
					lifecycle.destroy();
				});
				promise.when(next(model), function (model) {
					dfd.resolve(model);
				});
			}

			if (model.lifestyle) {
				// asynchronously load the lifestyle
				model.load([model.lifestyle], assign);
			}
			// Singleton is default
			else {
				assign(Singleton);
			}

			return dfd.promise;
		}
	});
});
