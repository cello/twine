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

define(['compose', 'patr/assert', 'twine', 'twine/Kernel'],
function (compose, assert, Twine, Kernel) {
    function initCalls(obj) {
        obj._calls = {};
        Object.keys(obj).forEach(function (key) {
            if (typeof obj[key] === 'function') {
                obj._calls[key] = [];
            }
        });
    }

    var kernel = {
            addFiber: function () {
                this._calls.addFiber.push({
                    args: arguments
                });
            },
            destroy: function () {
                this._calls.destroy.push({
                    args: arguments
                });
            },
            ran: function (it) {
                var calls = this._calls[it];
                return calls && calls.length > 0;
            },
            reset: function () {
                initCalls(this);
            }
        },
        MockRequire = compose(function MockRequire() {
            var original = require,
                mock = this;

            this.original = function () {
                return original;
            };
            initCalls(this);

            require = function () {
                mock.require.apply(mock, arguments);
            };
        }, {
            require: function () {
                this._calls.require.push({
                    args: arguments
                });

                this.original().apply(null, arguments);
            },
            restore: function () {
                require = this.original();
            }
        }),
        name = 'test container',
        container;

    function setUp() {
        if (container) {
            container.destroy();
        }

        kernel.reset();
        container = new Twine({
            name: name,
            kernel: kernel
        });
    }

    return {
        'test twine assigns a default name and kernel': function () {
            var c = new Twine();
            assert.ok(c.name, 'twine should assign a default name if none was given');
            assert.ok(/^twine_\d+$/.test(c.name), 'name should be a default name');
            assert.ok(c.kernel, 'twine should create a kernel');
            assert.ok(c.kernel instanceof Kernel, 'kernel should be default kernel');
        },
        'test twine accepts a name and kernel': function () {
            setUp();

            assert.strictEqual(container.name, name, 'twine should accept a name via constructor');
            assert.strictEqual(container.kernel, kernel, 'twine should accept kernel');
        },
        'test addFiber calls the kernel': function () {
            setUp();
            var fiber = {
                init: function () {},
                terminate: function () {}
            };

            container.addFiber('id', fiber);

            assert.ok(kernel.ran('addFiber'));
        },
        'test an empty configure object won\'t break the container': function () {
            // XXX: incomplete...
            var config = {},
                mockRequire = new MockRequire();

            setUp();
            container.configure(config);

            mockRequire.restore();
        }
    };
});