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
	'dojo/_base/array',
	'compose',
	'promise'
], function (d, compose, promise) {
	'use strict';
	// this is used as an event listener component
	return compose(function NavigationRouter() {
		this._routes = [];
	}, {
		execute: function (event) {
			var target = event.target;

			if (target && target.match) {
				// allow the routers to process the event before its returned to the navigator
				return promise.all(d.map(this._routes, function (route) {
					var args = target.match(route.route);

					if (args) {
						args.unshift(event);
						return route.handler.apply(null, args);
					}
				}));
			}
		},

		addRoute: function (route, handler) {
			var routes = this._routes,
				routeObj = {
					route: new RegExp(route),
					handler: handler
				};

			routes.push(routeObj);

			return {
				remove: function () {
					routes.splice(d.indexOf(routes, routeObj), 1);
				}
			};
		}
	});
});
