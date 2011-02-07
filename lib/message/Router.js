/**
 * @license Copyright (c) 2011 Cello Software, LLC.
 * All rights reserved.
 * Available via the new BSD License.
 */
/*jslint maxlen: 100, nomen: false, newcap: true, onevar: true, white: true, plusplus: false */
/*global define: false */

define([
	'compose',
	'./Dispatcher',
	'array'
], function (Compose, Dispatcher, array) {
	return Compose(function MessageRouter() {
		this._listeners = [];
	}, {
		id: 'Message Router',

		init: function (kernel) {
			var router = this;

			this._listeners.push(kernel.modelRegistry.on('modelAdded', function (model) {
				var dispatcher = {},
					// dispatcher can be set to true and default to dispatch property, or the name
					// of the property can be provided as an alternative
					dispatchProp = model.dispatcher === true ? 'dispatch' : model.dispatcher;

				if (dispatchProp) {
					dispatcher[dispatchProp] = router._newDispatcher();
					model.addMixin(dispatcher);
				}
			}));
		},

		_newDispatcher: function () {
			var dispatcher = Dispatcher(this);
			return function () {
				dispatcher.dispatch.apply(dispatcher, arguments);
			};
		},

		terminate: function () {
			// stop all the listeners
			array.forEach(this._listeners, function (listener) {
				listener.stop();
			});
		}
	});
});


// implement as a fiber

// looks at models/configs to see if they are requesting a dispatcher
// injects a dispatch function into instances
// routes messages

// looks at models/configs to see if they handle certain commands
// register these as listeners for particular events

// provides pub/sub ???