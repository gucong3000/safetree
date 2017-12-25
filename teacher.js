"use strict";
const login = require("./login");
const load = require("./load");
const request = require("./request");
const logger = require("./logger");
const $ = window.$;

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
						id
					};
				}
			});
			return works;
		});
	},
	getSpecial: function (url) {
		return request.post(url).then(html => {
			return $(html).find("tr").filter((i, tr) => {
				return tr.children[2] && tr.children[2].innerText.trim() === "未完成";
			}).map((i, tr) => {
				return tr.children[1].innerText.trim();
			}).toArray();
		});
	},
	getSpecials: function () {
		if (teacher.specials) {
			return teacher.specials;
		}
		teacher.specials = teacher.login().then(() => {
			logger.log("教师正在检查未完成的专题作业。");
			return request.get("/EduAdmin/Home/Index");
		}).then(html => {
			return $(html).find("#sidebar li:contains('专题课开展情况') > ul > li > a[href]").toArray();
		}).then(links => {
			const works = {};
			return Promise.all(links.map(link => {
				return teacher.getSpecial(link.getAttribute("href")).then(names => {
					if (names.length) {
						works[link.innerText.trim().replace(/^第(\d+).+?$/, "$1")] = names;
					}
				});
			})).then(() => works);
		});
		return teacher.specials;
	},
	getWorks: function () {
		if (teacher.works) {
			return teacher.works;
		}
		teacher.works = teacher.login().then(() => {
			return teacher.getUnfinishedWorks();
		}).then(unfinishedWorks => {
			const works = {};

			function addWork (name, work) {
				if (works[name]) {
					works[name].push(work);
				} else {
					works[name] = [work];
				}
			}

			return Promise.all(Object.keys(unfinishedWorks).map(url => {
				const work = unfinishedWorks[url];
				logger.log("老师正在检查《" + work.title + "》的完成情况");
				return teacher.getUnfinishedStudents(url).then(names => {
					return teacher.getHomeWorkUrls().then(urls => {
						work.url = urls[work.id];
						names.forEach(name => addWork(name, work));
					});
				});
			})).then(
				teacher.getSpecials
			).then(specials => {
				if (Object.keys(specials).length) {
					return teacher.getHomeWorkUrls().then(urls => {
						Object.keys(specials).forEach(id => {
							const work = urls.specials[id];
							if (work.expired) {
								logger.log(`专题作业《${work.title}》已过期，跳过`);
								return;
							}

							specials[id].forEach(name => {
								addWork(name, work);
							});
						});
					});
				}
			}).then(() => {
				logger.log("作业未完成情况统计：", works);
				return works;
			});
		});

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
							if (!id && /^\d+$/.test(value)) {
								id = value;
							} else if (!account && /^\w+$/.test(value)) {
								account = value;
							} else if (!name) {
								name = value;
							}
						}
					});
					if (account && name) {
						students[name] = account;
					}
				});
				return students;
			});
		});
		return teacher.students;
	}
};

module.exports = teacher;
