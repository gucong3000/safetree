"use strict";
const jQuery = require("jquery");

["post", "get", "getJSON", "ajax"].forEach(fnName => {
	module.exports[fnName] = function (url, data) {
		data = Object.assign({
			numPerPage: 999,
			pagesize: 999,
		}, data);
		return Promise.resolve(
			jQuery[fnName](url, data)
		).catch(ex => {
			const error = new Error("Ajax: " + url);
			error.url = url;
			error.data = data;
			throw error;
		});
	};
});
