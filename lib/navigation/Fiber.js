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
	'compose',
	'array',
	'./Commissioner',
	'./Event'
], function (compose, array, Commissioner, Event) {
	'use strict';
	return compose(function NavigationFiber() {
		this._listeners = [];
	}, {
		id: 'Navigation Fiber',

		init: function (kernel) {
			// XXX: need a way to determine if another fiber is already installed.
			// navigation has a dependency on messaging

			// add a component to handle navigation events
			kernel.addComponentModel({
				id: '__navigator__',
				listen: Event,
				module: this
			});



			/*this._listeners.push(kernel.modelRegistry.on('modelAdded', function (model) {
				if (model.target) {
					model.addCommissioner(new Commissioner(model));
				}
			}));*/
		},

		execute: function (event) {
			console.log('navigation event: ', event);
		},

		terminate: function () {
			// stop all the listeners
			array.forEach(this._listeners, function (listener) {
				listener.cancel();
			});
		}
	});
});
