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
	'dojo/_base/array',
	'compose'
], function (d, compose) {
	'use strict';
	return compose(function AutoResolver() {
		this._listeners = [];
	}, {
		id: 'Auto Resolver Fiber',

		init: function (kernel) {
			this._listeners.push(kernel.modelRegistry.on('modelAdded', function (model) {
				if (model.autoResolve) {
					model.resolve();
				}
			}));
		},

		terminate: function () {
			// stop all the listeners
			d.forEach(this._listeners, function (listener) {
				listener.remove();
			});
		}
	});
});
