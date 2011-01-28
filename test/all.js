/**
 * @license Copyright (c) 2011 Cello Software, LLC.
 * All rights reserved.
 * Available via the new BSD License.
 */
/*jslint maxlen: 100, nomen: false, newcap: true, onevar: true, white: true, plusplus: false */
/*global define: false */

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
    './Twine',
    './Kernel'
],
function (patr, Twine, Kernel) {
    patr.run({
        testTwine: Twine,
        testKernel: Kernel
    });
});
