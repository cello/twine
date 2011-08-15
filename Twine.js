/**
 * @license Copyright (c) 2011 Cello Software, LLC.
 * All rights reserved.
 * Available via the new BSD License.
 */
/*jshint
	asi: false, bitwise: false, boss: false, curly: true, eqeqeq: true, eqnull: false, es5: true,
	evil: false, expr: true, forin: true, globalstrict: false, immed: true, indent: 4, latedef: true,
	laxbreak: false, loopfunc: true, maxlen: 100, newcap: true, noarg: true, noempty: true,
	nonew: true, nomen: false, onevar: true, passfail: false, plusplus: false, shadow: false,
	strict: false, sub: false, trailing: true, undef: true, white: true
*/
/*global define: false, require: false*/

define([
	'./support/array',
	'./support/compose',
	'./Kernel',
	'./support/promise',
	'./util/error'
], function (arr, compose, Kernel, promise, error) {
	'use strict';

	function getUid() {
		return 'twine_' + uid++;
	}

	function normalizeConfigItems(items) {
		return arr.map(items, function (item) {
			// a function is handled as a factory/constructor
			if (typeof item === 'function') {
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

	// when constructor is called, compose has already mixed in the options
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
		if (!this.load) {
			this.load = typeof module !== 'undefined' ?
				// in node, call cb with deps mapped through require
				function (deps, cb) {
					cb.apply(this, deps.map(require));
				}
				// anywhere else assume AMD require
				: require;
		}
	}

	var uid = 0,
		defer = promise.defer,
		when = promise.when,
		all = promise.all,
		slice = [].slice;

	// the Twine Class
	return compose(
		// use compose as a constructor to mixin options passed to constructor
		compose,
		Twine,
		{
			// the container's identifier
			name: null,

			// reference to the kernel instance being used
			kernel: null,

			// reference to a function to load dependencies
			load: null,

			// adds another fiber to the twine
			addFiber: function (fiber) {
				return this.kernel.addFiber(fiber);
			},

			// configure instance based on a config object.  likely an async operation so a promise
			// is always returned.
			configure: function (config) {
				checkDestroyed(this);
				config = config || {};

				var dfd = defer(),
					seq = [],
					container = this,
					fibers = config.fibers,
					installers = config.installers,
					components = config.components,
					// allow calls to configure to provide their own load function
					// default to container's load function
					load = config.load || this.load;

				// if the config has fibers
				if (fibers && fibers.length) {
					// configure the fibers and add to the sequence of promises
					seq.push(function () {
						return when(container._configureFibers(fibers), function (fibers) {
							// add each fiber to this container
							return all(arr.map(fibers, function (fiber) {
								return container.addFiber(fiber);
							}));
						});
					});
				}

				// if the config has installers
				if (installers && installers.length) {
					// configure the installers and add them to the sequence of promises
					seq.push(function () {
						return when(container._configureInstallers(installers),
							function (installers) {
								// install each of the installers
								return all(arr.map(installers, function (installer) {
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
						return all(arr.map(components, function (component) {
							// a component may provide it's own load function
							if (!component.load) {
								// default to (config.load || this.load);
								component.load = load;
							}
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
				arr.forEach(fibers, function (fiber) {
					// a string is a reference to a module that needs to be loaded
					(typeof fiber === 'string' ? deps : loaded).push(fiber);
				});

				// if any dependencies need to be loaded
				if (deps.length) {
					// load the modules and then resolve the deferred
					this.load(deps, function () {
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
				arr.forEach(installers, function (installer) {
					// a string is a reference to a module that needs to be loaded
					(typeof installer === 'string' ? deps : loaded).push(installer);
				});

				// if any dependencies need to be loaded
				if (deps.length) {
					// load the modules and then resolve the deferred
					this.load(deps, function () {
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
