/**
 * @license Copyright (c) 2011 Cello Software, LLC.
 * All rights reserved.
 * Available via the new BSD License.
 */
/*jslint maxlen: 100, nomen: false, newcap: true, onevar: true, white: true, plusplus: false */
/*global define: false */

define(['compose', 'events'], 
function (Compose, events) {
    return Compose(
        Compose,
        events.Evented,
        function Kernel() {
            this._fibers = {};
        },
        {
		// adds another fiber to the twine
		addFiber: function (id, fiber) {
    	    var fibers = this._fibers;
            
            if (fibers[id]) {
                // TODO: see if Compose can subclass Errors
                throw new Error('Fiber with id "' + id + '" was already added.');
            }
            fibers[id] = fiber;
            // XXX: what happens if this throws an Error ?
            fiber.init(this);
            this.emit('fiberAdded', fiber);
		},

		// destroy the kernel
		destroy: function () {
			this._terminateFibers();
		},
    	
        _terminateFibers: function () {
            var fibers = this._fibers,
                key;
                
            for (key in fibers) {
                if (fibers.hasOwnProperty(key)) {
                    fibers[key].terminate();
                }
            }
        }
	});
});
