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
	'patr/assert',
	'twine/message/Processor',
	'lang',
	'promise'
], function (assert, Processor, lang, promise) {
	return {
		'test listeners are called': function () {
			var l1 = {
					id: 'l1',
					execute: function (msg) {
						this.msg = msg;
					}
				},
				l2 = {
					id: 'l2',
					execute: function (msg) {
						this.msg = msg;
					}
				},
				cache = {
					listeners: [l1, l2],
					msg: {
						foo: 'foo'
					}
				},
				processor = new Processor(cache);

			return processor.process().then(function () {
				assert.strictEqual(l1.msg, cache.msg, 'listeners should be passed the message');
				assert.strictEqual(l2.msg, cache.msg, 'multiple listeners should all be called');
			});
		},

		'test interceptors are called': function () {
			var i1 = {
					intercept: function (processor) {
						this.called = true;
						assert.ok(lang.isFunction(processor.proceed),
							'object with a proceed function should be passed to interceptor');
						processor.proceed();
					}
				},
				i2 = {
					intercept: function (processor) {
						this.called = true;
						processor.proceed();
					}
				},
				processor = new Processor({
					interceptors: [i1, i2]
				});

			return processor.process().then(function () {
				assert.ok(i1.called, 'interceptor should be called');
				assert.ok(i2.called, 'interceptor should be called');
			});
		},

		'test interceptor needs to call proceed for listeners to be invoked': function () {
			var i1 = {
					proceed: true,
					intercept: function (processor) {
						if (this.proceed) {
							processor.proceed();
						}
					}
				},
				i2 = {
					intercept: function (processor) {
						this.called = true;
						processor.proceed();
					}
				},
				listener = {
					msg: 'empty',
					execute: function (msg) {
						this.msg = msg;
					}
				},
				cache = {
					interceptors: [i1, i2],
					listeners: [listener],
					msg: 'filled'
				},
				processor = new Processor(cache);

			return processor.process().then(function () {
				assert.strictEqual(listener.msg, 'filled',
					'interceptor should call proceed to invoke listeners');

				i1.proceed = false;
				i2.called = false;
				listener.msg = 'empty';
				var another = new Processor(cache),
					dfd = promise.defer();

				another.process().then(function () {
					assert.ok(false,
						'listeners should not be invoked if interceptors do not call proceed');
					dfd.reject();
				});
				// give a failing case time to fail
				setTimeout(dfd.resolve, 500);

				assert.ok(!i2.called, 'any interceptor not calling proceed will stop processing');

				return dfd.promise;
			});
		}
	};
});
