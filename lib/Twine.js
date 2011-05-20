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
	'compose',
	'./Kernel',
	'promise',
	'lang',
	'./util/error'
], function (d, compose, Kernel, promise, lang, error) {
	'use strict';
	var uid = 0,
		defer = promise.defer,
		slice = Array.prototype.slice;

	function getUid() {
		return 'twine_' + uid++;
	}

	function normalizeConfigItems(items) {
		return d.map(items, function (item) {
			// a function is handled as a factory/constructor
			if (lang.isFunction(item)) {
				return item(); // NOTE: not called with `new`
			}
			return item;
		});
	}

	function checkDestroyed(container) {
		if (container._destroyed) {
			throw new error.ContainerDestroyed(container);
		}
	}

	// the Twine Class
	return compose(
		// use compose as a constructor to mixin options passed to the constructor
		compose,
		// when this constructor is called, compose has already mixed in the options
		function Twine() {
			// ensure the invariants
			if (!this.name) {
				// assign an arbitrary name
				this.name = getUid();
			}
			if (!this.kernel) {
				// create the default kernel
				this.kernel = new Kernel();
			}
		},
		{
			// the container's identifier
			name: null,

			// reference to the kernel instance being used
			kernel: null,

			// adds another fiber to the twine
			addFiber: function (fiber) {
				return this.kernel.addFiber(fiber);
			},

			// configure this instance based on a config object.  this is likely an asynchronous
			// operation so a promise is returned.
			configure: function (config) {
				checkDestroyed(this);
				config = config || {};

				var dfd = defer(),
					seq = [],
					container = this,
					fibers = config.fibers,
					installers = config.installers,
					components = config.components;

				// if the config has fibers
				if (fibers && fibers.length) {
					// configure the fibers and add them to the sequence of promises
					seq.push(function () {
						return promise.when(container._configureFibers(fibers), function (fibers) {
							// add each fiber to this container
							return promise.all(d.map(fibers, function (fiber) {
								return container.addFiber(fiber);
							}));
						});
					});
				}

				// if the config has installers
				if (installers && installers.length) {
					// configure the installers and add them to the sequence of promises
					seq.push(function () {
						return promise.when(container._configureInstallers(installers),
							function (installers) {
								// install each of the installers
								return promise.all(d.map(installers, function (installer) {
									return container.install(installer);
								}));
							}
						);
					});
				}

				// if the config has components
				if (components && components.length) {
					// components will be lazy loaded
					seq.push(function () {
						return promise.all(d.map(components, function (component) {
							return container.kernel.addComponentModel(component);
						}));
					});
				}

				// fibers, installers and components need to be applied in sequence
				promise.seq(seq).then(function () {
					dfd.resolve(container);
				}, dfd.reject);

				// return a promise that resolves to the container
				return dfd.promise;
			},

			// fibers can be provided in the config as:
			//  - a string, considered as a module id to be loaded and then considered again
			//  - a function, it will be considered a factory and executed
			//  - anything else, assumed to be an instance of a fiber
			_configureFibers: function (fibers) {
				fibers = fibers || [];

				var dfd = defer(),
					deps = [],
					loaded = [];

				// build the list of dependencies to be loaded
				d.forEach(fibers, function (fiber) {
					// a string is a reference to a module that needs to be loaded
					(lang.isString(fiber) ? deps : loaded).push(fiber);
				});

				// if any dependencies need to be loaded
				if (deps.length) {
					// load the modules and then resolve the deferred
					require(deps, function () {
						// NOTE: this changes the order compared to the config
						dfd.resolve(normalizeConfigItems(loaded.concat(slice.call(arguments))));
					});
				}
				else {
					dfd.resolve(normalizeConfigItems(loaded));
				}

				return dfd.promise;
			},

			// installers can be provided in the same way as fibers
			_configureInstallers: function (installers) {
				installers = installers || [];

				var dfd = defer(),
					deps = [],
					loaded = [];

				// build the list of dependencies to be loaded
				d.forEach(installers, function (installer) {
					// a string is a reference to a module that needs to be loaded
					(lang.isString(installer) ? deps : loaded).push(installer);
				});

				// if any dependencies need to be loaded
				if (deps.length) {
					// load the modules and then resolve the deferred
					require(deps, function () {
						dfd.resolve(normalizeConfigItems(loaded.concat(slice.call(arguments))));
					});
				}
				else {
					dfd.resolve(normalizeConfigItems(loaded));
				}

				return dfd.promise;
			},

			// add components using installers
			install: function (installer) {
				var container = this;
				checkDestroyed(container);
				return promise.whenPromise(installer.install(container), function () {
					return container;
				});
			},

			// resolve a component according to the spec provided
			resolve: function (spec, args) {
				checkDestroyed(this);
				return this.kernel.resolve(spec, args);
			},

			// release a component
			release: function (component) {
				checkDestroyed(this);
				return this.kernel.release(component);
			},

			// destroy the container
			destroy: function () {
				this._destroyed = true;
				return this.kernel.destroy();
			}
		}
	);
});
