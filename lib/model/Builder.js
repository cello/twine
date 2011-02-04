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
			this._processors.push(function () {
				return processor.process.apply(processor, arguments);
			});
		},

		process: function (config) {
			// call the processors in sequence.  start with the model as the seed value
			// and return the final result after all processors have been applied.
			console.log('processing config for model: ', config);
			return Promise.seq(this._processors, new Model(config));
		},

		destroy: function () {
			// XXX: anything to do?
		}
	});
});
