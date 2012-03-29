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
	'build/buildControl'
], function (bc) {
	'use strict';

	// TODO: use Twine with a custom kernel that will collect the list of deps

	function require() {
		throw new Error('require should not be called from an installer');
	}

	return function (resource) {
		var exports = {},
			module = {
				exports: exports
			},
			install;

		function simulatedDefine(id, deps, factory) {
			var arity = arguments.length,
				defaultArgs = [require, exports, module],
				ret,
				args;

			if (arity === 1) {
				// define(function () {})
				if (typeof id === 'function') {
					args = defaultArgs;
				}
				// define({})
				else {
					ret = id;
				}
			}

			if (arity > 1) {
				args =
					// define(id, function(){})
					arity === 2 && typeof id === 'string' ? defaultArgs :
					// define([], function(){})
					arity === 2 && Array.isArray(id) ? id :
					// define(id, [], function (){})
					deps;
			}

			factory = arguments[arity - 1];

			if (typeof factory === 'function') {
				if (args !== defaultArgs) {
					args = args.map(function (arg) {
						switch (arg) {
						case 'require':
							return require;
						case 'exports':
							return exports;
						case 'module':
							return module;
						default:
							return {};
						}
					});
				}
				ret = factory.apply(module.exports, args);
			}

			if (typeof ret !== 'undefined') {
				module.exports = exports = ret;
			}
		}

		function configure(config) {
			var fibers = config.fibers,
				installers = config.installers,
				components = config.components,
				deps = resource.deps;

			function processDep(dep) {
				var info = bc.getSrcModuleInfo(dep, resource),
					module = bc.resources[info.url];
				if (module) {
					deps.push(module);
				}
			}

			if (fibers) {
				fibers.forEach(processDep);
			}
			if (installers) {
				installers.forEach(processDep);
			}
			if (components) {
				components.forEach(function (component) {
					var dep = component.module;
					if (dep) {
						processDep(dep);
					}

					dep = component.lifestyle;
					if (dep) {
						processDep(dep);
					}
				});
			}
		}

		if (resource.tag.twineInstaller) {
			(new Function("define", resource.text))(simulatedDefine);
			install = exports.install;
			if (typeof install === 'function') {
				// call install with a dummy twine object
				install({
					configure: configure
				});
			}
			else {
				throw new Error('module tagged as "twineInstaller" but does not have an install function');
			}
		}
	};
});
