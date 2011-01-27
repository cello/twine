define(['patr/assert', 'twine/Kernel'], function (assert, Kernel) {
    var kernel,
        fiber = {
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
            kernel.addFiber('test', fiber);
            assert.ok(fiber.initialized, 'fiber should be initialized when added to kernel');
        },
        'test fiber is terminated when kernel is destroyed': function () {
            setUp();
            kernel.addFiber('test', fiber);
            kernel.destroy();
            assert.ok(fiber.dead, 'fiber should be terminated when kernel is destroyed');
        },
            
        'test fibers cannot be added with duplicate names': function () {
            setUp();
            kernel.addFiber('dup', fiber);
            assert.throws(function () {
                kernel.addFiber('dup', fiber);
            }, Error, 'duplicate fibers should throw');
        },
        
        'test event is emitted when fiber is added': function () {
            var fired = false;
            
            setUp();
            kernel.on('fiberAdded', function (f) {
                fired = true;
                assert.strictEqual(f, fiber, 'fiber should be passed to fiberAdded event');
            });
            
            kernel.addFiber('test', fiber);
            assert.ok(fired, 'kernel should fire a fiberAdded event when a fiber is added');
        }
    };
});
