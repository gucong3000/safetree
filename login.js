const request = require("./request");
const cache = {};
const login = function(userName, password) {
	if(cache[userName]) {
		return cache[userName];
	}
	// userName = localStorage.getItem(userName) || userIdMap[userName] || userName;
	password = password || "123456";
	cache[userName] = request.getJSON("/LoginHandler.ashx?jsoncallback=?", {
		userName,
		password,
		checkcode: 1,
		type: "login",
		loginType: "1",
		r: Math.random()
	}).then(json => {
		if (json.ret == 1) {
			// localStorage.setItem(json.data.TrueName, json.data.UserName)
			return json.data;
		} else {
			throw json;
		}
	});
	return cache[userName];
}

module.exports = login;
