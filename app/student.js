"use strict";
const login = require("./login");
const teacher = require("./teacher");
const load = require("./load");
const logger = require("./logger");
const request = require("./request");

module.exports = function (name) {
	const student = {
		name: name,
		login: (password) => {
			if (student.data) {
				return student.data;
			}
			student.data = teacher.getStudents().then(students => {
				// 跟老师查询自己的登陆名
				Object.assign(student, students[name]);
				logger.log(`${name}(${student.account})正在登陆。`);
				return login(student.account, password).catch(error => {
					student.data = null;
					throw error;
				});
			});
			return student.data;
		},
		doWorks: () => {
			return teacher.getWorks().then(works => {
				// 跟老师查询自己未做的作业
				works = works[name];
				if (!works) {
					return;
				}
				return student.login().then(data => {
					return Promise.all(works.map(work => (
						student.doWork(work, data)
					)));
				});
			});
		},
		doWork: (work, data) => {
			logger.log(name + "正在完成作业项：" + work.title);
			return load(work.url, data).catch(ex => {
				logger.error(name, "未能完成作业", work.title, "请稍后重试", ex);
			});
		},
		reset: async () => {
			return JSON.parse(await request.get("/EduAdmin/ClassManagement/StudentPassWordReset?studentid=" + student.id));
		},

	};
	return student;
};
