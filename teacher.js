const login = require('./login');
const load = require('./load');

const teacher = {
	login: function(userName, password) {
		console.log("教师正在登陆。");
		return login(userName || "zhaoling4004", password).then(data => teacher.data = data);
	},
	getWorks: function() {
		if (teacher.works) {
			return Promise.resolve(teacher.works);
		}
		return teacher.login().then(()=>{
			console.log("教师正在检查未完成的作业。");
			return load("/EduAdmin/SkillCondition/SkillInfo?s1=2&s2=-1");
		}).then(qsa => {
			var works = {};

			function addWork (name, work) {
				if(works[name]) {
					works[name].push(work);
				} else {
					works[name] = [work];
				}
			}

			return Promise.all(qsa("tr").map(tr => {
				if (/<td>\s+(?:--|100(?:\.0+)?%)\s+<\/td>/.test(tr.innerHTML)) {
					return 
				}
				let links = tr.querySelectorAll("a[href]");
				if (links && links.length > 1) {
					console.log("老师正在检查《" + tr.children[1].innerText.trim() + "》的完成情况");
					let workurl = links[0].getAttribute("href");
					// test[] = links[links.length - 1].getAttribute("href");
					return Promise.resolve($.post(links[links.length - 1].getAttribute("href"), {
						numPerPage: 99
					})).then(html => {
						$(html).find("tr").each((i, tr) => {
							if(!tr.children[3].innerText.trim()) {
								addWork(tr.children[1].innerText.trim(), workurl);
							}
						});
					})
				}
			})).then(() => {
				console.log("作业未完成情况统计：", works);
				teacher.works = works;
				return works;
			});
		});
	}
}

module.exports = teacher;