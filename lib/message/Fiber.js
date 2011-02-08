/**
 * @license Copyright (c) 2011 Cello Software, LLC.
 * All rights reserved.
 * Available via the new BSD License.
 */
/*jslint maxlen: 100, nomen: false, newcap: true, onevar: true, white: true, plusplus: false */
/*global define: false */

define([
	'compose',
	'./Router',
	'array'
], function (Compose, Router, array) {
	return Compose(function MessageFiber() {
		this._listeners = [];
		this.router = Router();
	}, {
		id: 'Messaging Fiber',

		init: function (kernel) {
			var router = this.router;

			this._listeners.push(kernel.modelRegistry.on('modelAdded', function (model) {
				var dispatcher = {},
					// dispatcher can be set to true and default to 'dispatch' property,
					// or the name of an alternative property can be provided
					dispatchProp = model.dispatch === true ? 'dispatch' : model.dispatcher;

				if (dispatchProp) {
					dispatcher[dispatchProp] = function () {
						return router.dispatch.apply(router, arguments);
					};
					model.addMixin(dispatcher);
				}

				// TODO: register any listeners
				/* - look for the following in the model
				{
					listen: {
						functionName: function EventConstructor() {}
					}
				}
				*/

				// TODO: register any interceptors
				/* - model should be like:
				{
					intercept: {
						functionName: function EventConstructor() {}
					}
				}
				*/

				// TODO: add pub/sub using uber/event listener
				/* - look in the model
				{
					publish: {
						functionName: 'topic/to/publish'
					},
					subscribe: {
						functionName: 'topic/to/subscribe'
					}
				}
				*/
			}));
		},

		terminate: function () {
			// stop all the listeners
			array.forEach(this._listeners, function (listener) {
				listener.stop();
			});
		}
	});
});
