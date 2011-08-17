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
	'./Processor'
], function (arr, compose, Processor) {
	'use strict';

	function MessageRouter() {
		this._messageTypes = [];
		this._targets = [];
	}

	return compose(MessageRouter, {
		dispatch: function (msg) {
			// creates a Processor to process the dispatched message.  returns a promise that is
			// resolved when the message has been processed.
			var cache = {
				interceptors: [],
				listeners: [],
				msg: msg
			};

			arr.forEach(this._messageTypes, function (type, i) {
				// loop over all messageTypes because we use instanceof as a check so that
				// listeners can receive messages that are subclasses of the type they listen to.
				var target;
				if (msg instanceof type) {
					target = this._targets[i];
					cache.interceptors = cache.interceptors.concat(target.interceptors);
					cache.listeners = cache.listeners.concat(target.listeners);
				}
			}, this);

			return new Processor(cache).process();
		},

		intercept: function (msg, interceptor) {
			// an interceptor has an intercept function
			var interceptors = this._getTarget(msg).interceptors;

			interceptors.unshift(interceptor);
			return {
				remove: function () {
					var index = arr.indexOf(interceptors, interceptor);

					if (~index) {
						interceptors.splice(index, 1);
					}
				}
			};
		},

		on: function (msg, listener) {
			// a listener has an execute function and optional results and error functions
			var listeners = this._getTarget(msg).listeners;

			listeners.push(listener);
			return {
				remove: function () {
					var index = arr.indexOf(listeners, listener);

					if (~index) {
						listeners.splice(index, 1);
					}
				}
			};
		},

		_getTarget: function (msg) {
			// returns a target object for the type of msg.
			// if no target exists, one is created.
			var index = this._getMessageIndex(msg),
				target = this._targets[index];

			if (!target) {
				target = {
					interceptors: [],
					listeners: []
				};
				this._targets[index] = target;
			}

			return target;
		},

		_getMessageIndex: function (msg) {
			// returns the index of msg in this._messageTypes.
			// if msg is not found in this._messageTypes, msg is added.
			var messageTypes = this._messageTypes,
				index = arr.indexOf(messageTypes, msg);

			if (!~index) {
				index = messageTypes.length;
				messageTypes.push(msg);
			}
			return index;
		}
	});
});
