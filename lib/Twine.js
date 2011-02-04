/**
 * @license Copyright (c) 2011 Cello Software, LLC.
 * All rights reserved.
 * Available via the new BSD License.
 */
/*jslint maxlen: 100, nomen: false, newcap: true, onevar: true, white: true, plusplus: false */
/*global define: false */

define([
	'compose',
	'./Kernel',
	'promise',
	'./component/dsl',
	'lang',
	'array',
	'./util/error'
], function (Compose, Kernel, Promise, Component, lang, array, error) {
	var uid = 0,
		defer = Promise.defer;

	function getUid() {
		return 'twine_' + uid++;
	}

	function normalizeConfigItems(items) {
		return array.map(items, function (item) {
			// a function is handled as a factory/constructor
			if (lang.isFunction(item)) {
				return item(); // NOTE: not called with `new`
			}
			return item;
		});
	}

	function checkDestroyed(container) {
		if (container._destroyed) {
			throw error.ContainerDestroyed(container);
		}
	}

	// the Twine Class
	return Compose(
		// use compose as a constructor to mixin options passed to the constructor
		Compose,
		// when this constructor is called, compose has already mixed in the options
		function Twine() {
			// ensure the invariants
			if (!this.name) {
				// assign an arbitrary name
				this.name = getUid();
			}
			if (!this.kernel) {
				// create the default kernel
				this.kernel = Kernel();
			}
		},
		{
			// the container's identifier
			name: null,

			// reference to the kernel instance being used
			kernel: null,

			// adds another fiber to the twine
			addFiber: function (fiber) {
				this.kernel.addFiber(fiber);
				return this;
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
						return Promise.when(container._configureFibers(fibers), function (fibers) {
							// add each fiber to this container
							array.forEach(fibers, function (fiber) {
								container.addFiber(fiber);
							});
						});
					});
				}

				// if the config has installers
				if (installers && installers.length) {
					// configure the installers and add them to the sequence of promises
					seq.push(function () {
						return Promise.when(container._configureInstallers(installers),
							function (installers) {
								// install each of the installers
								return Promise.all(array.map(installers, function (installer) {
									return container.install(installer);
								}));
							}
						);
					});
				}

				// if the config has components
				if (components && components.length) {
					seq.push(function () {
						return Promise.when(container._configureComponents(components),
							function (modules) {
								array.forEach(modules, function (module) {
									container.register(Component.fromConfig(components[i])
										.withModule(module));
								});
							}
						);
					});
				}

				// fibers, installers and components need to be applied in sequence
				Promise.seq(seq).then(function () {
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
				array.forEach(fibers, function (fiber) {
					// a string is a reference to a module that needs to be loaded
					(lang.isString(fiber) ? deps : loaded).push(fiber);
				});

				// if any dependencies need to be loaded
				if (deps.length) {
					// load the modules and then resolve the deferred
					require(deps, function () {
						// NOTE: this changes the order compared to the config
						dfd.resolve(normalizeConfigItems(loaded.concat(aray.toArray(arguments))));
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
				array.forEach(installers, function (installer) {
					// a string is a reference to a module that needs to be loaded
					(lang.isString(installer) ? deps : loaded).push(installer);
				});

				// if any dependencies need to be loaded
				if (deps.length) {
					// load the modules and then resolve the deferred
					require(deps, function () {
						dfd.resolve(normalizeConfigItems(loaded.concat(array.toArray(arguments))));
					});
				}
				else {
					dfd.resolve(normalizeConfigItems(loaded));
				}

				return dfd.promise;
			},

			// components must have a module property.  this property can only be provided as a
			// string referencing the module to be loaded.
			_configureComponents: function (components) {
				components = components || [];

				var dfd = defer(),
					deps = [],
					unloaded = [],
					loaded = [];

				// build the list of dependencies to be loaded
				array.forEach(components, function (component) {
					// a string is a reference to a module that needs to be loaded
					if (lang.isString(component.module)) {
						deps.push(component.module);
						unloaded.push(component);
					}
					else {
						loaded.push(component);
					}
					(lang.isString(component.module) ? deps : loaded).push(component);
				});

				// if any dependencies need to be loaded
				if (deps.length) {
					// load the modules and then resolve the deferred
					require(deps, function () {
						var args = array.toArray(arguments);

						array.forEach(unloaded, function (component, i) {
							component.module = args[i];
						});

						dfd.resolve(loaded.concat(unloaded));
					});
				}
				else {
					dfd.resolve(loaded);
				}

				return dfd.promise;
			},

			// add components using installers
			install: function (installer) {
				var container = this;
				checkDestroyed(container);
				return Promise.when(installer.install(container), function () {
					return container;
				});
			},

			// add components using registrations
			register: function (registration) {
				checkDestroyed(this);
				// this does all the work of registering components.
				// installers should end up calling this to do their real work.
				var kernel = this.kernel;

				kernel.regsiter.apply(kernel, arguments);
				return this;
			},

			// resolve a component according to the spec provided
			resolve: function (spec) {
				checkDestroyed(this);
				return this.kernel.resolve(spec);
			},

			// release a component
			release: function (component) {
				checkDestroyed(this);
				this.kernel.release(component);
				return this;
			},

			// destroy the container
			destroy: function () {
				this.kernel.destroy();
				this._destroyed = true;
				// don't return anything - this is the end of the line
			}
		}
	);
});
