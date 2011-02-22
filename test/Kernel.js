/**
 * @license Copyright (c) 2011 Cello Software, LLC.
 * All rights reserved.
 * Available via the new BSD License.
 */
/*jshint
    bitwise: false, curly: true, eqeqeq: true, forin: true, immed: true, indent: 4, maxlen: 100,
    newcap: true, noarg: true, noempty: true, onevar: true, passfail: false, undef: true,
    white: true
*/
/*global define: false, require: false */

define(['patr/assert', 'twine/Kernel', 'twine/util/error'], function (assert, Kernel, error) {
	var kernel,
		fiber = {
			id: 'test',
			init: function () {
				this.initialized = true;
			},
			terminate: function () {
				this.dead = true;
			}
		};

	function setUp() {
		if (kernel) {
			kernel.destroy();
		}

		kernel = new Kernel();
		fiber.initialized = false;
		fiber.dead = false;
	}

	return {
		'test fiber is initialized when added': function () {
			setUp();
			kernel.addFiber(fiber);
			assert.ok(fiber.initialized, 'fiber should be initialized when added to kernel');
		},
		'test fiber is terminated when kernel is destroyed': function () {
			setUp();
			kernel.addFiber(fiber);
			kernel.destroy();
			assert.ok(fiber.dead, 'fiber should be terminated when kernel is destroyed');
		},

		'test fibers cannot be added with duplicate names': function () {
			setUp();
			kernel.addFiber(fiber);
			assert.throws(function () {
				kernel.addFiber(fiber);
			}, error.FiberAlreadyExists, 'duplicate fibers should throw');
		},

		'test event is emitted when fiber is added': function () {
			var fired = false;

			setUp();
			kernel.on('fiberAdded', function (f) {
				fired = true;
				assert.strictEqual(f, fiber, 'fiber should be passed to fiberAdded event');
			});

			kernel.addFiber(fiber);
			assert.ok(fired, 'kernel should fire a fiberAdded event when a fiber is added');
		}
	};
});
