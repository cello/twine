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
	'../support/array',
	'../support/compose',
	'./Router',
	'../support/lang',
	'./ListenerProxy',
	'./InterceptorProxy'
], function (arr, compose, Router, lang, ListenerProxy, InterceptorProxy) {
	'use strict';
	return compose(function MessageFiber() {
		this._listeners = [];
		this.router = new Router();
	}, {
		id: 'Messaging Fiber',

		init: function (kernel) {
			var router = this.router;

			this._listeners.push(kernel.modelRegistry.on('modelAdded', function (model) {
				var dispatcher = {},
					// dispatch can be set to true and default to 'dispatch' property,
					// or the name of an alternative property can be provided
					dispatchProp = model.dispatch === true ? 'dispatch' : model.dispatch;

				if (dispatchProp) {
					dispatcher[dispatchProp] = lang.hitch(router, 'dispatch');
					model.addMixin(dispatcher);
				}

				if (model.listen) {
					// if model.listen is a function then we assume it's a constructor
					// and we will add a listener for that type
					if (lang.isFunction(model.listen)) {
						router.on(model.listen, new ListenerProxy(model));
					}
					// if it's a string we assume it's a module id for requirejs
					else if (lang.isString(model.listen)) {
						require([model.listen], function (msg) {
							router.on(msg, new ListenerProxy(model));
						});
					}
				}

				if (model.intercept) {
					// if model.intercept is a function then we assume it's a constructor
					// and we will add an interceptor for that type
					if (lang.isFunction(model.intercept)) {
						router.intercept(model.intercept, new InterceptorProxy(model));
					}
					// if it's a string we assume it's a module id for requirejs
					else if (lang.isString(model.intercept)) {
						require([model.intercept], function (msg) {
							router.intercept(msg, new InterceptorProxy(model));
						});
					}
				}

				// TODO: add pub/sub using uber/listen listener - maybe...
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
			arr.forEach(this._listeners, function (listener) {
				listener.remove();
			});
		}
	});
});
