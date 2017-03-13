const teacher = require("./teacher");
const student = require("./student");
// document.domain = document.domain.replace(/^.*?(\w+\.com.cn)$/, "$1");
window.$("input[type=password]").attr("value", 123456);

function loop(students) {
	let student = students.pop();
	if (!student) {
		return;
	}
	return student.doWorks().then(() => loop(students));
}

console.log("开始工作啦。");

Promise.all([teacher.getWorks(), teacher.getStudents()]).then(function([works, students]) {
	console.log("学生账号", students);
	const unfinishedStudents = Object.keys(works);
	if (unfinishedStudents.length) {
		return loop(Object.keys(works).map(student));
	} else {
		console.log("OK, 大家的作业都做完了！");
	}
	return;
});
