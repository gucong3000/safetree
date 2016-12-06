const login = require("./login");
const teacher = require("./teacher");
const load = require("./load");
module.exports = function (name) {
	const student = {
		name: name,
		login: function(password) {
			if (student.data) {
				return student.data;
			}
			console.log(name + "正在登陆。");
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
				return student.login().then(() => {
					return Promise.all(works.map(student.doWork));
				});
			});
		},
		doWork: function(url) {
			console.log(name + "正在完成作业项：" + url);
			return load(url, window => {
				if (window.ShowTestPaper) {
					window.getAnswers = function(answers) {
						setTimeout(function() {
							window.$(".bto_testbox input[type=radio]").prop("checked", function(i) {
								return !!+answers.Rows[i].istrue;
							});
							window.$(".bto_testbox .btn_submit").click();
							window.onclose("ok");
						}, 0);
					};

					window.eval(window.ShowTestPaper.toString().replace(/TestPaperThreelistGet2.*?\n?.*?if\s+\(.*?\b(\w+)\.Rows\.length.*?\)\s*\{/, function(s, dataVarName) {
						return s + "getAnswers(" + dataVarName + ");";
					}));
					window.ShowTestPaper();
				}
			});
		}
	}
	return student;
};
