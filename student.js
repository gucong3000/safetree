"use strict";
const login = require("./login");
const teacher = require("./teacher");
const load = require("./load");
const logger = require("./logger");

module.exports = function (name) {
	const student = {
		name: name,
		login: function(password) {
			if (student.data) {
				return student.data;
			}
			logger.log(name + "正在登陆。");
			student.data = teacher.getStudents().then(students => {
				// 跟老师查询自己的登陆名
				const userName = students[name];
				return login(userName, password);
			});
			return student.data;
		},
		doWorks: function() {
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
		doWork: function(work, data) {
			logger.log(name + "正在完成作业项：" + work.title);
			return load(work.url, data).catch(ex => {
				logger.error(name, "未能完成作业", work.title, "请稍后重试", ex);
			});
		}
	};
	return student;
};
