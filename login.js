const request = require("./request");
const dialogs = require("./dialogs");

function login(userName, password) {
	if(sessionStorage.getItem(userName)) {
		return Promise.resolve(JSON.parse(sessionStorage.getItem(userName)));
	}
	const promise = dialogs.prompt("请输入验证码").then(checkcode => {
		if(!checkcode) {
			throw "用户取消了登录";
		}
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
			if(!sessionStorage.length) {
				request.get("/MainPage.html").then(html => {
					document.write(html)
				});
			}
			sessionStorage.setItem(userName, JSON.stringify(json.data));
			return json.data;
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
	try {
		document.querySelector("#UName").value = userName;
	} catch(ex) {

	}
	return promise;
}

module.exports = login;
