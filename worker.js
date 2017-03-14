const teacher = require("./teacher");
const student = require("./student");
const dialogs = require("./dialogs");
// document.domain = document.domain.replace(/^.*?(\w+\.com.cn)$/, "$1");
window.$("input[type=password]").attr("value", 123456);

function loop(students) {
	const student = students.pop();
	if (!student) {
		return;
	}
	return student.doWorks().then(() => loop(students));
}

const userName = localStorage.getItem("teacher_user_name") || "";

function teacherLogin() {
	return dialogs.prompt("请输入教师用户名", userName).then(teacher.login).catch(teacherLogin);
}

teacherLogin().then(teacherInfo => {
	console.log("教师登陆成功", teacherInfo.truename);
	return teacher.getStudents();
}).then(students => {
	console.log("学生账号清单", students);
	const select = document.createElement("select");
	Object.keys(students).forEach((name, i) => {
		select.options[i] = new Option(name, students[name]);
	});

	select.onchange = function() {
		Array.from(select.selectedOptions).map(option => student(option.label).login());
	};
	setTimeout(() => {
		document.querySelector(".header-top .header-left").appendChild(select);
	}, 1000);
	return teacher.getWorks();
}).then(works => {
	const unfinishedStudents = Object.keys(works);
	if (unfinishedStudents.length) {
		return dialogs.confirm(`发现${ unfinishedStudents.length }名同学未完作业，是否开始答题？`).then(ok => {
			if (ok) {
				return loop(unfinishedStudents.map(student));
			}
		});
	} else {
		return dialogs.alert("OK, 大家的作业都做完了！");
	}
});
