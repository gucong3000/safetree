const {
	remote,
} = require("electron");
module.exports = function(src) {
	let isDevToolsOpened = remote.getCurrentWebContents().isDevToolsOpened();
	return new Promise((resolve, reject) => {
		let webview = document.createElement("webview");
		webview.addEventListener("dom-ready", () => {
			if(isDevToolsOpened) {
				webview.openDevTools();
			}
		});
		webview.addEventListener("ipc-message", (event) => {
			if (event.channel === "close") {
				webview.style.left = "-500%";
				setTimeout(() => {
					resolve(event);
					setTimeout(() => {
						webview.parentNode.removeChild(webview);
					}, 5000);
				}, 1000);
			}
		});
		webview.addEventListener("did-fail-load", reject);
		webview.src = src;
		webview.nodeintegration = true;
		webview.disablewebsecurity = true;
		webview.allowpopups = true;
		webview.preload = __dirname + "/task.js";
		webview.style.position = "fixed";
		webview.style.zIndex = 0xff;
		webview.style.top = 0;
		webview.style.left = 0;
		webview.style.width = "100%";
		webview.style.height = "100%";
		document.documentElement.style.overflow = "hidden";
		document.body.appendChild(webview);
	});
};
