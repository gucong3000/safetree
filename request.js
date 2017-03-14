"use strict";
["post", "get", "getJSON", "ajax"].forEach(fnName => {
	module.exports[fnName] = function(url, data) {
		data = Object.assign({
			numPerPage: 999,
			pagesize: 999,
		}, data);
		return Promise.resolve(window.$[fnName](url, data));
	};
});
