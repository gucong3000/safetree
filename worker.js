const teacher = require('./teacher');
const student = require('./student');

$("input[type=password]").attr("value", 123456)

function loop(students, works) {
	let student = students.pop();
	if(!student) {
		return;
	}
	return student.doWorks(works[student.name]).then(() => loop(students, works))
}

console.log("开始工作啦。");

teacher.getWorks().then(works => {
	return loop(Object.keys(works).map(student), works)
}).catch(ex => {
	console.error(ex);
	window.setTimeout(() => {
		location.reload();
	}, 6000);
});

