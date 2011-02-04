/**
 * @license Copyright (c) 2011 Cello Software, LLC.
 * All rights reserved.
 * Available via the new BSD License.
 */
/*jslint maxlen: 100, nomen: false, newcap: true, onevar: true, white: true, plusplus: false */
/*global define: false */

define(['compose', 'events', 'promise'], function (Compose, events, Promise) {
	return Compose(
		Compose,
		events.Evented,
		function Model() {
			// if no id was provided
			if (!this.id) {
				// use the combination of service and name
				this.id = [this.service, this.name].join('/');
			}
		}, {
			// id must be unique per registry
			id: '',

			// name must be unique per service
			name: '',
			// the combination of service and name must be unique per registry
			service: '',

			// returns a promise to resolve a component
			resolve: function (args) {
				var model = this;
				// resolving might be asynchronous
				return Promise.when(this.lifecycle.resolve(args), function (component) {
					model.emit('componentResolved', component);
					return component;
				});
			},

			// releases the component
			release: function (instance) {
				// releasing must be synchronous
				this.lifecycle.release(instance);
				this.emit('componentReleased', instance);
			},

			// returns a promise to build an instance based on this model
			construct: function (args) {
				// hardwire an instance to play with the demo
				var instance = {
					on: function (event, cb) {
						setTimeout(cb, 800);
					}
				};

				this.emit('componentConstructed', instance);
				return instance;
			},

			deconstruct: function (instance) {
				this.emit('componentDeconstructed', instance);
			},

			destroy: function () {
				this.lifecycle.destroy();
			}
		}
	);
});
