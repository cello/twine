/**
 * @license Copyright (c) 2011 Cello Software, LLC.
 * All rights reserved.
 * Available via the new BSD License.
 */
/*jshint
	asi: false, bitwise: false, boss: false, curly: true, eqeqeq: true, eqnull: false, es5: true,
	evil: false, expr: true, forin: true, globalstrict: false, immed: true, indent: 4, latedef: true,
	laxbreak: false, loopfunc: true, maxlen: 100, newcap: true, noarg: true, noempty: true,
	nonew: true, nomen: false, onevar: true, passfail: false, plusplus: false, shadow: false,
	strict: false, sub: false, trailing: true, undef: true, white: true
*/
/*global define: false, require: false*/

define([
	'../support/compose',
	'./Model',
	'../lifecycle/Manager'
], function (compose, Model, LifecycleManager) {
	'use strict';
	return compose(function ModelBuilder(kernel) {
		this._processors = [];
		this.kernel = kernel;

		// add the lifecycle manager
		this.addProcessor(new LifecycleManager());
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

			function next(m) {
				// allow a processor to replace the model
				model = m || model;
				var processor = processors[current++];
				return processor ? processor.process(model, next) || model : model;
			}

			return next();
		},

		destroy: function () {}
	});
});
