"use strict";
if (process.env.CI_TEACHER_ACCOUNT) {
	const {ipcRenderer} = require("electron");
	const logger = {};
	Object.keys(console).forEach(fnName => {
		logger[fnName] = function () {
			const args = Array.from(arguments);
			ipcRenderer.send("logger." + fnName, args);
			return console[fnName].apply(console, args);
		};
	});
	module.exports = logger;
} else {
	module.exports = console;
}
