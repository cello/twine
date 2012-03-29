var profile = (function () {
	var jsFile = /\.js$/;

	return {
		resourceTags: {
			amd: function (filename) {
				return jsFile.test(filename);
			},
			ignore: function (filename, mid) {
				return !jsFile.test(filename) || /\/build\//.test(mid);
			},
			test: function () {
				return false;
			}
		}
	};
}());
