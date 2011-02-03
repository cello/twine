/**
 * @license Copyright (c) 2011 Cello Software, LLC.
 * All rights reserved.
 * Available via the new BSD License.
 */
/*jslint maxlen: 100, nomen: false, newcap: true, onevar: true, white: true, plusplus: false */
/*global define: false */

define(['compose'], function (Compose) {
	return {
		// thrown when an attempt is made to add a fiber to the kernel and the id already exists.
		FiberAlreadyExists: Compose(Error, function (id) {
			this.message = 'Fiber with id "' + id + '" was already added.';
		}),

		FiberNeedsID: Compose(Error, function (fiber) {
			this.fiber = fiber;
			this.message = 'Fibers must have an id';
		}),

		ContainerDestroyed: Compose(Error, function (container) {
			this.message = 'Container "' + container.name + ' has been destroyed.';
		})
	};
});
