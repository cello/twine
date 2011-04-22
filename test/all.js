/**
 * @license Copyright (c) 2011 Cello Software, LLC.
 * All rights reserved.
 * Available via the new BSD License.
 */
/*jshint
    bitwise: false, curly: true, eqeqeq: true, forin: true, immed: true, indent: 4, maxlen: 100,
    newcap: true, noarg: true, noempty: true, onevar: true, passfail: false, undef: true,
    white: true
*/
/*global define: false, require: false */

// configure requirejs
define([
	'./Twine',
	'./Kernel',
	'./message/Processor'
],
function (Twine, Kernel, Processor) {
	return {
		testTwine: Twine,
		testKernel: Kernel,
		testMessage: {
			testProcessor: Processor
		}
	};
});
