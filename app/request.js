"use strict";
["post", "get", "getJSON", "ajax"].forEach(fnName => {
	module.exports[fnName] = function (url, data) {
		data = Object.assign({
			numPerPage: 999,
			pagesize: 999
		}, data);
		return new Promise((resolve, reject) => {
			window.$[fnName](url, data).then(resolve, reject);
		});
	};
});
