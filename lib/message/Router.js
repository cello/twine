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
	'./Processor',
	'array'
], function (compose, Processor, array) {
	return compose(function MessageRouter() {
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

			return new Processor(cache).process();
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
