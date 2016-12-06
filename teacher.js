const login = require("./login");
const request = require("./request");
const $ = window.$;
const teacher = {
	login: function(userName, password) {
		if (teacher.data) {
			return teacher.data;
		}
		console.log("教师正在登陆。");
		teacher.data = login(userName || "zhaoling4004", password).then(data => teacher.data = data);
		return teacher.data
	},
	getUnfinishedStudents: function(url) {
		return request.post(url).then(html => {
			return $(html).find("tr").filter((i, tr) => {
				return !tr.children[3].innerText.trim();
			}).map((i, tr) => {
				return tr.children[1].innerText.trim();
			}).toArray();
		});
	},
	getUnfinishedWorks: function() {
		return request.get("/EduAdmin/SkillCondition/SkillInfo?s1=2&s2=-1").then(html => {
			const works = {};
			$(html).find("tr").filter((i, tr) => {
				return !/<td>\s+(?:--|100(?:\.0+)?%)\s+<\/td>/.test(tr.innerHTML);
			}).each((i, tr) => {
				let links = tr.querySelectorAll("a[href]");
				if (links && links.length > 1) {
					const title = tr.children[1].innerText.trim();
					const url = links[0].getAttribute("href").replace(/^.+?(\d+)$/, "http://chengdu.safetree.com.cn/JiaTing/EscapeSkill/SeeVideo.aspx?gid=486&li=$1");
					const checkUrl = links[links.length - 1].getAttribute("href");
					works[checkUrl] = {
						title,
						url,
					};
				}
			});
			return works;
		});
	},
	getSpecial: function() {
		request.get("/EduAdmin/SkillCondition/SkillInfo?s1=2&s2=-1").then(html => {
			return $(html).find("#sidebar li:contains('专题课开展情况') > ul > li > a[href]").map(a => a.getAttribute("href")).toArray();
		}).then(links => {
			console.log(links);
		});
	},
	getWorks: function() {
		if (teacher.works) {
			return teacher.works;
		}
		teacher.works = teacher.login().then(() => {
			console.log("教师正在检查未完成的作业。");
			return teacher.getUnfinishedWorks();
		}).then(unfinishedWorks => {
			var works = {};

			function addWork (name, work) {
				if(works[name]) {
					works[name].push(work);
				} else {
					works[name] = [work];
				}
			}

			return Promise.all(Object.keys(unfinishedWorks).map(url => {
				const work = unfinishedWorks[url];
				console.log("老师正在检查《" + work.title + "》的完成情况");
				return teacher.getUnfinishedStudents(url).then(names => {
					names.forEach(name => addWork(name, work.url));
				});
			})).then(() => {
				console.log("作业未完成情况统计：", works);
				return works;
			});
		});

		return teacher.works;
	},
	getStudents: function() {
		if (teacher.students) {
			return teacher.students;
		}
		teacher.students = teacher.login().then(() => {
			return request.post("/EduAdmin/ClassManagement/ClassManagement").then(html => {
				const students = {};
				$(html).find("tr[rel]").filter((i, tr) => {
					let name;
					let id;
					$(tr.children).each((i, td) => {
						const value = td.innerText.trim();
						if (/^\d+$/.test(value)) {
							return;
						}
						if (/^\w+$/.test(value)) {
							id = value;
						} else if(!name) {
							name = value;
						}
					});
					if (id && name) {
						students[name] = id;
					} else {
						// console.log(i, id);
					}
				});
				return students;
			});
		});
		return teacher.students;
	}
}

module.exports = teacher;
