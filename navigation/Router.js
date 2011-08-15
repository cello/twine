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
	'../support/promise'
], function (arr, compose, promise) {
	'use strict';
	// this is used as an event listener component
	return compose(function NavigationRouter() {
		this._routes = [];
	}, {
		execute: function (event) {
			var router = this,
				target = event.target;

			if (target && target.match) {
				router.lastEvent = event;
				// allow the routers to process the event before its returned to the navigator
				return promise.all(arr.map(router._routes, function (route) {
					return router._execRoute(route, event, target);
				}));
			}
		},

		_execRoute: function (route, event, target) {
			var args = target.match(route.route);

			if (args) {
				args.unshift(event);
				return route.handler.apply(null, args);
			}
		},

		addRoute: function (route, handler) {
			var router = this,
				routes = router._routes,
				lastEvent = router.lastEvent,
				routeObj = {
					route: new RegExp(route),
					handler: handler
				};

			routes.push(routeObj);

			// let new routes know the current state of things
			if (lastEvent) {
				router._execRoute(routeObj, lastEvent, lastEvent.target);
			}

			return {
				remove: function () {
					var index = arr.indexOf(routes, routeObj);

					if (~index) {
						routes.splice(index, 1);
					}
				}
			};
		}
	});
});
