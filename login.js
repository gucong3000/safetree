"use strict";
const request = require("./request");

module.exports = function (userName, password) {
	password = password || "123456";
	if (userName) {
		try {
			document.querySelector("#UName").value = userName;
		} catch (ex) {
			//
		}
	}
	return speciallogin(userName, password).then(info => {
		if ("/MainPage.html" !== location.pathname) {
			const url = "/MainPage.html";
			const style = document.querySelector("head style:last-of-type");
			return request.get(url).then(html => {
				history.pushState(info, "安全教育平台", url);
				document.write(html);
				if (style) {
					document.documentElement.firstChild.appendChild(style);
				}
				return info;
			});
		}
		return info;
	});
};

function speciallogin(userName, password) {
	return request.getJSON("http://speciallogin.safetree.com.cn/SpecialLoginHandler.asmx/SpecialLogin?jsoncallback=?", {
		account: userName,
		password,
		r: Math.random()
	}).then(getUserInfo);
}

function getUserInfo(data) {
	if (+data.userid >= 0) {
		return request.getJSON("/Education/Special.asmx/GetUserInfo?jsoncallback=?", {
			r: Math.random()
		});
	}
	throw data;
}
