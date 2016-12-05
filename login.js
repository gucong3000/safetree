const querystring = require("querystring");
const userIdMap = require("./userIdMap.json");
module.exports = function(userName, password) {
	userName = localStorage.getItem(userName) || userIdMap[userName] || userName;
	password = password || "123456";
	return Promise.resolve($.getJSON("/LoginHandler.ashx?jsoncallback=?", {
		userName,
		password,
		checkcode: 1,
		type: 'login',
		loginType: '1',
		r: Math.random()
	})).then(json => {
		if (json.ret == 1) {
			localStorage.setItem(json.data.TrueName, json.data.UserName)
			return json.data;
		} else {
			throw json;
		}
	});
}