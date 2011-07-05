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
	'./Processor'
], function (arr, compose, Processor) {
	'use strict';
	return compose(function MessageRouter() {
		this._messageTypes = [];
		this._targets = [];
	}, {
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
			// XXX: need to return a handle to stop intercepting
			this._getTarget(msg).interceptors.unshift(interceptor);
		},

		on: function (msg, listener) {
			// a listener has an execute function and optional results and error functions
			// XXX: need to return a handle to stop listening
			this._getTarget(msg).listeners.push(listener);
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
