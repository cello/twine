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
	'../support/lang',
	'../support/promise',
	'../support/array'
], function (compose, lang, promise, arr) {
	'use strict';

	function ChildrenFiber() {
		this._listeners = [];
	}

	return compose(ChildrenFiber, {
		id: 'Children Fiber',

		init: function (kernel) {
			var fiber = this;

			fiber.kernel = kernel;

			fiber._listeners.push(kernel.modelRegistry.on('modelAdded', function (model) {
				// if the model has children or a parent then add a commissioner
				if ((model.children && model.children.length) || model.parent) {
					model.addCommissioner(fiber);
				}
			}));
		},

		commission: function (instance, model) {
			var kernel = this.kernel,
				children = model.children,
				parent = model.parent;

			if (instance) {
				// ensure we have children in the model and an addChild on the instance
				if (children && children.length && instance.addChild) {
					// resolve the children whenever this model is resolved and
					// add the children via instance.addChild
					return promise.when(promise.all(arr.map(children, function (child) {
						return kernel.resolve(child);
					})), function (children) {
						arr.forEach(children, function (child) {
							instance.addChild(child);
						});
						return instance;
					});
				}

				if (parent) {
					// whenever this model is resolved, resolve parent and
					// add it to parent via parent.addChild
					return promise.when(kernel.resolve(parent), function (parent) {
						if (parent.addChild) {
							parent.addChild(instance);
						}
						return instance;
					});
				}
			}
		},

		terminate: function () {
			// stop all the listeners
			arr.forEach(this._listeners, function (listener) {
				listener.remove();
			});
		}
	});
});
