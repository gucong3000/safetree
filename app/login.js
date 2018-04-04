"use strict";
const request = require("./request");
const url = require("url");

async function login (userName, password) {
	if (!userName) {
		throw new Error("用户名不得为空");
	}
	password = password || "123456";
	const info = await speciallogin(userName, password);
	if (info.baseurl.includes(location.host)) {
		if (location.pathname !== "/MainPage.html") {
			const style = document.querySelector("head style:last-of-type");
			const loc = "/MainPage.html";
			const html = await request.get(loc);
			history.pushState(info, "安全教育平台", loc);
			document.write(html);
			document.documentElement.firstChild.appendChild(style);
		}
		window.$(".header-top .header-left~*:contains('欢迎')").html("欢迎您，" + info.truename);
	} else {
		location.href = url.resolve(info.baseurl, "/MainPage.html#" + userName);
	}
	return info;
};

async function speciallogin (userName, password) {
	const result = {};
	const data = await request.getJSON(location.host.replace(/^\w+/, "//speciallogin") + "/SpecialLoginHandler.asmx/SpecialLogin?jsoncallback=?", {
		account: userName,
		password,
		r: Math.random()
	});
	if (+data.userid >= 0) {
		Object.assign(result, data);
	}

	const info = await getUserInfo();

	if (info.username === userName) {
		Object.assign(result, info);
	}

	if (+result.userid >= 0) {
		return result;
	}

	throw Object.assign(new Error(userName + " 登录失败！"), data);
}

const apiGetUserInfo = "/Education/Special.asmx/GetUserInfo?jsoncallback=?";

async function getUserInfo (apiUrl) {
	const result = await request.getJSON(apiUrl || apiGetUserInfo, {
		r: Math.random()
	});
	if (+result.userid > 0) {
		return result;
	}
	if (!apiUrl) {
		return getUserInfo(url.resolve(result.baseurl, apiGetUserInfo));
	}
}

module.exports = login;
