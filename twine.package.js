var profile = (function () {
	var jsFile = /\.js$/;

	return {
		resourceTags: {
			amd: function (filename) {
				return jsFile.test(filename);
			},
			ignore: function (filename) {
				return !jsFile.test(filename);
			},
			test: function () {
				return false;
			}
		}
	};
}());
