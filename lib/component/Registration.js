/**
 * @license Copyright (c) 2011 Cello Software, LLC.
 * All rights reserved.
 * Available via the new BSD License.
 */
/*jslint maxlen: 100, nomen: false, newcap: true, onevar: true, white: true, plusplus: false */
/*global define: false */

define(['compose'], function (Compose) {
	// component Registration Class
	return Compose(function Registration() {
		this.model = {};
	},{
		// define the config for the model
		fromConfig: function (config) {
			var model = this.model;
			model.config = config;
			if (!model.id) {
				model.id = config.id;
			}
		},
		// define the module for the model
		withModule: function (module) {
			this.model.module = module;
		},
		// register the model
		register: function (kernel) {
			kernel.addComponentModel(this.model);
		}
	});
});
