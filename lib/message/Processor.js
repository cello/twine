/**
 * @license Copyright (c) 2011 Cello Software, LLC.
 * All rights reserved.
 * Available via the new BSD License.
 */
/*jslint maxlen: 100, nomen: false, newcap: true, onevar: true, white: true, plusplus: false */
/*global define: false */

define([
	'compose',
	'array',
	'promise',
	'lang'
], function (Compose, array, Promise, lang) {
	return Compose(Compose, function MessageProcessor() {
		this.interceptors = this.interceptors || [];
		this.listeners = this.listeners || [];
		this.msg = this.msg || '';
		this._interceptor = this._listener = 0;
	}, {

		process: function () {
			if (!this._processed) {
				this._processed = true;
				return this.next();
			}
		},

		next: function () {
			var dfd = Promise.defer(),
				interceptors = this.interceptors,
				listeners = this.listeners,
				interceptor = interceptors[this._interceptor],
				listener = listeners[this._listener],
				processor = this;

			function next() {
				return processor.next();
			}

			function resolve() {
				dfd.resolve();
			}

			function reject() {
				dfd.reject();
			}

			function proceed() {
				processor.next().then(next, next).then(resolve, reject);
			}

			if (interceptor) {
				this._interceptor++;
				interceptor.intercept({
					proceed: proceed
				});
			}
			else if (listener) {
				this._listener++;
				// execute the listener - ignore any return values.  let all async listeners
				// proceed in parallel and don't wait for them to finish
				listener.execute(this.msg);
				proceed();
			}
			else {
				dfd.resolve();
			}

			return dfd.promise;
		}
	});
});
