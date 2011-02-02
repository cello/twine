/**
 * @license Copyright (c) 2011 Cello Software, LLC.
 * All rights reserved.
 * Available via the new BSD License.
 */
/*jslint maxlen: 100, nomen: false, newcap: true, onevar: true, white: true, plusplus: false */
/*global define: false */

define({
	// generates a dsl based on the functions of the class
	fromClass: function (Cls) {
		var proto = Cls.prototype,
			dsl = {};

		// for each key in the prototype
		Object.keys(proto).forEach(function (key) {
			// if it's a function
			if (typeof proto[key] === 'function') {
				// add an entry to the dsl that will create an instance and call that function
				dsl[key] = function () {
					var instance = new Cls();
					instance[key].apply(instance, arguments);
				};
			}
		});
	}
});
