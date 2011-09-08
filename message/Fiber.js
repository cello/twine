/**
 * @license Copyright (c) 2011 Cello Software, LLC.
 * All rights reserved.
 * Available via the new BSD License.
 */
/*jshint
	asi: false, bitwise: false, boss: false, curly: true, eqeqeq: true, eqnull: false, es5: true,
	evil: false, expr: true, forin: true, globalstrict: false, immed: true, indent: 4, latedef: true,
	laxbreak: false, loopfunc: true, maxlen: 100, newcap: true, noarg: true, noempty: true,
	nonew: true, nomen: false, onevar: true, passfail: false, plusplus: false, shadow: false,
	strict: false, sub: false, trailing: true, undef: true, white: true
*/
/*global define: false, require: false*/

define([
	'../support/array',
	'../support/compose',
	'./Router',
	'../support/lang',
	'./ListenerProxy',
	'./InterceptorProxy',
	'../support/Evented'
], function (arr, compose, Router, lang, ListenerProxy, InterceptorProxy, Evented) {
	'use strict';

	var hub = new Evented();

	function MessageFiber() {
		this._listeners = [];
		this.router = new Router();
	}

	return compose(MessageFiber, {
		id: 'Messaging Fiber',

		init: function (kernel) {
			var fiber = this,
				router = fiber.router;

			fiber._listeners.push(kernel.modelRegistry.on('modelAdded', function (model) {
				var dispatcher = {},
					// dispatch can be set to true and default to 'dispatch' property,
					// or the name of an alternative property can be provided
					dispatchProp = model.dispatch === true ? 'dispatch' : model.dispatch,
					pubs = {};

				if (dispatchProp) {
					dispatcher[dispatchProp] = lang.hitch(router, 'dispatch');
					model.addMixin(dispatcher);
				}

				if (model.listen) {
					// if model.listen is a function then we assume it's a constructor
					// and we will add a listener for that type
					if (typeof model.listen === 'function') {
						router.on(model.listen, new ListenerProxy(model));
					}
					// if it's a string we assume it's a module id for requirejs
					else if (typeof model.listen === 'string') {
						model.load([model.listen], function (msg) {
							router.on(msg, new ListenerProxy(model));
						});
					}
				}

				if (model.intercept) {
					// if model.intercept is a function then we assume it's a constructor
					// and we will add an interceptor for that type
					if (typeof model.intercept === 'function') {
						router.intercept(model.intercept, new InterceptorProxy(model));
					}
					// if it's a string we assume it's a module id for requirejs
					else if (typeof model.intercept === 'string') {
						model.load([model.intercept], function (msg) {
							router.intercept(msg, new InterceptorProxy(model));
						});
					}
				}

				if (model.publish) {
					//	publish: {
					//		functionName: 'topic/to/publish'
					//	}
					arr.forEach(lang.keys(model.publish), function (prop) {
						var topic = model.publish[prop];
						pubs[prop] = function () {
							var args = [topic];
							args.push.apply(args, arguments);
							hub.emit.apply(hub, args);
						};
					});
					model.addMixin(pubs);
				}

				if (model.subscribe) {
					//	subscribe: {
					//		functionName: 'topic/to/subscribe'
					//	}
					model.addCommissioner(fiber);
				}
			}));
		},

		commission: function (instance, model) {
			if (instance) {
				var subs = arr.map(lang.keys(model.subscribe), function (prop) {
						var topic = model.subscribe[prop];
						return hub.on(topic, instance[prop]);
					}),
					commissioner = model.addCommissioner({
						decommission: function (instance) {
							commissioner.remove();
							while (subs.length) {
								subs.shift().remove();
							}
						}
					});
			}
			return instance;
		},

		terminate: function () {
			// stop all the listeners
			arr.forEach(this._listeners, function (listener) {
				listener.remove();
			});
		}
	});
});
