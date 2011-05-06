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
	'./Commissioner',
	'./Event',
	'./Router'
], function (d, compose, Commissioner, Event, Router) {
	'use strict';
	return compose(function NavigationFiber() {
		this._listeners = [];
		this.router = new Router();
	}, {
		id: 'Navigation Fiber',

		init: function (kernel) {
			var router = this.router;
			// XXX: need a way to determine if another fiber is already installed.
			// navigation has a dependency on messaging

			// add a component to handle navigation events
			kernel.addComponentModel({
				id: '__navigator__',
				listen: Event,
				module: router
			});

			this._listeners.push(kernel.modelRegistry.on('modelAdded', function (model) {
				if (model.route || model.route === '') {
					model.addCommissioner(new Commissioner(model, router));
				}
			}));
		},

		terminate: function () {
			// stop all the listeners
			d.forEach(this._listeners, function (listener) {
				listener.cancel();
			});
		}
	});
});
