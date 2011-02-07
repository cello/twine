/**
 * @license Copyright (c) 2011 Cello Software, LLC.
 * All rights reserved.
 * Available via the new BSD License.
 */
/*jslint maxlen: 100, nomen: false, newcap: true, onevar: true, white: true, plusplus: false */
/*global define: false */

define([
	'compose',
	'./Singleton',
	'./Dynamic',
	'array'
], function (Compose, Singleton, Dynamic, array) {
	return Compose(function LifecycleManager(id) {
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
				model.lifecycle = Lifecycle(model);
			}));
		},

		terminate: function () {
			array.forEach(this._listeners, function (listener) {
				listener.stop();
			});
		}
	});
});
