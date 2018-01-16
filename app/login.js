"use strict";
const request = require("./request");

module.exports = function (userName, password) {
	if (!userName) {
		throw new Error("用户名不得为空");
	}
	password = password || "123456";
	return speciallogin(userName, password).then(info => {
		if (info.baseurl.includes(location.host)) {
			if (location.pathname === "/MainPage.html") {
				const nameWrap = document.querySelector(".header-top .header-left+*");
				if (nameWrap) {
					nameWrap.innerHTML = "欢迎你，" + info.truename;
				}
			} else {
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
			}
		} else {
			location.href = info.baseurl + "/MainPage.html#" + userName;
		}
		return info;
	});
};

function speciallogin (userName, password) {
	return request.getJSON("//speciallogin.safetree.com.cn/SpecialLoginHandler.asmx/SpecialLogin?jsoncallback=?", {
		account: userName,
		password,
		r: Math.random()
	}).then(data => {
		if (+data.userid >= 0) {
			return getUserInfo().then(info => (
				Object.assign(data, info)
			));
		}
		throw data;
	});
}

function getUserInfo () {
	return request.getJSON("/Education/Special.asmx/GetUserInfo?jsoncallback=?", {
		r: Math.random()
	});
}
