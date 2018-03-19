"use strict";
const teacher = require("./teacher");
const student = require("./student");
const dialogs = require("./dialogs");
const logger = require("./logger");
const {ipcRenderer} = require("electron");

window.$("input[type=password]").attr("value", 123456);
window.$(".system-name").each((i, div) => {
	div.innerHTML = require("./package.json").description;
});

let stuList;

async function loop (students) {
	logger.log("剩余人数：", students.length);
	const student = students.shift();
	if (!student) {
		return;
	}
	let stuOpt;
	Array.from(stuList.options).some((option, i) => {
		if (option.label === student.name || option.value === student.name) {
			stuOpt = option;
			stuList.selectedIndex = i;
			return option;
		}
	});

	try {
		await student.doWorks();
	} catch (ex) {
		if (ex.userid < 0) {
			// https://zhongshan.safetree.com.cn/EduAdmin/ClassManagement/StudentPassWordReset?studentid=2023012485
			logger.error(ex);
			await dialogs.alert(student.name + "登陆失败，请在教师管理系统中重置该学生的密码。(请在浏览器中操作)");
		} else {
			throw ex;
		}
	}
	if (stuOpt) {
		stuOpt.disabled = true;
	}
	return loop(students);
}

const userName = localStorage.getItem("teacher_user_name") || "";

function teacherLogin () {
	if (location.pathname === "/MainPage.html" && location.hash) {
		const currUserName = location.hash.slice(1);
		location.hash = "";

		return teacher.login(currUserName).catch(() => {
			location.href = location.pathname;
		});
	}

	return dialogs.prompt("请输入教师用户名", userName).then(teacher.login).catch(() => {
		location.reload();
	});
}

teacherLogin().then(teacherInfo => {
	if (teacherInfo && teacherInfo.truename) {
		logger.log(`教师 ${teacherInfo.truename}(${teacherInfo.username}) 成功登陆 ${teacherInfo.baseurl}`);
		return teacher.getStudents();
	} else {
		logger.error(teacherInfo);
		throw teacherInfo;
	}
}).then(students => {
	logger.log("学生账号清单", students, Object.keys(students).length);
	const select = document.createElement("select");
	Object.keys(students).forEach((name, i) => {
		select.options[i] = new Option(name, students[name]);
	});

	// select.onchange = function() {
	// 	Array.from(select.selectedOptions).map(option => student(option.label).login());
	// };

	select.style.position = "absolute";
	select.style.height = "100%";
	select.style.left = 0;
	select.style.top = 0;

	select.multiple = true;
	// select.disabled = true;
	setTimeout(() => {
		document.documentElement.lastChild.appendChild(select);
		window.$(".wechat-box").hide();
	}, 1000);
	stuList = select;
	return teacher.getWorks();
}).then(async works => {
	const unfinishedStudents = Object.keys(works);
	if (unfinishedStudents.length) {
		const ok = await dialogs.confirm(`发现${unfinishedStudents.length}名同学未完作业，是否开始答题？`);
		if (ok) {
			await loop(unfinishedStudents.map(student));
			await dialogs.alert("所有同学的作业都做完了。");
		}
	} else {
		await dialogs.alert("所有同学均已完成作业。");
	}
}).then(() => {
	ipcRenderer.send("worker.finish", 0);
}, error => {
	logger.error(error);
	ipcRenderer.send("worker.finish", 1);
});
