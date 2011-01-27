// configure requirejs
require({
    baseUrl: "../",
    packages: [
        {
            name: "compose",
            location: "support/compose/lib",
            lib: ".",
            main: "compose"
        },
        {
            name: "patr",
            location: "support/patr/lib",
            lib: ".",
            main: "runner"
        },
        {
            name: "twine",
            location: "lib",
            lib: ".",
            main: "Twine"
        },
        {
            name: "promised-io",
            location: "support/promised-io/lib",
            lib: "."
        }
    ],
    paths: {
        promise: "support/promised-io/lib/promise",
        events: "support/uber/src/events",
        has: "support/has.js/has",
        require: "support/requirejs/require"
    }
}, 
[
    'patr',
    './Kernel.js'
], 
function (patr, Kernel) {
    patr.run({
        testKernel: Kernel
    });    
});