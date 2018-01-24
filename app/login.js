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
				window.$(".header-top .header-left~*:contains('欢迎')").html("欢迎您，" + info.truename);
			} else {
				const url = "/MainPage.html";
				return request.get(url).then(html => {
					const style = document.querySelector("head style:last-of-type");
					history.pushState(info, "安全教育平台", url);
					document.write(html.replace(/\s*<script\b.*?>[\s\S]*?<\/script>/ig, ""));
					if (style) {
						document.documentElement.firstChild.appendChild(style);
					}
				}).catch(() => {}).then(() => {
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
		throw new Error(userName + " 登录失败！");
	});
}

function getUserInfo () {
	return request.getJSON("/Education/Special.asmx/GetUserInfo?jsoncallback=?", {
		r: Math.random()
	});
}
