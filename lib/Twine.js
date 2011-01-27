/**
 * @license Copyright (c) 2011 Cello Software, LLC.
 * All rights reserved.
 * Available via the new BSD License.
 */
/*jslint maxlen: 100, nomen: false, newcap: true, onevar: true, white: true, plusplus: false */
/*global define: false */

define(['compose', './Kernel'], function (Compose, Kernel) {
    var uid = 0;

	return Compose(
        Compose,
        function () {
            if (!this.name) {
                // assign an arbitrary name
                this.name = 'twine_' + uid++;
            }
            if (!this.kernel) {
                this.kernel = new Kernel();
            }
        },
        {
		// the name is the container's identifier
		name: null,

		// reference to the kernel instance being used
		kernel: null,

		// adds another fiber to the twine
		addFiber: function (id, fiber) {
			this.kernel.addFiber(id, fiber);
		},

		// add components using a config object
		config: function (config) {
			// TODO: create an installer to handle this
		},

		/*
		// add components using installers
		install: function (installer) {
			// TODO: use an installer to register components
			installer(...);
		},

		// add components using registrations
		register: function (registration) {
			// TODO: this does all the work of registering componenets
			// config and install both end up calling this to do the work
		},
		*/

		// resolve a component according to the spec provided
		resolve: function (spec) {
			return this.kernel.resolve(spec);
		},

		// release a component
		release: function (component) {
			return this.kernel.release(component);
		},

		// destroy the container
		destroy: function () {
			this.kernel.destroy();
		}
	});
});
