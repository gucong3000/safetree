"use strict";
const {
	remote,
} = require("electron");
module.exports = function(src, data) {
	const isDevToolsOpened = remote.getCurrentWebContents().isDevToolsOpened();
	return new Promise((resolve, reject) => {
		const webview = document.createElement("webview");

		webview.addEventListener("dom-ready", () => {
			if (isDevToolsOpened) {
				webview.openDevTools();
			}
		});
		webview.addEventListener("ipc-message", (event) => {
			if (event.channel === "close") {
				kill(event.args && event.args[0]);
			} else if (event.channel === "request-data") {
				webview.send("data", data);
			}
		});
		webview.addEventListener("did-fail-load", ex => {
			kill();
			reject(ex);
		});
		webview.src = src;
		webview.nodeintegration = true;
		webview.disablewebsecurity = true;
		webview.allowpopups = true;
		webview.preload = __dirname + "/task.js";
		webview.style.position = "absolute";
		webview.style.top = 0;
		webview.style.left = 0;
		webview.style.width = "100%";
		webview.style.height = "100%";

		const wrap = document.createElement("div");
		wrap.style.position = "fixed";
		wrap.style.zIndex = 0xff;
		wrap.style.top = "10%";
		wrap.style.left = "10%";
		wrap.style.width = "80%";
		wrap.style.height = "80%";

		const link = document.createElement("a");
		link.href = "#";
		link.innerHTML = "\u{274C}\u{FE0F}";
		link.style.textDecoration = "none";
		link.style.fontSize = "18px";
		link.style.color = "red";
		link.style.position = "absolute";
		link.style.right = "-.5em";
		link.style.top = "-.8em";
		link.onclick = () => {
			kill();
		};

		document.documentElement.style.overflow = "hidden";
		document.documentElement.scrollLeft = 0;
		document.documentElement.scrollTo = 0;
		wrap.appendChild(webview);
		setTimeout(() => {
			wrap.appendChild(link);
		}, 800);
		document.body.appendChild(wrap);

		function kill(data) {
			wrap.style.left = "-500%";
			setTimeout(() => {
				webview.delete();
				document.body.removeChild(wrap);
				resolve(data);
			}, 200);
		}

	});
};
