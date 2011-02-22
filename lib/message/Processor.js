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
	'array',
	'promise',
	'lang'
], function (compose, array, promise, lang) {
	return compose(compose, function MessageProcessor() {
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
			var dfd = promise.defer(),
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
