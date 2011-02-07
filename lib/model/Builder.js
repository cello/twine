/**
 * @license Copyright (c) 2011 Cello Software, LLC.
 * All rights reserved.
 * Available via the new BSD License.
 */
/*jslint maxlen: 100, nomen: false, newcap: true, onevar: true, white: true, plusplus: false */
/*global define: false */

define([
	'compose',
	'promise',
	'array',
	'./Model',
	'../lifecycle/Manager'
], function (Compose, Promise, array, Model, LifecycleManager) {
	return Compose(function Builder(kernel) {
		this._processors = [];
		this.kernel = kernel;

		// add the lifecycle manager
		kernel.addFiber(LifecycleManager());
	}, {
		addProcessor: function (processor) {
			this._processors.push(processor);
		},

		process: function (config) {
			// call the processors in sequence.  create a model from the config and pass it to all
			// processors
			console.log('processing config for model: ', config);
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
