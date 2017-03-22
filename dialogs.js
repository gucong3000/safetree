"use strict";
function thenify(obj) {
	Object.keys(obj).forEach(fnName => {
		const fn = obj[fnName];
		if (typeof fn === "function") {
			obj[fnName] = function() {
				const argv = Array.from(arguments);
				return new Promise(resolve => {
					argv.push(resolve);
					fn.apply(obj, argv);
				});
			};
		}
	});
	return obj;
}

let dialogs;
if (process.env.CI_TEACHER_ACCOUNT) {
	const {ipcRenderer} = require("electron");
	dialogs = {
		prompt: function() {
			const account = atob(process.env.CI_TEACHER_ACCOUNT).split(/\s+/g);
			return Promise.resolve(account[account.length - 1]);
		},
		confirm: function() {
			return Promise.resolve(true);
		},
		alert: function() {
			const arg = Array.from(arguments);
			console.log.apply(console, arg);
			ipcRenderer.send("dialogs.alert", arg);
			return Promise.resolve(true);
		},
	};
} else {
	dialogs = thenify(require("dialogs")({
		ok: "确定",
		cancel: "取消",
	}));

}
module.exports = dialogs;
