/**
 * @license Copyright (c) 2011 Cello Software, LLC.
 * All rights reserved.
 * Available via the new BSD License.
 */
/*jslint maxlen: 100, nomen: false, newcap: true, onevar: true, white: true, plusplus: false */
/*global define: false */

define([
	'compose',
	'./Processor',
	'array'
], function (Compose, Processor, array) {
	return Compose(function MessageRouter() {
		this._messageTypes = [];
		this._targets = [];
	}, {
		dispatch: function (msg) {
			var cache = {
				interceptors: [],
				listeners: [],
				msg: msg
			};

			array.forEach(this._messageTypes, function (type, i) {
				var target;
				if (msg instanceof type) {
					target = this._targets[i];
					cache.interceptors = cache.interceptors.concat(target.interceptors);
					cache.listeners = cache.listeners.concat(target.listeners);
				}
			}, this);

			return Processor(cache).process();
		},

		intercept: function (msg, interceptor) {
			this._getTarget(msg).interceptors.unshift(interceptor);
		},

		on: function (msg, listener) {
			this._getTarget(msg).listeners.push(listener);
		},

		_getTarget: function (msg) {
			var index = this._getMessagIndex(msg),
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
			var messageTypes = this._messageTypes,
				index = array.indexOf(messageTypes, msg);

			if (!~index) {
				index = messageTypes.length;
				messageTypes.push(msg);
			}
			return index;
		}
	});
});
