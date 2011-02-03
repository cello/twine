/**
 * @license Copyright (c) 2011 Cello Software, LLC.
 * All rights reserved.
 * Available via the new BSD License.
 */
/*jslint maxlen: 100, nomen: false, newcap: true, onevar: true, white: true, plusplus: false */
/*global define: false */

define(['compose', 'promise', 'array'], function (Compose, Promise, array) {
	return Compose(function ModelBuilder(kernel) {
		this.kernel = kernel;
		this._processors = [];
	}, {
		addProcessor: function (processor) {
			this._processors.push(function () {
				return processor.process.apply(processor, arguments);
			});
		},

		process: function (config) {
			// XXX: this will be the bare minimum needed for a component model
			var model = Compose.call({
				kernel: this.kernel
			}, config);

			// call the processors in sequence.  start with the model as the seed value
			// and return the final result after all processors have been applied.
			return Promise.seq(this._processors, model);
		}
	});
});
