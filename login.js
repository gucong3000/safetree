"use strict";
const request = require("./request");

module.exports = function (userName, password) {
	if (!userName) {
		throw new Error("用户名不得为空");
	}
	password = password || "123456";
	return speciallogin(userName, password).then(info => {
		if ("/MainPage.html" !== location.pathname) {
			const url = "/MainPage.html";
			return request.get(url).then(html => {
				const style = document.querySelector("head style:last-of-type");
				history.pushState(info, "安全教育平台", url);
				document.write(html);
				if (style) {
					document.documentElement.firstChild.appendChild(style);
				}
				return info;
			});
		} else {
			const nameWrap = document.querySelector(".header-top .header-left+*");
			if (nameWrap) {
				nameWrap.innerHTML = "欢迎你，" + info.truename;
			}
		}
		return info;
	});
};

function speciallogin(userName, password) {
	return request.getJSON("//speciallogin.safetree.com.cn/SpecialLoginHandler.asmx/SpecialLogin?jsoncallback=?", {
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
