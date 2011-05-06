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
	'./Model',
	'../lifecycle/Manager'
], function (compose, Model, LifecycleManager) {
	'use strict';
	return compose(function ModelBuilder(kernel) {
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
				}),
				processors = this._processors.slice(),
				current = 0;

			function next() {
				var processor = processors[current++];
				return processor ? processor.process(model, next) : model;
			}

			return next();
		},

		destroy: function () {
			// XXX: anything to do?
		}
	});
});
