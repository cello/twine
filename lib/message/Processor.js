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
			// process should only be called the first time.
			// next should be called in subsequent calls
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
				processor = this,
				msg = this.msg,
				next = lang.hitch(this, 'next'),
				resolve = lang.hitch(dfd, 'resolve'),
				reject = lang.hitch(dfd, 'reject');

			function proceed() {
				// proceed is called by interceptors to allow processing to continue and also
				// after each listener has been called.  eventually, this chain of promises unwinds
				// and the original promise returned from process is resolved.

				// XXX: is next actually needed/correct as the error callback?
				processor.next().then(next, next).then(resolve, reject);
			}

			if (interceptor) {
				this._interceptor++;
				// only proceed when the interceptor says to
				interceptor.intercept({
					msg: msg,
					proceed: proceed
				});
			}
			else if (listener) {
				this._listener++;
				// execute the listener - add callbacks if available.  let all async listeners
				// proceed in parallel and don't wait for them to finish
				promise.when(listener.execute(msg),
					lang.hitch(listener, 'results'), lang.hitch(listener, 'error'));
				proceed();
			}
			else {
				resolve();
			}

			return dfd.promise;
		}
	});
});
