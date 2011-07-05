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
				require([model.lifestyle], assign);
			}
			// Singleton is default
			else {
				assign(Singleton);
			}

			return dfd.promise;
		}
	});
});
