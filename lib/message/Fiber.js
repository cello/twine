/**
 * @license Copyright (c) 2011 Cello Software, LLC.
 * All rights reserved.
 * Available via the new BSD License.
 */
/*jshint
    bitwise: false, curly: true, eqeqeq: true, forin: true, immed: true, indent: 4, maxlen: 100,
    newcap: true, noarg: true, noempty: true, onevar: true, passfail: false, undef: true,
    white: true
*/
/*global define: false, require: false */

define([
	'compose',
	'./Router',
	'array'
], function (compose, Router, array) {
	return compose(function MessageFiber() {
		this._listeners = [];
		this.router = new Router();
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

				// TODO: add pub/sub using uber/listen listener
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
