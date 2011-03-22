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
	'compose'
], function (compose) {
	return compose(function NavigationCommissioner(model) {
		this.model = model;
	}, {
		commission: function (instance) {
			var model = this.model;
			// XXX: need to register this instance as a target
			console.log('commissioning model with a target property... ', model.target);
			return instance;
		},

		decommission: function (instance) {
			var model = this.model;
			// XXX: unregister this instance as a target
			console.log('decommissioning model with a target property - ', model.target);
			return instance;
		}
	});
});
