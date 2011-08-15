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
	'../support/array',
	'../support/compose',
	'../support/lang',
	'./Event',
	'./Router'
], function (arr, compose, lang, Event, Router) {
	'use strict';
	return compose(function NavigationFiber() {
		this._listeners = [];
		this.router = new Router();
	}, {
		id: 'Navigation Fiber',

		init: function (kernel) {
			var fiber = this,
				router = fiber.router;

			fiber.kernel = kernel;
			// XXX: need a way to determine if another fiber is already installed because
			// navigation has a dependency on messaging.
			// could install messaging from here if we knew it wasn't installed yet

			// add a component to handle navigation events
			kernel.addComponentModel({
				id: '__navigator__',
				listen: Event,
				module: router,
				dispatch: true
			});

			fiber._listeners.push(kernel.modelRegistry.on('modelAdded', function (model) {
				var navigator = {},
					navigateProp = model.navigate === true ? 'navigate' : model.navigate;

				// see if the model claims to be a router
				if (model.route || model.route === '') {
					model.addCommissioner(fiber);
				}

				// see if the model would like to be a navigation dispatcher
				if (navigateProp) {
					navigator[navigateProp] = lang.hitch(fiber, 'navigate');
					model.addMixin(navigator);
				}
			}));
		},

		navigate: function (target) {
			return this.kernel.resolve('__navigator__').then(function (navigator) {
				return navigator.dispatch(new Event(target));
			});
		},

		commission: function (instance, model) {
			if (instance) {
				// add the route for this instance
				var route = this.router.addRoute(model.route, lang.hitch(instance, 'route')),
					// create a temp commissioner to decommission the route
					commission = model.addCommissioner({
						decommission: function (instance) {
							// remove this temp commissioner
							commission.remove();
							// remove the route
							route.remove();

							return instance;
						}
					});
			}
			return instance;
		},

		terminate: function () {
			// stop all the listeners
			arr.forEach(this._listeners, function (listener) {
				listener.remove();
			});
		}
	});
});
