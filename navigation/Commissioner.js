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
	'compose',
	'lang'
], function (compose, lang) {
	'use strict';
	return compose(function NavigationCommissioner(model, router) {
		this.model = model;
		this.router = router;
	}, {
		commission: function (instance) {
			if (instance) {
				var route = lang.hitch(instance, 'route');
				instance.__route__ = this.router.addRoute(this.model.route, route);
			}
			return instance;
		},

		decommission: function (instance) {
			// remove the route
			if (instance && instance.__route__) {
				instance.__route__.remove();
				instance.__route__ = null;
			}
			return instance;
		}
	});
});
