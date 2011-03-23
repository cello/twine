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
	'./Commissioner'
], function (compose, array, Commissioner) {
	return compose(function NavigationFiber() {
		this._listeners = [];
	}, {
		id: 'Navigation Fiber',

		init: function (kernel) {
			this._listeners.push(kernel.modelRegistry.on('modelAdded', function (model) {
				if (model.target) {
					model.addCommissioner(new Commissioner(model));
				}
			}));
		},

		terminate: function () {
			// stop all the listeners
			array.forEach(this._listeners, function (listener) {
				listener.cancel();
			});
		}
	});
});
