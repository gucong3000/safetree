const request = require("./request");
const dialogs = require("./dialogs");

function login(userName, password) {
	const promise = dialogs.prompt("请输入验证码").then(checkcode => {
		if(!checkcode) {
			throw "用户取消了登录";
		}
		// userName = localStorage.getItem(userName) || userIdMap[userName] || userName;
		return request.getJSON("/LoginHandler.ashx?jsoncallback=?", {
			userName,
			password,
			checkcode,
			type: "login",
			loginType: "1",
			r: Math.random()
		});
	}).then(json => {
		if (+json.ret === 1) {
			// sessionStorage.setItem(userName, JSON.stringify(json.data));
			return getUserInfo(getUserInfo);
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

module.exports = function (userName, password) {
	password = password || "123456";
	try {
		document.querySelector("#UName").value = userName;
	} catch(ex) {
		//
	}
	return speciallogin(userName, password).catch(() => {
		return login(userName, password);
	}).then(info => {
		const url = info.baseurl + "/MainPage.html";
		if(location.href === url) {
			return info;
		}
		return request.get(url).then(html => {
			history.pushState(info, "安全教育平台", url);
			document.write(html);
			return info;
		});
	});
};
// module.exports = login;

function speciallogin(userName, password) {
	return request.getJSON("http://speciallogin.safetree.com.cn/SpecialLoginHandler.asmx/SpecialLogin?jsoncallback=?", {
		account: userName,
		password,
		r: Math.random()
	}).then(getUserInfo);
}


function getUserInfo() {
	return request.getJSON("/Education/Special.asmx/GetUserInfo?jsoncallback=?", {
		r: Math.random()
	}).then(json => {
		if(+json.userid < 0) {
			throw json;
		}
		return json;
	});
}
