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
	'../support/compose',
	'../support/promise',
	'../support/lang'
], function (compose, promise, lang) {
	'use strict';
	return compose(compose, function MessageProcessor() {
		this.interceptors = this.interceptors || [];
		this.listeners = this.listeners || [];
		this.msg = this.msg || '';
		this._interceptor = this._listener = 0;
	}, {

		process: function () {
			// process should only be called the first time.
			// next should be called in subsequent calls
			if (!this._processed) {
				this._processed = true;
				return this.next();
			}
		},

		next: function () {
			var dfd = promise.defer(),
				processor = this,
				// avoid dealing with mutating arrays by calling slice
				interceptors = processor.interceptors.slice(),
				listeners = processor.listeners.slice(),
				interceptor = interceptors[processor._interceptor],
				listener = listeners[processor._listener],
				msg = processor.msg,
				next = lang.hitch(processor, 'next'),
				resolve = lang.hitch(dfd, 'resolve'),
				reject = lang.hitch(dfd, 'reject'),
				results,
				error;

			function proceed() {
				// proceed is called by interceptors to allow processing to continue and also
				// after each listener has been called.  eventually, this chain of promises unwinds
				// and the original promise returned from process is resolved.

				// XXX: is next actually needed/correct as the error callback?
				return processor.next().then(next, next);
			}

			if (interceptor) {
				processor._interceptor++;
				// only proceed when the interceptor says to
				interceptor.intercept({
					msg: msg,
					proceed: function () {
						proceed().then(resolve, reject);
					}
				});
			}
			else if (listener) {
				results = listener.results ? lang.hitch(listener, 'results') : null;
				error = listener.error ? lang.hitch(listener, 'error') : null;
				processor._listener++;
				// execute the listener - add callbacks if available.  let all async listeners
				// proceed in parallel and don't wait for them to finish
				promise.all([
					// execute this listener right now and...
					promise.when(listener.execute(msg), results, error),
					// execute the rest of the listeners in parallel
					proceed()
				]).then(function () {
					// return the original message for anyone listening
					resolve(msg);
				}, reject);
			}
			else {
				resolve(msg);
			}

			return dfd.promise;
		}
	});
});
