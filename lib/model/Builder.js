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
	'compose',
	'array',
	'./Model',
	'../lifecycle/Manager'
], function (compose, array, Model, LifecycleManager) {
	'use strict';
	return compose(function Builder(kernel) {
		this._processors = [];
		this.kernel = kernel;

		// add the lifecycle manager
		kernel.addFiber(new LifecycleManager());
	}, {
		addProcessor: function (processor) {
			this._processors.push(processor);
		},

		process: function (config) {
			// call the processors in sequence.  create a model from the config and pass it to all
			// processors
			var model = new Model(config, {
				kernel: this.kernel
			});

			array.forEach(this._processors, function (processor) {
				processor.process(model);
			});

			return model;
		},

		destroy: function () {
			// XXX: anything to do?
		}
	});
});
