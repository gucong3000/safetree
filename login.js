const request = require("./request");
const dialogs = require("./dialogs");
const cache = {};

function login(userName, password) {
	if(cache[userName]) {
		return Promise.resolve(cache[userName]);
	}
	const promise = dialogs.prompt("请输入验证码").then(checkcode => {
		// userName = localStorage.getItem(userName) || userIdMap[userName] || userName;
		password = password || "123456";
		return request.getJSON("/LoginHandler.ashx?jsoncallback=?", {
			userName,
			password,
			checkcode,
			type: "login",
			loginType: "1",
			r: Math.random()
		});
	}).then(json => {
		if (json.ret === 1) {
			// localStorage.setItem(json.data.TrueName, json.data.UserName)
			return cache[userName] = json.data;
		} else if (json.msg) {
			return dialogs.alert(json.msg).then(() => {
				return login(userName, password);
			});
		} else {
			throw json;
		}
	});
	const icon = document.querySelector(".prompt .icon");
	icon.style.display = "block";
    icon.style.margin = "auto";
    icon.style.position = "relative";
	icon.style.width = "auto";
	icon.src = "/checkcode.aspx?codetype=1&r=" + Math.random();
	return promise;
}

module.exports = login;
