/**
 * @license Copyright (c) 2011 Cello Software, LLC.
 * All rights reserved.
 * Available via the new BSD License.
 */
/*jslint maxlen: 100, nomen: false, newcap: true, onevar: true, white: true, plusplus: false */
/*global define: false */

define([
	'compose'
], function (Compose) {
	return Compose(function MessageDispatcher(router) {
		this.router = router;
	}, {
		dispatch: function (msg) {
			console.log('dispatching... ', this, msg);
		}
	});
});
