const login = require('./login');
const load = require('./load');

module.exports = function (userName) {
	const student = {
		name: userName,
		login: function(password) {
			console.log(userName + "正在登陆。");
			return login(userName, password).then(data => {
				student.data = data
			});
		},
		doWorks: function(works) {
			return student.login().then(() => {
				return Promise.all(works.map(student.doWork));
			});
		},
		doWork: function(url) {
			console.log(student.data.TrueName, url)
			return url;
		}
	}
	return student;
};