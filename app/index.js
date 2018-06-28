"use strict";
const electron = require("electron");
const {
	BrowserWindow,
	ipcMain,
	app,
} = electron;

let mainWindow = null;
let domReadyTimer;

function atob (str) {
	return Buffer.from(str, "base64").toString("binary");
}

function worker (webContents) {
	clearTimeout(domReadyTimer);
	domReadyTimer = setTimeout(() => {
		webContents.executeJavaScript(`require(${JSON.stringify(require.resolve("./worker.js"))})`);
	}, 200);
}

function initializeContents (webContents) {
	webContents.on("dom-ready", e => worker(e.sender));
	webContents.on("new-window", e => initializeContents(e.sender));
	webContents.on("will-navigate", () => clearTimeout(domReadyTimer));
}

function initialize () {
	function createWindow () {
		const windowOptions = {
			width: 1080,
			minWidth: 680,
			height: 840,
			title: app.getName(),
			webPreferences: {
				webSecurity: false,
				images: !process.env.CI,
			},
			show: !process.env.CI,
		};

		mainWindow = new BrowserWindow(windowOptions);

		let city;
		let dev = false;

		process.argv.slice(1).forEach(arg => {
			if (/^\w+$/.test(arg)) {
				city = arg;
			} else if (/^--dev$/.test(arg)) {
				dev = true;
			}
		});

		if (process.env.CI_TEACHER_ACCOUNT) {
			let timerExit;
			let timerReload;

			const resetTimeout = function () {
				clearTimeout(timerExit);
				clearInterval(timerReload);
				// 程序连续3分钟无响应则退出程序
				timerExit = setTimeout(() => {
					console.log("长时间无响应，自动退出程序。");
					app.exit(1);
				}, 180000);
				// 程序连续40秒无响应刷新页面
				timerReload = setInterval(() => {
					mainWindow.reload();
					console.log("长时间无响应，自动刷新页面。");
				}, 40000);
			};

			Object.keys(console).forEach(fnName => {
				ipcMain.on("logger." + fnName, (event, args) => {
					resetTimeout();
					console[fnName].apply(console, args);
				});
			});

			ipcMain.on("dialogs.alert", (event, args) => {
				resetTimeout();
				console.log.apply(console, args);
			});
			ipcMain.on("worker.finish", (event, exitCode) => {
				dev || app.exit(exitCode);
			});
			const account = atob(process.env.CI_TEACHER_ACCOUNT).split(/\s+/g);
			if (!city && !/\d/.test(account[0])) {
				city = account[0];
			}
			resetTimeout();
		}

		if (!city) {
			city = "chengdu";
		}

		if (dev) {
			mainWindow.webContents.openDevTools();
		}

		mainWindow.on("closed", function () {
			mainWindow = null;
		});

		initializeContents(mainWindow.webContents);

		mainWindow.loadURL(`https://${city}.xueanquan.com/`, {
			userAgent: `Mozilla/5.0 (Windows NT 6.4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${process.versions.chrome} Safari/537.36`,
		});
	}

	app.on("ready", function () {
		createWindow();
	});

	app.on("window-all-closed", function () {
		if (process.platform !== "darwin") {
			app.quit();
		}
	});

	app.on("activate", function () {
		if (mainWindow === null) {
			createWindow();
		}
	});
}

initialize();
