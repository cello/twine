/**
 * @license Copyright (c) 2011 Cello Software, LLC.
 * All rights reserved.
 * Available via the new BSD License.
 */
/*jslint maxlen: 100, nomen: false, newcap: true, onevar: true, white: true, plusplus: false */
/*global define: false */

define(['compose', 'events', './util/error'],
function (Compose, events, error) {
    // the Kernel Class
    return Compose(
        // use compose to mixin options passed to the constructor
        Compose,
        // Kernel is an event emitter
        events.Evented,
        function Kernel() {
            // this is a registry of kernel extensions
            this._fibers = {};

            // this is a registry of component models.  this is the hub of the kernel.
            this._components = {};
        },
        {
            // adds another fiber to the twine
            addFiber: function (id, fiber) {
                var fibers = this._fibers;

                if (fibers[id]) {
                    throw new error.FiberAlreadyExists(id);
                }
                fibers[id] = fiber;
                // XXX: what happens if this throws an Error ?
                fiber.init(this);
                this.emit('fiberAdded', fiber);
            },

            // use a registration to register a component
            // the registration should end up calling addComponentModel
            register: function (registration) {
                registration.register(this);
            },

            // this is the way to add components to the kernel
            addComponentModel: function (model) {
                this._components[model.id] = model;
                this.emit('componentAdded', model);
            },

            // release an instance
            release: function (instance) {
                var components = this._components;

                // iterate over the components to find the model for this instance
                Object.keys(components).some(function (key) {
                    var model = components[key];

                    // if we've found the model for this instance
                    if (model.instance === instance) {
                        // signal that this component has been released
                        this.emit('componentReleased', model);
                        // and stop iterating
                        return true;
                    }
                    return false;
                }, this);
            },

            // destroy the kernel
            destroy: function () {
                this._releaseComponents();
                this._terminateFibers();
            },

            // release all components
            _releaseComponents: function () {
                var components = this._components;

                Object.keys(components).forEach(function (key) {
                    this.release(components[key].instance);
                }, this);
            },

            // terminate all extensions
            _terminateFibers: function () {
                var fibers = this._fibers;

                Object.keys(fibers).forEach(function (key) {
                    fibers[key].terminate();
                });
            }
        }
    );
});
