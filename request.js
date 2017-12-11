"use strict";
["post", "get", "getJSON", "ajax"].forEach(fnName => {
	module.exports[fnName] = function (url, data, cont) {
		data = Object.assign({
			numPerPage: 999,
			pagesize: 999
		}, data);
		return new Promise((resolve, reject) => {
			setTimeout(reject, 6000);
			window.$[fnName](url, data).then(resolve);
		}).catch(() => {
			if (cont > 3) {
				throw new Error("ajax失败:", url, data);
			}
			return module.exports[fnName](url, data, cont ? ++cont : 1);
		});
	};
});
