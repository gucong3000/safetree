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

const dialogs = thenify(require("dialogs")({
	ok: "确定",
	cancel: "取消",
}));

module.exports = dialogs;