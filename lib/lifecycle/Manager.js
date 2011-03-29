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
	'./Singleton',
	'./Dynamic',
	'array'
], function (compose, Singleton, Dynamic, array) {
	'use strict';
	return compose(function LifecycleManager(id) {
		this.id = id || this.id;
		this._listeners = [];
	}, {
		id: 'Lifecycle Manager',

		init: function (kernel) {
			this._listeners.push(kernel.modelRegistry.on('modelAdded', function (model) {
				var Lifecycle,
					lifestyle = model.lifestyle || '';

				// figure out which lifecycle model to use
				switch (lifestyle.toLowerCase()) {
				case 'dynamic':
					Lifecycle = Dynamic;
					break;
				default:
					Lifecycle = Singleton;
				}

				// add the lifecycle to the model
				model.lifecycle = new Lifecycle(model);
			}));
		},

		terminate: function () {
			array.forEach(this._listeners, function (listener) {
				listener.cancel();
			});
		}
	});
});
