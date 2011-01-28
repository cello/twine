/**
 * @license Copyright (c) 2011 Cello Software, LLC.
 * All rights reserved.
 * Available via the new BSD License.
 */
/*jslint maxlen: 100, nomen: false, newcap: true, onevar: true, white: true, plusplus: false */
/*global define: false */

define(['compose', './Kernel', 'promise', './component/dsl'],
function (Compose, Kernel, Promise, Component) {
    var uid = 0;

    function getUid() {
        return 'twine_' + uid++;
    }

    // return a function that calls require and returns a promise which is resolved when the
    // the dependencies have been fulfilled.
    function generateRequireWithPromise(deps, cb) {
        return function (container) {
            var dfd = new Promise.Deferred();

            require(deps, function () {
                try {
                    cb.apply(this, arguments);
                    dfd.resolve(container);
                }
                catch (e) {
                    dfd.reject(e);
                }
            });

            return dfd.promise;
        };
    }

    function argsToArray(args) {
        return Array.prototype.slice.call(args);
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

            // configure this instance based on a config object.  this is likely an asynchronous
            // operation so a promise is returned.
            configure: function (config) {
                if (!config) {
                    return;
                }

                var seq = [], // a sequence of promises to be resolved
                    container = this,
                    fibers = config.fibers,
                    installers = config.installers,
                    components = config.components;

                // if the config contains fibers
                if (fibers && fibers.length) {
                    // fetch the fibers
                    seq.push(generateRequireWithPromise(fibers, function () {
                        var args = argsToArray(arguments);

                        // add the fibers to the container
                        args.forEach(function (fiber, i) {
                            container.addFiber(fibers[i], fiber);
                        });
                    }));
                }

                // if the config contains installers
                if (installers && installers.length) {
                    // fetch the installers
                    seq.push(generateRequireWithPromise(installers, function () {
                        // add the installers to the container
                        container.install.apply(container, arguments);
                    }));
                }

                // if the config contains components
                if (components && components.length) {
                    // fetch the components
                    seq.push(generateRequireWithPromise(components.map(function (componentConfig) {
                        return componentConfig.id;
                    }), function () {
                        var args = argsToArray(arguments);

                        // register the components with the container
                        args.forEach(function (component, i) {
                            container.register(Component.fromConfig(components[i])
                                                .withImplementation(component));
                        });
                    }));
                }

                // fibers, installers and components should be loaded and applied in sequence
                return Promise.seq(seq, this);
            },

            // add components using installers
            install: function (installer) {
                var args = argsToArray(arguments);

                // allow for multiple installers to be passed
                args.forEach(function (installer) {
                    installer.install(this);
                }, this);
            },

            // add components using registrations
            register: function (registration) {
                // this does all the work of registering components.
                // installers should end up calling this to do their real work.
                var kernel = this.kernel;

                kernel.regsiter.apply(kernel, arguments);
            },

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
        }
    );
});
