// Credit: this is derived from a combination of
//	- https://gist.github.com/650000
//	- https://github.com/joyent/node/pull/350
//	- https://github.com/ajaxorg/cloud9/blob/master/support/requireJS-node.js

var path = require('path'),
	fs = require('fs'),
	defaultCompile = module.constructor.prototype._compile,
	defaultResolveFilename = module.constructor._resolveFilename,
	// this gives the main module a chance to use define iff it does so before any other module
	currentModule = require.main,
	leadingDot = /^\./,
	leadingSlash = /^\//,
	pluginMatch = /^([^!]*)!(.*)/,
	defaultInjects = ['require', 'exports', 'module'],
	// id -> package mapping (lib, path, main)
	packageMap = {},
	// id -> path
	pathMap,
	baseUrl = process.cwd();

function tryJsonFile(base, name) {
	try {
		var contents = fs.readFileSync(path.resolve(base, name), 'utf8');
		return JSON.parse(contents);
	}
	catch(e) {}
}

// try to find paths.json in either the cwd or as a sibling to this file
// paths.json is just a simple mapping of id to root dir of a package.
// the root dir of the package can be specified as an absolute url or as
// a url that is relative to paths.json - for example, paths.json:
//	{
//		"patr": "patr",
//		"promised-io": "promised-io",
//		"sinon": "sinon"
//	}
// all of these mappings indicate that they are siblings of paths.json
//
//	require('patr/runner'); // -> is resolved using the mapping above
//		- a mapping for patr is found,
//		- then it applies any directory mapping for lib found in patr/package.json
//		- then it resolves "runner" relative to the patr lib.
//
//
//	require('patr'); // -> is resolved using the mapping above
//		- a mapping for patr is found,
//		- then any mapping for main found is patr/package.json is used
pathMap = tryJsonFile(baseUrl, 'paths.json');
if (!pathMap) {
	baseUrl = __dirname;
	pathMap = tryJsonFile(baseUrl, 'paths.json');
}
if (pathMap) {
	Object.keys(pathMap).forEach(function (id) {
		var p = pathMap[id];
		if (!leadingSlash.test(p)) {
			pathMap[id] = path.join(baseUrl, p);
		}
	});
}
else {
	baseUrl = process.cwd();
}

function findUrl(pkg, mod) {
	// see if a mapping was provided in paths.json
	var pathMapping = pathMap[pkg],
		pkgMapping = packageMap[pkg] || {},
		pkgJson;

	if (pathMapping) {
		// see if we've searched for the package.json yet
		if (!(pkg in packageMap)) {
			pkgJson = tryJsonFile(pathMapping, 'package.json');
			if (pkgJson) {
				// these will default to pathMapping if not specified in package.json
				pkgMapping.main = path.join(pathMapping, pkgJson.main);
				pkgMapping.lib = path.join(pathMapping,
					pkgJson.directories && pkgJson.directories.lib);
			}
			// no package.json so default to pathMapping and let node figure it out
			else {
				pkgMapping.main = pkgMapping.lib = pathMapping;
			}
			// ensure that we don't look for package.json again
			packageMap[pkg] = pkgMapping;
		}
		// if mod was provided, join mod with lib path else use main
		return mod ? path.join(pkgMapping.lib, mod) : pkgMapping.main;
	}
	if (!~pkg.indexOf('/')) {
		return path.join(pkg, mod);
	}
	return '';
}

function nameToUrl(name) {
	name = path.normalize(name);
	var mod = path.extname(name) && path.basename(name),
		pkg = mod ? path.dirname(name) : name,
		url;

	while (!url) {
		url = findUrl(pkg, mod);
		mod = path.join(path.basename(pkg), mod);
		pkg = path.dirname(pkg);
	}
	return url;
}

// wrap compile to get a reference to the currentModule
module.constructor.prototype._compile = function() {
	currentModule = this;
	try{
		return defaultCompile.apply(this, arguments);
	}
	finally {
		currentModule = null;
	}
};

// wrap resolveFilename to intercept the request
module.constructor._resolveFilename = function (request, parent) {
	if (!(leadingSlash.test(request) || leadingDot.test(request))) {
		request = nameToUrl(request);
	}
	return defaultResolveFilename.call(this, request, parent);
};


global.define = function (id, injects, factory) {
	if (currentModule === null) {
		throw new Error("define() may only be called during module factory instantiation");
	}

	var returned,
		module = currentModule,
		req = function(dep, cb){
			var chunks, ret;

			// load callback for plugins
			function load(resource) {
				ret = resource;
			}

			// handle require(['a', 'b'], function (a, b) { ... })
			if (Array.isArray(dep)) {
				return cb.apply(this, dep.map(req));
			}

			// handle plugin dependencies
			chunks = dep.match(pluginMatch);
			if (chunks) {
				// pass control to the plugin - NOTE: it needs to call load synchronously
				req(chunks[1]).load(chunks[2], req, load);
				return ret;
			}

			return require(req.toUrl(dep));
		};

	req.toUrl = function (dep) {
		// if the first char is a '.' need to calculate relative ids
		if (leadingDot.test(dep)) {
			// join dep with currentModule's dirname
			return path.join(module === require.main ? baseUrl : path.dirname(module.id), dep);
		}

		// if the first char is a '/' it is an absolute id
		if (leadingSlash.test(dep)) {
			return dep;
		}

		// anything else may need to be mapped
		return nameToUrl(dep);
	};


	// parse arguments
	if (!factory) {
		// two or less arguments
		factory = injects;
		if (factory) {
			// two args
			if (typeof id === "string") {
				// handle define("/some/path/to/this/module.js", function () { ... });
				if (id !== module.id) {
					throw new Error("Can not assign module to a different id than the current file");
				}
				// default injects
				injects = defaultInjects;
			}
			else {
				// anonymous, deps included
				// handle define(['a', 'b'], function (a, b) { ... })
				injects = id;
			}
		}
		else {
			// only one arg, just the factory or object
			// handle define(function () { ... })
			// OR define({ ... })
			factory = id;
			injects = defaultInjects;
		}
	}

	if (typeof factory !== "function"){
		// can provide just a plain object
		module.exports = factory;
	}
	else {
		returned = factory.apply(module.exports, injects.map(function (injection) {
			switch (injection) {
				// check for CommonJS injection variables
				case "require": return req;
				case "exports": return module.exports;
				case "module": return module;
				default:
				// a module dependency
				return req(injection);
			}
		}));
		if(typeof returned !== "undefined"){
			// since AMD encapsulates a function/callback, allow the factory to return the exports.
			module.exports = returned;
		}
	}
};