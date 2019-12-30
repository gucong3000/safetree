"use strict";
const login = require("./login");
const load = require("./load");
const request = require("./request");
const logger = require("./logger");
const $ = window.$;
const reActivity = /\/SystemActivityManage\/(\d+)\/.*$/i;

function getVacationWork (title) {
	let urlPrefix;
	let expiredMonth;
	// window.open("//huodong." + host.join('.') + "/summer2018/index.html");
	// window.open("//huodong." + host.join('.') + "/Winter2017/index.html");
	if (/暑假/.test(title)) {
		urlPrefix = "https://huodong.xueanquan.com/summer";
		expiredMonth = 8;
	} else if (/寒假/.test(title)) {
		urlPrefix = "https://huodong.xueanquan.com/Winter";
		expiredMonth = 2;
	} else {
		return;
	}
	const now = new Date();
	const fullYear = now.getFullYear();
	const jobYaar = /(\d+)年/.test(title) ? RegExp.$1 : fullYear;

	return {
		expired: fullYear * 100 + now.getMonth() >= jobYaar * 100 + expiredMonth,
		url: urlPrefix + jobYaar + "/",
		title,
	};
}

const teacher = {
	login: function (userName, password) {
		if (teacher.data) {
			return Promise.resolve(teacher.data);
		}
		logger.log("教师正在登陆。", userName);
		return login(userName, password).then(info => {
			teacher.data = info;
			localStorage.setItem("teacher_user_name", userName);
			return info;
		});
	},
	getUnfinishedStudents: function (url) {
		return request.post(url).then(html => {
			return $(html).find("tr").filter((i, tr) => {
				return !tr.children[3].innerText.trim();
			}).map((i, tr) => {
				return tr.children[1].innerText.trim();
			}).toArray();
		});
	},
	getHomeWorkUrls: function () {
		if (!teacher.homeWorkUrls) {
			teacher.homeWorkUrls = load("/JiaTing/JtMyHomeWork.html");
		}
		return teacher.homeWorkUrls;
	},
	getUnfinishedWorks: function () {
		logger.log("教师正在检查未完成的普通作业。");
		return request.get("/EduAdmin/SkillCondition/SkillInfo?s1=2&s2=-1").then(html => {
			const works = {};
			$(html).find("tr").filter((i, tr) => {
				return !/<td>\s+(?:--|100(?:\.0+)?%)\s+<\/td>/.test(tr.innerHTML);
			}).each((i, tr) => {
				const links = tr.querySelectorAll("a[href]");
				if (links && links.length > 1) {
					const title = tr.children[1].innerText.trim();
					const id = links[0].getAttribute("href").replace(/^.+?(\d+)$/, "$1");
					const checkUrl = links[links.length - 1].getAttribute("href");
					works[checkUrl] = {
						title,
						id,
					};
				}
			});
			return works;
		});
	},
	getSpecial: async function (url) {
		return $(await request.post(url)).find("tr").toArray()
			.filter(
				tr => Array.from(tr.children).some(
					td => td.innerText.trim() === "未完成",
				),
			).map(
				tr => tr.children[1].innerText.trim(),
			);
	},
	getSpecials: function () {
		if (teacher.specials) {
			return teacher.specials;
		}

		teacher.specials = teacher.login().then(async () => {
			logger.log("教师正在检查未完成的专题作业。");
			const html = await request.get("/EduAdmin/Home/Index");
			const links = $(html).find("#sidebar li:contains('专题课开展情况') li a[href], #sidebar a:contains('安全第一课'), #sidebar a:contains('119'), #sidebar a:contains('122'), #sidebar a:contains('415'), #sidebar a:contains('专题'), #sidebar a:contains('寒假'), #sidebar a:contains('暑假')").toArray();
			const works = {};
			await Promise.all(links.map(async link => {
				let title = (link.title || link.innerText).trim().replace(/^第(\d+).+?$/, "$1");
				let url = link.getAttribute("href");
				if (url === "#" || /^javascript:/i.test(url)) {
					return;
				}
				if (reActivity.test(url)) {
					const text = $(await request.get(url)).find("table a:not(:contains('查看'))").text();
					title = (text && text.trim()) || title;
					url = url.replace(reActivity, "/ActivityNoticeReplayToStudent/0/$1");
				}

				return teacher.getSpecial(url).then(names => {
					if (names.length) {
						works[title] = names;
					}
				});
			}));

			return works;
		});

		return teacher.specials;
	},
	getWorks: function () {
		if (teacher.works) {
			return teacher.works;
		}
		teacher.works = (async () => {
			await teacher.login();
			const unfinishedWorks = await teacher.getUnfinishedWorks();
			const works = {};
			function addWork (name, work) {
				if (works[name]) {
					works[name].push(work);
				} else {
					works[name] = [work];
				}
			}

			await Promise.all(Object.keys(unfinishedWorks).map(async url => {
				const work = unfinishedWorks[url];
				logger.log("老师正在检查《" + work.title + "》的完成情况");
				const names = await teacher.getUnfinishedStudents(url);
				const urls = await teacher.getHomeWorkUrls();
				work.url = urls[work.id];
				names.forEach(name => addWork(name, work));
			}));

			const specials = await teacher.getSpecials();

			await Promise.all(Object.keys(specials).map(async id => {
				const urls = await teacher.getHomeWorkUrls();
				let work = urls.specials[id];
				if (!work) {
					const title = id.replace(/^\d*(.*?)专题$/, "$1");
					work = Object.keys(urls.specials).map(
						id => urls.specials[id],
					).find(work => !work.expired && work.title.includes(title)) || getVacationWork(title);
				}
				if (work) {
					if (work.expired) {
						logger.log(`专题作业《${work.title}》已过期，跳过`);
						return;
					}

					specials[id].forEach(name => {
						addWork(name, work);
					});
				}
			}));
			logger.log("作业未完成情况统计：", works);
			return works;
		})();

		return teacher.works;
	},
	getStudents: function () {
		if (teacher.students) {
			return teacher.students;
		}
		teacher.students = teacher.login().then(() => {
			return request.post("/EduAdmin/ClassManagement/ClassManagement").then(html => {
				const students = {};
				$(html).find("tr[rel]").filter((i, tr) => {
					let id;
					let name;
					let account;
					$(tr.children).each((i, td) => {
						const value = td.innerText.trim();
						if (value) {
							if (value.includes("重置密码")) {
								id = td.children[0].href.replace(/^.+?studentid=/i, "");
							} else if (!id && /^\d+$/.test(value)) {
								id = value;
							} else if (!account && /^\w+$/.test(value)) {
								account = value;
							} else if (!name) {
								name = value;
							}
						}
					});
					if (account && name) {
						students[name] = {
							id,
							account,
						};
					}
				});
				return students;
			});
		});
		return teacher.students;
	},
};

module.exports = teacher;
