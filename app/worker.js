"use strict";
const teacher = require("./teacher");
const student = require("./student");
const dialogs = require("./dialogs");
const logger = require("./logger");
const {ipcRenderer} = require("electron");

if (!location.hostname) {
	ipcRenderer.send("worker.finish", 1);
	return;
}

window.$("input[type=password]").attr("value", 123456);
window.$(".system-name").each((i, div) => {
	div.innerHTML = require("./package.json").description;
});
window.$(".wechat-box").hide();

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
			logger.error(ex);
			if (await dialogs.confirm(student.name + "登陆失败，是否重置其密码？")) {
				const result = await student.reset();
				if (result.message) {
					await dialogs.alert(result.message);
				}
				if (result.statusCode >= 200 && result.statusCode < 300) {
					await student.doWorks();
				}
			}
		} else {
			throw ex;
		}
	}
	if (stuOpt) {
		stuOpt.disabled = true;
	}
	return loop(students);
}

const defaultUserName = localStorage.getItem("teacher_user_name");

async function teacherLogin (tryName) {
	let userName;
	if (tryName && location.pathname === "/MainPage.html" && location.hash.length > 1) {
		userName = location.hash.slice(1);
	} else {
		userName = await dialogs.prompt("请输入教师用户名", defaultUserName);
	}
	let teacherInfo;
	try {
		teacherInfo = await teacher.login(userName);
	} catch (error) {
		if (process.env.CI_TEACHER_ACCOUNT || !("userid" in error)) {
			throw error;
		}
		await dialogs.alert(error.message);
		return teacherLogin();
	}
	return worker(teacherInfo);
}

async function worker (teacherInfo) {
	location.hash = "";

	logger.log(`教师 ${teacherInfo.truename}(${teacherInfo.username}) 成功登陆 ${teacherInfo.baseurl}`);
	const students = await teacher.getStudents();
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
	}, 1000);
	stuList = select;
	const works = await teacher.getWorks();
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
}

teacherLogin(true).then(() => {
	ipcRenderer.send("worker.finish", 0);
}, error => {
	logger.error(error);
	ipcRenderer.send("worker.finish", 1);
});
