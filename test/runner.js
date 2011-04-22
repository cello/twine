/**
 * @license Copyright (c) 2011 Cello Software, LLC.
 * All rights reserved.
 */
/*jshint
	bitwise: false, curly: true, eqeqeq: true, forin: true, immed: true, indent: 4, maxlen: 100,
	newcap: true, noarg: true, noempty: true, onevar: true, passfail: false, strict: true,
	undef: true, white: true
*/
/*global define: false, require: false, process: false */

require('./node-amd');
var path = require('path'),
	tests = process.argv[2] ? path.join(process.cwd(), process.argv[2]) : './all'

console.log(tests);

define([tests, 'patr/runner'], function (tests, patr) {
	'use strict';
	patr.run(tests);
});
